/**
 * Fix Brand Pro topic author → navya-teja9@kaana.in (name + created_by)
 */
import 'dotenv/config';
import { initDatabase, getPool } from '../src/db/index.js';
import {
  ensureBaseSchema,
  ensureM4Schema,
  ensureInviteSchema,
  ensureTopicSchema,
  ensureEngagementSchema,
} from '../src/services/schemaService.js';

const OWNER_EMAIL = 'navya-teja9@kaana.in';
const PROJECT_NAME = 'Influmojo';
const TOPIC_TITLES = [
  'Brand Pro subscription — v1 scope (5 features)',
  'Brand Pro - first version ideas',
];

async function resolveDisplayName(pool, email) {
  const [rows] = await pool.query(
    'SELECT id, name, email, clerk_user_id FROM users WHERE email = ? LIMIT 1',
    [email],
  );
  const user = rows[0];
  if (!user) return null;

  let name = user.name?.trim();
  const generic = !name || name === 'User' || name === email.split('@')[0];

  if (!name || name === 'User') {
    const local = email.split('@')[0].replace(/[._-]+/g, ' ');
    name = local.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (name !== user.name) {
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, user.id]);
    console.log(`Updated user name: "${user.name}" → "${name}" (id ${user.id})`);
  }

  return { ...user, name };
}

async function main() {
  await initDatabase();
  await ensureBaseSchema();
  await ensureM4Schema();
  await ensureInviteSchema();
  await ensureTopicSchema();
  await ensureEngagementSchema();

  const pool = getPool();
  const owner = await resolveDisplayName(pool, OWNER_EMAIL);
  if (!owner) {
    console.error(`User not found: ${OWNER_EMAIL}`);
    process.exit(1);
  }

  const [projects] = await pool.query(
    'SELECT id FROM clusters WHERE name = ? AND created_by = ? LIMIT 1',
    [PROJECT_NAME, owner.id],
  );
  if (!projects[0]) {
    console.error(`Project "${PROJECT_NAME}" not found for ${OWNER_EMAIL}`);
    process.exit(1);
  }

  const projectId = projects[0].id;
  const placeholders = TOPIC_TITLES.map(() => '?').join(', ');
  const [topics] = await pool.query(
    `SELECT id, created_by FROM discussion_topics WHERE project_id = ? AND title IN (${placeholders}) LIMIT 1`,
    [projectId, ...TOPIC_TITLES],
  );
  if (!topics[0]) {
    console.error('Brand Pro topic not found');
    process.exit(1);
  }

  const topicId = topics[0].id;

  if (Number(topics[0].created_by) !== Number(owner.id)) {
    await pool.query('UPDATE discussion_topics SET created_by = ? WHERE id = ?', [owner.id, topicId]);
    console.log(`Reassigned topic ${topicId} created_by → ${owner.id} (${owner.name})`);
  }

  const [discussions] = await pool.query(
    'SELECT id, created_by FROM discussions WHERE topic_id = ? ORDER BY created_at ASC',
    [topicId],
  );

  for (const d of discussions) {
    if (Number(d.created_by) !== Number(owner.id)) {
      await pool.query('UPDATE discussions SET created_by = ? WHERE id = ?', [owner.id, d.id]);
      console.log(`Reassigned message ${d.id} created_by → ${owner.id} (${owner.name})`);
    }
  }

  console.log(`Done. Topic should show as "${owner.name}"`);
  console.log(`Open: https://tracker.kaana.in/projects/${projectId}/updates?topic=${topicId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
