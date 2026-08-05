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
