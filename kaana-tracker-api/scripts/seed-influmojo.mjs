/**
 * One-off seed: Influmojo project + stories for navya-teja9@kaana.in
 *
 * Usage (with Cloud SQL Auth Proxy on port 3307):
 *   DB_HOST=127.0.0.1 DB_PORT=3307 DB_USER=tracker DB_PASS=... DB_NAME=expense_tracker \
 *     node scripts/seed-influmojo.mjs
 */
import 'dotenv/config';
import { createClerkClient } from '@clerk/backend';
import { initDatabase, getPool } from '../src/db/index.js';
import { ensureBaseSchema, ensureM4Schema, ensureInviteSchema } from '../src/services/schemaService.js';
import { createProject } from '../src/services/projectService.js';
import { createWorkItem } from '../src/services/workItemService.js';

const CLERK_PASSWORD_PLACEHOLDER = '$2a$10$clerk.nopassword.kaana.tracker.placeholder';

const OWNER_EMAIL = 'navya-teja9@kaana.in';
const PROJECT = {
  name: 'Influmojo',
  description: 'Influmojo product launch — mobile app, payments, referrals, and admin readiness.',
  color: '#8b5cf6',
};

const STORIES = [
  {
    title: 'App store deployment',
    description:
      'Prepare and submit the Influmojo mobile app to Apple App Store and Google Play Store. Includes build signing, store listings, screenshots, privacy policy links, review notes, and post-submission monitoring until approved.',
    acceptance_criteria:
      'Production builds uploaded to both stores; listing assets complete; app passes review and is available for download.',
  },
  {
    title: 'Application End-to-End testing',
    description:
      'Run full end-to-end test coverage across critical user journeys: signup/login, onboarding, core features, payments, referrals, and error handling on iOS and Android.',
    acceptance_criteria:
      'Test plan executed; blocking defects logged and triaged; smoke suite green on staging and production-like environment.',
  },
  {
    title: 'Razorpay live integration',
    description:
      'Switch from Razorpay test mode to live mode: configure live API keys, webhooks, settlement accounts, payment flows, refunds, and verify transactions in production.',
    acceptance_criteria:
      'Live Razorpay keys configured securely; successful live payment and webhook verification; finance reconciliation documented.',
  },
  {
    title: 'Referral mobile deeplink',
    description:
      'Implement and validate referral deep links on mobile so invited users land in the correct screen with referral attribution preserved across install and first open.',
    acceptance_criteria:
      'Deep links work on iOS/Android (cold start + warm start); referral code captured and stored; analytics events fire for invite open and conversion.',
  },
  {
    title: 'Admin dashboard testing',
    description:
      'Test the admin dashboard end-to-end: user management, content moderation, referral reporting, payment visibility, and role-based access for support/ops teams.',
    acceptance_criteria:
      'Admin roles verified; core admin workflows pass QA; access restrictions enforced; issues filed for any gaps.',
  },
  {
    title: 'Application live',
    description:
      'Take the Influmojo application live in production: final release build, production environment configuration, DNS/domain cutover, smoke checks, monitoring and alerting, rollback plan, and post-launch verification with stakeholders.',
    acceptance_criteria:
      'Production app accessible to users; health checks and monitoring active; launch checklist signed off; critical flows verified live; rollback procedure documented.',
  },
];

async function findUserId(email) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT id, name, email FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function ensureUser(email) {
  const existing = await findUserId(email);
  if (existing) return existing;

  const clerkSecret = process.env.CLERK_SECRET_KEY;
  if (!clerkSecret) {
    throw new Error(`User not found: ${email}. Set CLERK_SECRET_KEY to auto-create from Clerk.`);
  }

  const clerk = createClerkClient({ secretKey: clerkSecret });
  const { data: users } = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
  const clerkUser = users[0];
  if (!clerkUser) {
    throw new Error(`User not found in Clerk or Tracker DB: ${email}`);
  }

  const pool = getPool();
  const [byClerk] = await pool.query(
    'SELECT id, name, email FROM users WHERE clerk_user_id = ? LIMIT 1',
    [clerkUser.id],
  );
  if (byClerk[0]) {
    if (byClerk[0].email !== email) {
      await pool.query('UPDATE users SET email = ? WHERE id = ?', [email, byClerk[0].id]);
      console.log(`Updated email for user id ${byClerk[0].id} → ${email}`);
      return { ...byClerk[0], email };
    }
    return byClerk[0];
  }

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ')
    || email.split('@')[0];
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, clerk_user_id) VALUES (?, ?, ?, ?)',
    [name, email, CLERK_PASSWORD_PLACEHOLDER, clerkUser.id],
  );
  console.log(`Created Tracker user for ${email} (id ${result.insertId})`);
  return { id: result.insertId, name, email };
}

async function projectExists(name, userId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id FROM clusters WHERE name = ? AND created_by = ? LIMIT 1',
    [name, userId],
  );
  return rows[0]?.id || null;
}

async function main() {
  await initDatabase();
  await ensureBaseSchema();
  await ensureM4Schema();
  await ensureInviteSchema();

  const user = await ensureUser(OWNER_EMAIL);
  if (!user) {
    console.error(`User not found: ${OWNER_EMAIL}. Sign in to Tracker once so Clerk creates the account.`);
    process.exit(1);
  }

  console.log(`Owner: ${user.name} <${user.email}> (id ${user.id})`);

  let projectId = await projectExists(PROJECT.name, user.id);
  if (projectId) {
    console.log(`Project "${PROJECT.name}" already exists (id ${projectId}). Adding any missing stories…`);
  } else {
    const { name, description, color } = PROJECT;
    const project = await createProject({ name, description, color }, user.id);
    projectId = project.id;
    console.log(`Created project "${project.name}" (id ${projectId})`);
  }

  const pool = getPool();
  const [existing] = await pool.query(
    'SELECT title FROM work_items WHERE cluster_id = ? AND item_type = ?',
    [projectId, 'story'],
  );
  const existingTitles = new Set(existing.map((r) => r.title));

  for (const story of STORIES) {
    if (existingTitles.has(story.title)) {
      console.log(`  skip (exists): ${story.title}`);
      continue;
    }
    const result = await createWorkItem(
      {
        cluster_id: projectId,
        title: story.title,
        description: story.description,
        acceptance_criteria: story.acceptance_criteria,
        item_type: 'story',
        status: 'backlog',
        priority: 'medium',
      },
      user.id,
    );
    if (result.errors?.length) {
      console.error(`  failed: ${story.title}`, result.errors);
      continue;
    }
    console.log(`  created story #${result.item.id}: ${story.title}`);
  }

  console.log(`\nDone. Open https://tracker.kaana.in/projects/${projectId}/board`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
