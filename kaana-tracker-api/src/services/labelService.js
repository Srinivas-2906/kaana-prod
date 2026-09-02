import { getPool } from '../db/index.js';
import { ensurePhase2Schema } from './schemaService.js';
import { assertProjectAccess } from './authorizationService.js';

const DEFAULT_LABELS = [
  { name: 'bug', color: '#ef4444' },
  { name: 'feature', color: '#3b82f6' },
  { name: 'epic', color: '#8b5cf6' },
  { name: 'tech-debt', color: '#f59e0b' },
];

export async function ensureDefaultLabels(projectId) {
  await ensurePhase2Schema();
  const pool = getPool();
  for (const label of DEFAULT_LABELS) {
    await pool.query(
      'INSERT IGNORE INTO labels (project_id, name, color) VALUES (?, ?, ?)',
      [projectId, label.name, label.color],
    );
  }
}

export async function listLabels(projectId, userId) {
  const access = await assertProjectAccess(projectId, userId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  await ensureDefaultLabels(projectId);
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM labels WHERE project_id = ? ORDER BY name ASC',
    [projectId],
  );
  return { labels: rows };
}

export async function createLabel(projectId, data, userId) {
  const access = await assertProjectAccess(projectId, userId, 'edit');
  if (access.error) return { error: access.error, status: access.status };

  const name = String(data.name || '').trim().toLowerCase();
  if (!name) return { error: 'Label name is required', status: 400 };

  await ensurePhase2Schema();
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO labels (project_id, name, color) VALUES (?, ?, ?)',
    [projectId, name, data.color || '#64748b'],
  );
  const [rows] = await pool.query('SELECT * FROM labels WHERE id = ?', [result.insertId]);
  return { label: rows[0] };
}

export async function getLabelsForWorkItems(workItemIds) {
  if (!workItemIds.length) return {};
  await ensurePhase2Schema();
  const pool = getPool();
  const placeholders = workItemIds.map(() => '?').join(',');
  const [rows] = await pool.query(`
    SELECT wil.work_item_id, l.id, l.name, l.color, l.project_id
    FROM work_item_labels wil
    JOIN labels l ON l.id = wil.label_id
    WHERE wil.work_item_id IN (${placeholders})
    ORDER BY l.name ASC
  `, workItemIds);

  const map = {};
  for (const row of rows) {
    if (!map[row.work_item_id]) map[row.work_item_id] = [];
    map[row.work_item_id].push({ id: row.id, name: row.name, color: row.color, project_id: row.project_id });
  }
  return map;
}

export async function setWorkItemLabels(workItemId, labelIds, userId) {
  await ensurePhase2Schema();
  const pool = getPool();
  const [items] = await pool.query('SELECT id, cluster_id FROM work_items WHERE id = ? LIMIT 1', [workItemId]);
  const item = items[0];
  if (!item) return { error: 'Work item not found', status: 404 };

  const access = await assertProjectAccess(item.cluster_id, userId, 'edit');
  if (access.error) return { error: access.error, status: access.status };

  const ids = [...new Set((labelIds || []).map(Number).filter(Boolean))];
  if (ids.length) {
    const placeholders = ids.map(() => '?').join(',');
    const [valid] = await pool.query(
      `SELECT id FROM labels WHERE project_id = ? AND id IN (${placeholders})`,
      [item.cluster_id, ...ids],
    );
    const validIds = valid.map((r) => r.id);
    await pool.query('DELETE FROM work_item_labels WHERE work_item_id = ?', [workItemId]);
    for (const labelId of validIds) {
      await pool.query('INSERT INTO work_item_labels (work_item_id, label_id) VALUES (?, ?)', [workItemId, labelId]);
    }
  } else {
    await pool.query('DELETE FROM work_item_labels WHERE work_item_id = ?', [workItemId]);
  }

  return { ok: true, labels: (await getLabelsForWorkItems([workItemId]))[workItemId] || [] };
}
