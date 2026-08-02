import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { closePool, exec, getOne } from './src/db/query.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function main() {
  await exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const id = file.replace(/\.sql$/, '');
    const applied = await getOne('SELECT id FROM schema_migrations WHERE id = ?', [id]);
    if (applied) {
      console.log(`⏭  Already applied: ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    await exec(sql);
    await exec(`INSERT INTO schema_migrations (id) VALUES ('${id}')`);
    console.log(`✅ Applied: ${file}`);
  }

  await closePool();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
