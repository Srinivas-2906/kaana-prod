#!/usr/bin/env node
/**
 * Migrate all data from legacy SQLite kaana.db → Postgres (botiq-app).
 *
 * Usage:
 *   npm run db:migrate:sqlite -- --source ../botiq-whatsapp-server/data/kaana.db
 *   npm run db:migrate:sqlite -- --source /tmp/kaana.db --dry-run
 *
 * Production (litestream replica):
 *   litestream restore -o /tmp/kaana.db gcs://kaana-prod-db/kaana.db
 *   DATABASE_URL=postgres://... npm run db:migrate:sqlite -- --source /tmp/kaana.db
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const JSON_COLUMNS = new Set([
  'settings', 'products', 'extra', 'score_breakdown', 'notes', 'documents',
  'answers', 'meta', 'tags', 'record_urls', 'detail',
]);

const BOOL_COLUMNS = new Set([
  'is_platform_admin', 'must_change_password', 'is_returning', 'reminder_sent', 'sent_email',
]);

const TABLE_ORDER = [
  'tenants',
  'users',
  'subscriptions',
  'usage',
  'team_members',
  'onboarding_intake',
  'catalog_items',
  'conversations',
  'messages',
  'leads',
  'broadcasts',
  'reminders',
  'api_keys',
  'site_events',
  'platform_notifications',
  'site_leads',
  'patients',
  'appointments',
  'patient_payments',
  'audit_log',
];

function parseArgs(argv) {
  const args = { source: '', dryRun: false, truncate: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--source') args.source = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--truncate') args.truncate = true;
    else if (a === '--help') {
      console.log('Usage: node scripts/migrate-from-sqlite.js --source <kaana.db> [--dry-run] [--truncate]');
      process.exit(0);
    }
  }
  if (!args.source) {
    console.error('Missing --source path to kaana.db (legacy SQLite file)');
    process.exit(1);
  }
  if (!fs.existsSync(args.source)) {
    console.error(`Source not found: ${args.source}`);
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required (Postgres target)');
    process.exit(1);
  }
  return args;
}

function sqliteTableExists(db, name) {
  return !!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(name);
}

function sqliteColumns(db, table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
}

function normalizeValue(col, val) {
  if (val == null) return null;
  if (BOOL_COLUMNS.has(col)) return !!val;
  if (JSON_COLUMNS.has(col)) {
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

function buildUpsert(table, columns, conflictTarget) {
  const keyCols = conflictTarget.includes('(')
    ? conflictTarget.replace(/[()]/g, '').split(',').map((s) => s.trim())
    : [conflictTarget];
  const cols = columns.join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const updates = columns
    .filter((c) => !keyCols.includes(c))
    .map((c) => `${c} = EXCLUDED.${c}`)
    .join(', ');
  return `
    INSERT INTO ${table} (${cols}) VALUES (${placeholders})
    ON CONFLICT ${conflictTarget.includes('(') ? conflictTarget : `(${conflictTarget})`} DO UPDATE SET ${updates}
  `;
}

const CONFLICT_KEYS = {
  tenants: 'id',
  users: 'id',
  subscriptions: 'id',
  usage: '(tenant_id, month)',
  team_members: 'id',
  onboarding_intake: 'tenant_id',
  catalog_items: 'id',
  conversations: 'id',
  messages: 'id',
  leads: 'id',
  broadcasts: 'id',
  reminders: 'id',
  api_keys: 'id',
  site_events: 'id',
  platform_notifications: 'id',
  site_leads: 'id',
  patients: 'id',
  appointments: 'id',
  patient_payments: 'id',
  audit_log: 'id',
};

async function pgColumns(pool, table) {
  const { rows } = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  );
  return rows.map((r) => r.column_name);
}

async function migrateTable(sqlite, pool, table, { dryRun }) {
  if (!sqliteTableExists(sqlite, table)) {
    console.log(`  skip ${table} (missing in SQLite)`);
    return 0;
  }

  const srcCols = sqliteColumns(sqlite, table);
  const tgtCols = await pgColumns(pool, table);
  const shared = srcCols.filter((c) => tgtCols.includes(c));
  if (!shared.length) {
    console.log(`  skip ${table} (no shared columns)`);
    return 0;
  }

  const rows = sqlite.prepare(`SELECT ${shared.join(', ')} FROM ${table}`).all();
  if (!rows.length) return 0;

  const conflict = CONFLICT_KEYS[table];
  if (!conflict) {
    console.log(`  skip ${table} (no conflict key defined)`);
    return 0;
  }

  const sql = buildUpsert(table, shared, conflict);
  if (dryRun) {
    console.log(`  ${table}: ${rows.length} rows (dry-run)`);
    return rows.length;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      const values = shared.map((c) => normalizeValue(c, row[c]));
      await client.query(sql, values);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  console.log(`  ${table}: ${rows.length} rows`);
  return rows.length;
}

async function resetSequences(pool) {
  await pool.query(`
    SELECT setval(pg_get_serial_sequence('leads', 'id'),
      COALESCE((SELECT MAX(id) FROM leads), 1))
  `);
}

async function main() {
  const args = parseArgs(process.argv);
  console.log('\nSQLite → Postgres migration');
  console.log(`  source: ${args.source}`);
  console.log(`  target: ${process.env.DATABASE_URL.replace(/:[^:@/]+@/, ':***@')}`);
  if (args.dryRun) console.log('  mode:   DRY RUN');
  if (args.truncate) console.log('  mode:   TRUNCATE before import\n');

  const sqlite = new Database(args.source, { readonly: true });
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  try {
    if (args.truncate && !args.dryRun) {
      console.log('\nTruncating tables (reverse FK order)...');
      for (const table of [...TABLE_ORDER].reverse()) {
        await pool.query(`TRUNCATE TABLE ${table} CASCADE`).catch(() => {});
      }
    }

    console.log('\nCopying tables...');
    let total = 0;
    for (const table of TABLE_ORDER) {
      total += await migrateTable(sqlite, pool, table, { dryRun: args.dryRun });
    }

    if (!args.dryRun) {
      await resetSequences(pool);
    }

    console.log(`\nDone — ${total} rows migrated.\n`);
  } finally {
    sqlite.close();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
