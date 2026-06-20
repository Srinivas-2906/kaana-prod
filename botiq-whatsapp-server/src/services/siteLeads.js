import { nanoid } from 'nanoid';
import { getDb } from '../db/index.js';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'signed_up', 'lost'];

export function saveSiteLead({ name, phone, source = 'homepage', path = '/', meta = {} }) {
  const db = getDb();
  const id = nanoid();
  db.prepare(`
    INSERT INTO site_leads (id, name, phone, source, path, meta, status)
    VALUES (?, ?, ?, ?, ?, ?, 'new')
  `).run(
    id,
    String(name).trim().slice(0, 120),
    String(phone).trim().slice(0, 32),
    String(source).slice(0, 64),
    String(path).slice(0, 500),
    JSON.stringify(meta),
  );
  return { id, name, phone, source, path, status: 'new' };
}

function parseLeadRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    source: row.source,
    path: row.path,
    status: row.status || 'new',
    adminNotes: row.admin_notes || '',
    contactedAt: row.contacted_at,
    createdAt: row.created_at,
  };
}

export function listSiteLeadsForAdmin(limit = 100) {
  return getDb().prepare(`
    SELECT id, name, phone, source, path, status, admin_notes, contacted_at, created_at
    FROM site_leads
    ORDER BY
      CASE status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 ELSE 2 END,
      created_at DESC
    LIMIT ?
  `).all(limit).map(parseLeadRow);
}

export function getSiteLead(id) {
  const row = getDb().prepare('SELECT * FROM site_leads WHERE id = ?').get(id);
  return parseLeadRow(row);
}

export function updateSiteLead(id, { status, adminNotes, markContacted }) {
  const db = getDb();
  const existing = getSiteLead(id);
  if (!existing) return null;

  let nextStatus = status && LEAD_STATUSES.includes(status) ? status : existing.status;
  const notes = adminNotes !== undefined ? String(adminNotes).slice(0, 2000) : existing.adminNotes;
  let contactedAt = existing.contactedAt;

  if (markContacted) {
    contactedAt = new Date().toISOString();
    if (nextStatus === 'new') nextStatus = 'contacted';
  }

  db.prepare(`
    UPDATE site_leads SET status = ?, admin_notes = ?, contacted_at = ? WHERE id = ?
  `).run(nextStatus, notes, contactedAt, id);

  return getSiteLead(id);
}

export { LEAD_STATUSES };
