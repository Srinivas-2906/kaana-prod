import { nanoid } from 'nanoid';
import { getAll, run } from '../db/query.js';

function parseJson(raw, fallback) {
  if (raw == null) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function logAudit(tenantId, userId, action, entityType, entityId, detail = {}) {
  await run(`
    INSERT INTO audit_log (id, tenant_id, user_id, action, entity_type, entity_id, detail)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [nanoid(12), tenantId, userId || null, action, entityType, entityId || null, JSON.stringify(detail)]);
}

export async function getAuditLog(tenantId, limit = 50) {
  const rows = await getAll(`
    SELECT * FROM audit_log WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?
  `, [tenantId, limit]);
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    detail: parseJson(r.detail, {}),
    createdAt: r.created_at,
  }));
}
