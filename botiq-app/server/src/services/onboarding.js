import { nanoid } from 'nanoid';
import { getOne, getAll, run } from '../db/query.js';

function parseJson(raw, fallback) {
  if (raw == null) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function createIntake(tenantId) {
  const existing = await getOne('SELECT id FROM onboarding_intake WHERE tenant_id = ?', [tenantId]);
  if (existing) return existing.id;
  const id = nanoid();
  await run(`
    INSERT INTO onboarding_intake (id, tenant_id, status, answers, step)
    VALUES (?, ?, 'draft', '{}', 0)
  `, [id, tenantId]);
  return id;
}

export async function getIntake(tenantId) {
  return getOne('SELECT * FROM onboarding_intake WHERE tenant_id = ?', [tenantId]);
}

export async function saveIntake(tenantId, { answers, step, submit = false }) {
  await createIntake(tenantId);
  const existing = await getIntake(tenantId);
  const wasSubmitted = existing?.status === 'submitted' || existing?.status === 'reviewed';
  const status = submit ? 'submitted' : (wasSubmitted ? existing.status : 'draft');
  const submittedAt = submit ? new Date().toISOString() : null;
  await run(`
    UPDATE onboarding_intake SET answers = ?, step = ?, status = ?,
      submitted_at = COALESCE(?, submitted_at), updated_at = datetime('now')
    WHERE tenant_id = ?
  `, [JSON.stringify(answers ?? {}), step ?? 0, status, submittedAt, tenantId]);
  return await getIntake(tenantId);
}

export function parseIntakeRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    status: row.status,
    step: row.step,
    answers: parseJson(row.answers, {}),
    submittedAt: row.submitted_at,
    adminNotes: row.admin_notes,
    updatedAt: row.updated_at,
  };
}

export async function getIntakeForTenant(tenantId) {
  return parseIntakeRow(await getIntake(tenantId));
}

export async function listPendingIntakes() {
  const rows = await getAll(`
    SELECT i.*, t.name as tenant_name, t.industry, t.slug
    FROM onboarding_intake i
    JOIN tenants t ON t.id = i.tenant_id
    WHERE t.status = 'pending_onboarding'
    ORDER BY CASE WHEN i.submitted_at IS NULL THEN 1 ELSE 0 END, i.submitted_at DESC, i.updated_at DESC
  `);
  return rows.map((r) => ({ ...parseIntakeRow(r), tenantName: r.tenant_name, industry: r.industry, slug: r.slug }));
}

export async function setIntakeAdminNotes(tenantId, notes) {
  await run(`
    UPDATE onboarding_intake SET admin_notes = ?, updated_at = datetime('now') WHERE tenant_id = ?
  `, [notes, tenantId]);
}
