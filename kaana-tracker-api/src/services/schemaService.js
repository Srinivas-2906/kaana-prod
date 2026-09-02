import { getPool } from '../db/index.js';

let baseDone = false;
let planDone = false;
let m2Done = false;
let m3Done = false;

async function runAlters(alters) {
  const pool = getPool();
  for (const sql of alters) {
    try {
      await pool.query(sql);
    } catch {
      // column/table likely exists
    }
  }
}

async function runCreates(creates) {
  const pool = getPool();
  for (const sql of creates) {
    try {
      await pool.query(sql);
    } catch (e) {
      console.warn('Schema create warning:', e.message);
    }
  }
}

/** Core PHP-era tables — required before M2/M3 migrations on fresh Cloud SQL */
export async function ensureBaseSchema() {
  if (baseDone) return;

  await runCreates([
    `CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS transactions (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      type ENUM('income', 'expense') NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT,
      transaction_date DATE NOT NULL,
      payment_method ENUM('UPI', 'Cash', 'Bank Transfer', 'Card') NOT NULL DEFAULT 'UPI',
      paid_by ENUM('Company', 'Kaana', 'Partner') NOT NULL DEFAULT 'Company',
      created_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_type (type),
      INDEX idx_category (category),
      INDEX idx_transaction_date (transaction_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS clusters (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      color VARCHAR(20) NOT NULL DEFAULT '#3b82f6',
      created_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS work_items (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      cluster_id INT UNSIGNED NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      item_type ENUM('task', 'story', 'work', 'idea') NOT NULL DEFAULT 'task',
      status ENUM('backlog', 'todo', 'in_progress', 'review', 'done') NOT NULL DEFAULT 'backlog',
      priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
      due_date DATE NULL,
      start_date DATE NULL,
      source_note_id INT UNSIGNED NULL,
      created_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_due_date (due_date),
      INDEX idx_cluster (cluster_id),
      INDEX idx_item_type (item_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS whiteboards (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT,
      created_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS whiteboard_notes (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      whiteboard_id INT UNSIGNED NOT NULL,
      content TEXT NOT NULL,
      color VARCHAR(20) NOT NULL DEFAULT '#fef08a',
      pos_x INT NOT NULL DEFAULT 40,
      pos_y INT NOT NULL DEFAULT 40,
      width INT NOT NULL DEFAULT 200,
      height INT NOT NULL DEFAULT 140,
      created_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS discussions (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      entity_type VARCHAR(30) NOT NULL,
      entity_id INT UNSIGNED NULL,
      content TEXT NOT NULL,
      created_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_entity (entity_type, entity_id),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ]);

  baseDone = true;
}

export async function ensurePlanSchema() {
  if (planDone) return;
  await ensureBaseSchema();
  await runAlters([
    'ALTER TABLE whiteboard_notes ADD COLUMN scheduled_date DATE NULL AFTER height',
    'ALTER TABLE work_items ADD COLUMN source_note_id INT UNSIGNED NULL AFTER start_date',
  ]);
  planDone = true;
}

export async function ensureM2Schema() {
  if (m2Done) return;
  await ensurePlanSchema();

  await runAlters([
    'ALTER TABLE work_items ADD COLUMN parent_id INT UNSIGNED NULL AFTER cluster_id',
    'ALTER TABLE work_items ADD COLUMN idea_stage VARCHAR(30) NULL AFTER item_type',
    'ALTER TABLE work_items ADD COLUMN owner_id INT UNSIGNED NULL AFTER created_by',
    'ALTER TABLE clusters ADD COLUMN objective TEXT NULL AFTER description',
    'ALTER TABLE whiteboards ADD COLUMN cluster_id INT UNSIGNED NULL AFTER description',
  ]);

  const pool = getPool();
  const creates = [
    `CREATE TABLE IF NOT EXISTS activity_events (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      event_type VARCHAR(60) NOT NULL,
      entity_type VARCHAR(30) NOT NULL,
      entity_id INT UNSIGNED NULL,
      project_id INT UNSIGNED NULL,
      actor_id INT UNSIGNED NOT NULL,
      summary VARCHAR(500) NOT NULL,
      payload JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_project (project_id),
      INDEX idx_entity (entity_type, entity_id),
      INDEX idx_created (created_at),
      INDEX idx_event_type (event_type),
      FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS journal_entries (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      entry_date DATE NOT NULL,
      project_id INT UNSIGNED NULL,
      author_id INT UNSIGNED NOT NULL,
      content TEXT NOT NULL,
      blockers TEXT NULL,
      learnings TEXT NULL,
      next_steps TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_entry_date (entry_date),
      INDEX idx_project (project_id),
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
      FOREIGN KEY (project_id) REFERENCES clusters(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS project_members (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      project_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      role ENUM('owner', 'manager', 'contributor', 'viewer') NOT NULL DEFAULT 'contributor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_project_user (project_id, user_id),
      FOREIGN KEY (project_id) REFERENCES clusters(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS entity_links (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      source_type VARCHAR(30) NOT NULL,
      source_id INT UNSIGNED NOT NULL,
      target_type VARCHAR(30) NOT NULL,
      target_id INT UNSIGNED NOT NULL,
      link_type ENUM('derived_from', 'belongs_to', 'contributed_to', 'related', 'supersedes') NOT NULL DEFAULT 'related',
      created_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_source (source_type, source_id),
      INDEX idx_target (target_type, target_id),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS decisions (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      project_id INT UNSIGNED NULL,
      title VARCHAR(200) NOT NULL,
      rationale TEXT NULL,
      status ENUM('proposed', 'approved', 'superseded', 'rejected') NOT NULL DEFAULT 'proposed',
      decided_at DATE NULL,
      work_item_id INT UNSIGNED NULL,
      created_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_project (project_id),
      INDEX idx_status (status),
      FOREIGN KEY (project_id) REFERENCES clusters(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS entity_versions (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      entity_type VARCHAR(30) NOT NULL,
      entity_id INT UNSIGNED NOT NULL,
      field_name VARCHAR(60) NOT NULL,
      old_value TEXT NULL,
      new_value TEXT NULL,
      actor_id INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_entity (entity_type, entity_id),
      INDEX idx_created (created_at),
      FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS reminders (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      notes TEXT NULL,
      reminder_date DATE NOT NULL,
      reminder_time TIME NULL,
      project_id INT UNSIGNED NULL,
      work_item_id INT UNSIGNED NULL,
      created_by INT UNSIGNED NOT NULL,
      completed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_reminder_date (reminder_date),
      INDEX idx_project (project_id),
      FOREIGN KEY (project_id) REFERENCES clusters(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const sql of creates) {
    try {
      await pool.query(sql);
    } catch (e) {
      console.warn('Schema create warning:', e.message);
    }
  }

  m2Done = true;
}

export async function ensureM3Schema() {
  if (m3Done) return;
  await ensureM2Schema();

  await runAlters([
    'ALTER TABLE work_items ADD COLUMN acceptance_criteria TEXT NULL AFTER description',
    'ALTER TABLE work_items ADD COLUMN implementation_notes TEXT NULL AFTER acceptance_criteria',
    'ALTER TABLE work_items ADD COLUMN story_points SMALLINT UNSIGNED NULL AFTER priority',
    'ALTER TABLE transactions ADD COLUMN project_id INT UNSIGNED NULL AFTER created_by',
  ]);

  const pool = getPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        entity_type VARCHAR(30) NOT NULL,
        entity_id INT UNSIGNED NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(120) NOT NULL,
        file_size INT UNSIGNED NOT NULL,
        storage_path VARCHAR(500) NOT NULL,
        uploaded_by INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_entity (entity_type, entity_id),
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn('Schema create warning:', e.message);
  }

  m3Done = true;
}

let m4Done = false;

export async function ensureM4Schema() {
  if (m4Done) return;
  await ensureM3Schema();

  await runAlters([
    'ALTER TABLE work_items ADD COLUMN content_sections JSON NULL AFTER implementation_notes',
  ]);

  m4Done = true;
}

let inviteDone = false;

export async function ensureInviteSchema() {
  if (inviteDone) return;
  await ensureM2Schema();

  const pool = getPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_invites (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        project_id INT UNSIGNED NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        role ENUM('viewer', 'contributor', 'manager') NOT NULL DEFAULT 'contributor',
        created_by INT UNSIGNED NOT NULL,
        expires_at TIMESTAMP NULL,
        max_uses INT UNSIGNED NULL DEFAULT 1,
        use_count INT UNSIGNED NOT NULL DEFAULT 0,
        revoked_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_project (project_id),
        INDEX idx_token (token),
        FOREIGN KEY (project_id) REFERENCES clusters(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn('Schema create warning:', e.message);
  }

  await pool.query(`
    INSERT IGNORE INTO project_members (project_id, user_id, role)
    SELECT c.id, c.created_by, 'owner'
    FROM clusters c
    WHERE NOT EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = c.id AND pm.user_id = c.created_by
    )
  `);

  await runAlters([
    'ALTER TABLE project_invites ADD COLUMN invitee_email VARCHAR(150) NULL AFTER role',
    'ALTER TABLE project_invites ADD COLUMN status ENUM(\'pending\',\'accepted\',\'revoked\') NOT NULL DEFAULT \'pending\' AFTER invitee_email',
    'ALTER TABLE project_invites ADD COLUMN accepted_at TIMESTAMP NULL AFTER use_count',
    'ALTER TABLE project_invites ADD COLUMN accepted_by INT UNSIGNED NULL AFTER accepted_at',
    'ALTER TABLE project_invites ADD INDEX idx_invitee_email (invitee_email)',
  ]);

  inviteDone = true;
}

let clerkDone = false;

export async function ensureClerkSchema() {
  if (clerkDone) return;
  await ensureBaseSchema();
  await runAlters([
    'ALTER TABLE users ADD COLUMN clerk_user_id VARCHAR(64) NULL UNIQUE AFTER email',
  ]);
  clerkDone = true;
}

let topicDone = false;

export async function ensureTopicSchema() {
  if (topicDone) return;
  await ensureInviteSchema();

  const pool = getPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discussion_topics (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        project_id INT UNSIGNED NOT NULL,
        title VARCHAR(200) NOT NULL,
        status ENUM('open', 'answered', 'closed') NOT NULL DEFAULT 'open',
        work_item_id INT UNSIGNED NULL,
        created_by INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_project (project_id),
        INDEX idx_status (status),
        FOREIGN KEY (project_id) REFERENCES clusters(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn('Schema create warning:', e.message);
  }

  await runAlters([
    'ALTER TABLE discussions ADD COLUMN topic_id INT UNSIGNED NULL AFTER entity_id',
    'ALTER TABLE discussions ADD INDEX idx_topic (topic_id)',
    'ALTER TABLE discussions MODIFY entity_type VARCHAR(30) NOT NULL',
    'ALTER TABLE discussion_topics ADD CONSTRAINT fk_topic_work_item FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE SET NULL',
  ]);

  topicDone = true;
}

let engagementDone = false;

export async function ensureEngagementSchema() {
  if (engagementDone) return;
  await ensureTopicSchema();

  await runCreates([
    `CREATE TABLE IF NOT EXISTS topic_read_state (
      user_id INT UNSIGNED NOT NULL,
      topic_id INT UNSIGNED NOT NULL,
      last_read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_read_discussion_id INT UNSIGNED NULL,
      PRIMARY KEY (user_id, topic_id),
      INDEX idx_topic (topic_id),
      FOREIGN KEY (topic_id) REFERENCES discussion_topics(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ]);

  engagementDone = true;
}

let funDone = false;

export async function ensureFunSchema() {
  if (funDone) return;
  await ensureEngagementSchema();

  await runAlters([
    'ALTER TABLE clusters ADD COLUMN vibe_emoji VARCHAR(16) NULL',
    'ALTER TABLE clusters ADD COLUMN vibe_message VARCHAR(120) NULL',
  ]);

  await runCreates([
    `CREATE TABLE IF NOT EXISTS discussion_reactions (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      discussion_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      emoji VARCHAR(16) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_discussion_reaction (discussion_id, user_id, emoji),
      INDEX idx_discussion (discussion_id),
      FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ]);

  funDone = true;
}

let editDone = false;

export async function ensureEditSchema() {
  if (editDone) return;
  await ensureFunSchema();

  await runAlters([
    'ALTER TABLE discussions ADD COLUMN edited_at TIMESTAMP NULL',
    'ALTER TABLE discussion_topics ADD COLUMN title_edited_at TIMESTAMP NULL',
    'ALTER TABLE users ADD COLUMN name_customized TINYINT(1) NOT NULL DEFAULT 0',
  ]);

  editDone = true;
}

let proDone = false;

/** Industry features: notifications, diagram whiteboards */
export async function ensureProSchema() {
  if (proDone) return;
  await ensureEditSchema();

  await runAlters([
    "ALTER TABLE whiteboards ADD COLUMN board_type ENUM('sticky', 'diagram') NOT NULL DEFAULT 'sticky'",
    'ALTER TABLE whiteboards ADD COLUMN scene_json LONGTEXT NULL',
  ]);

  await runCreates([
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      type VARCHAR(40) NOT NULL,
      title VARCHAR(200) NOT NULL,
      body TEXT NULL,
      link VARCHAR(500) NULL,
      read_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_unread (user_id, read_at),
      INDEX idx_user_created (user_id, created_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ]);

  proDone = true;
}

let phase2Done = false;

/** Sprints, labels, project keys, epics */
export async function ensurePhase2Schema() {
  if (phase2Done) return;
  await ensureProSchema();

  await runAlters([
    'ALTER TABLE clusters ADD COLUMN project_key VARCHAR(12) NULL',
    'ALTER TABLE work_items ADD COLUMN sprint_id INT UNSIGNED NULL',
  ]);

  await runCreates([
    `CREATE TABLE IF NOT EXISTS sprints (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      project_id INT UNSIGNED NOT NULL,
      name VARCHAR(100) NOT NULL,
      goal TEXT NULL,
      start_date DATE NULL,
      end_date DATE NULL,
      status ENUM('planning', 'active', 'closed') NOT NULL DEFAULT 'planning',
      created_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_project (project_id),
      INDEX idx_status (status),
      FOREIGN KEY (project_id) REFERENCES clusters(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS labels (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      project_id INT UNSIGNED NOT NULL,
      name VARCHAR(40) NOT NULL,
      color VARCHAR(20) NOT NULL DEFAULT '#64748b',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_project_label (project_id, name),
      FOREIGN KEY (project_id) REFERENCES clusters(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS work_item_labels (
      work_item_id INT UNSIGNED NOT NULL,
      label_id INT UNSIGNED NOT NULL,
      PRIMARY KEY (work_item_id, label_id),
      FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE CASCADE,
      FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ]);

  phase2Done = true;
}

let financeDone = false;

/** Extended ledger, project finance settings */
export async function ensureFinanceSchema() {
  if (financeDone) return;
  await ensurePhase2Schema();

  await runAlters([
    "ALTER TABLE transactions ADD COLUMN ledger_type ENUM('expense','income','capital_contribution','reimbursement','withdrawal','distribution') NULL AFTER type",
    "ALTER TABLE transactions ADD COLUMN partner_user_id INT UNSIGNED NULL AFTER paid_by",
    "ALTER TABLE transactions ADD COLUMN funding_source ENUM('company_account','partner_personal','legacy_unknown') NOT NULL DEFAULT 'legacy_unknown' AFTER partner_user_id",
    "ALTER TABLE transactions ADD COLUMN linked_transaction_id INT UNSIGNED NULL AFTER funding_source",
    "ALTER TABLE transactions ADD COLUMN status ENUM('active','void') NOT NULL DEFAULT 'active' AFTER linked_transaction_id",
    "ALTER TABLE transactions ADD COLUMN currency CHAR(3) NOT NULL DEFAULT 'INR' AFTER status",
    "ALTER TABLE transactions ADD COLUMN reimbursable TINYINT(1) NOT NULL DEFAULT 0 AFTER currency",
    "ALTER TABLE transactions ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_at",
    'ALTER TABLE clusters ADD COLUMN currency CHAR(3) NOT NULL DEFAULT \'INR\'',
    'ALTER TABLE clusters ADD COLUMN financial_start_date DATE NULL',
    'ALTER TABLE clusters ADD COLUMN economic_break_even_enabled TINYINT(1) NOT NULL DEFAULT 0',
    'ALTER TABLE clusters ADD COLUMN capital_adjustment_rate DECIMAL(8,6) NULL',
    'ALTER TABLE clusters ADD COLUMN revenue_target DECIMAL(14,2) NULL',
  ]);

  const pool = getPool();

  // Backfill ledger_type from legacy type column
  await pool.query(`
    UPDATE transactions SET ledger_type = type WHERE ledger_type IS NULL
  `).catch(() => {});

  // Backfill funding_source from paid_by
  await pool.query(`
    UPDATE transactions SET funding_source = 'company_account' WHERE paid_by = 'Company' AND funding_source = 'legacy_unknown'
  `).catch(() => {});
  await pool.query(`
    UPDATE transactions SET funding_source = 'partner_personal' WHERE paid_by IN ('Kaana', 'Partner') AND funding_source = 'legacy_unknown'
  `).catch(() => {});

  // Default financial_start_date from created_at for projects
  await pool.query(`
    UPDATE clusters SET financial_start_date = DATE(created_at) WHERE financial_start_date IS NULL
  `).catch(() => {});

  financeDone = true;
}

let onboardingDone = false;

/** User onboarding state for founder first-run wizard */
export async function ensureOnboardingSchema() {
  if (onboardingDone) return;
  await ensureFinanceSchema();

  await runAlters([
    'ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMP NULL',
    'ALTER TABLE users ADD COLUMN onboarding_project_id INT UNSIGNED NULL',
  ]);

  const pool = getPool();

  // Existing users with any project involvement are already onboarded
  await pool.query(`
    UPDATE users SET onboarding_completed_at = COALESCE(onboarding_completed_at, NOW())
    WHERE onboarding_completed_at IS NULL
      AND (
        id IN (SELECT created_by FROM clusters)
        OR id IN (SELECT user_id FROM project_members)
      )
  `).catch(() => {});

  onboardingDone = true;
}
