/**
 * Set display name for a user by email (production one-off)
 * Usage: node scripts/set-user-display-name.mjs navya-teja9@kaana.in Navya
 */
import 'dotenv/config';
import { initDatabase, getPool } from '../src/db/index.js';
import { ensureBaseSchema, ensureEditSchema } from '../src/services/schemaService.js';

const email = process.argv[2];
const name = process.argv[3];

if (!email || !name) {
  console.error('Usage: node scripts/set-user-display-name.mjs <email> <name>');
  process.exit(1);
}

async function main() {
  await initDatabase();
  await ensureBaseSchema();
  await ensureEditSchema();

  const pool = getPool();
  const [rows] = await pool.query('SELECT id, name FROM users WHERE email = ? LIMIT 1', [email]);
  if (!rows[0]) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  await pool.query(
    'UPDATE users SET name = ?, name_customized = 1 WHERE id = ?',
    [name.trim(), rows[0].id],
  );

  console.log(`Updated ${email}: "${rows[0].name}" → "${name.trim()}" (id ${rows[0].id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
