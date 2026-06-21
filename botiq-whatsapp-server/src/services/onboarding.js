import { getDb } from '../db/index.js';
import { nanoid } from 'nanoid';

export function createIntake(tenantId) {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM onboarding_intake WHERE tenant_id = ?').get(tenantId);
  if (existing) return existing.id;
  const id = nanoid();
  db.prepare(`
    INSERT INTO onboarding_intake (id, tenant_id, status, answers, step)
    VALUES (?, ?, 'draft', '{}', 0)
  `).run(id, tenantId);
  return id;
}

export function getIntake(tenantId) {
  return getDb().prepare('SELECT * FROM onboarding_intake WHERE tenant_id = ?').get(tenantId);
}

export function saveIntake(tenantId, { answers, step, submit = false }) {
  const db = getDb();
  createIntake(tenantId);
  const existing = getIntake(tenantId);
  const wasSubmitted = existing?.status === 'submitted' || existing?.status === 'reviewed';
  const status = submit ? 'submitted' : (wasSubmitted ? existing.status : 'draft');
  const submittedAt = submit ? new Date().toISOString() : null;
  db.prepare(`
    UPDATE onboarding_intake SET answers = ?, step = ?, status = ?,
      submitted_at = COALESCE(?, submitted_at), updated_at = datetime('now')
    WHERE tenant_id = ?
  `).run(JSON.stringify(answers ?? {}), step ?? 0, status, submittedAt, tenantId);
  return getIntake(tenantId);
}

export function parseIntakeRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    status: row.status,
    step: row.step,
    answers: JSON.parse(row.answers || '{}'),
    submittedAt: row.submitted_at,
    adminNotes: row.admin_notes,
    updatedAt: row.updated_at,
  };
}

export function getIntakeForTenant(tenantId) {
  return parseIntakeRow(getIntake(tenantId));
}

export function listPendingIntakes() {
  const rows = getDb().prepare(`
    SELECT i.*, t.name as tenant_name, t.industry, t.slug
    FROM onboarding_intake i
    JOIN tenants t ON t.id = i.tenant_id
    WHERE t.status = 'pending_onboarding'
    ORDER BY CASE WHEN i.submitted_at IS NULL THEN 1 ELSE 0 END, i.submitted_at DESC, i.updated_at DESC
  `).all();
  return rows.map((r) => ({ ...parseIntakeRow(r), tenantName: r.tenant_name, industry: r.industry, slug: r.slug }));
}

export function setIntakeAdminNotes(tenantId, notes) {
  getDb().prepare(`
    UPDATE onboarding_intake SET admin_notes = ?, updated_at = datetime('now') WHERE tenant_id = ?
  `).run(notes, tenantId);
}
