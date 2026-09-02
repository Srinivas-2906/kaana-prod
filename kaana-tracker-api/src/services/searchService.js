import { getPool } from '../db/index.js';
import { listAccessibleProjectIds } from './authorizationService.js';
import { ensurePhase2Schema } from './schemaService.js';
import { formatIssueKey } from './issueKeyService.js';

function likeTerm(q) {
  const trimmed = String(q || '').trim();
  if (trimmed.length < 2) return null;
  return `%${trimmed.replace(/[%_\\]/g, '\\$&')}%`;
}

export async function globalSearch(userId, query, options = {}) {
  const trimmed = String(query || '').trim();
  const limit = Math.min(Math.max(Number(options.limit) || 30, 1), 50);
  const kind = options.kind || null;
  const status = options.status || null;
  const labelId = options.labelId ? Number(options.labelId) : null;
  const projectId = options.projectId ? Number(options.projectId) : null;

  const pool = getPool();
  await ensurePhase2Schema();
  const projectIds = projectId ? [projectId] : await listAccessibleProjectIds(userId);
  const results = [];

  const issueKeyMatch = /^([A-Za-z0-9]+)-(\d+)$/.exec(trimmed);
  if (issueKeyMatch && projectIds.length) {
    const [, key, idStr] = issueKeyMatch;
    const workItemId = Number(idStr);
    const placeholders = projectIds.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT wi.id, wi.title, wi.item_type, wi.status, wi.cluster_id, c.name AS cluster_name, c.project_key
       FROM work_items wi
       LEFT JOIN clusters c ON c.id = wi.cluster_id
       WHERE wi.id = ? AND UPPER(c.project_key) = UPPER(?) AND wi.cluster_id IN (${placeholders})
       LIMIT 1`,
      [workItemId, key, ...projectIds],
    );
    if (rows[0]) {
      const row = rows[0];
      return {
        results: [{
          kind: 'work_item',
          id: row.id,
          title: row.title,
          subtitle: [formatIssueKey(row.project_key, row.id), row.cluster_name, row.status].filter(Boolean).join(' · '),
          link: `/work/${row.id}`,
        }],
      };
    }
  }

  const term = likeTerm(trimmed);
  if (!term) return { results: [] };

  if (projectIds.length && (!kind || kind === 'work_item')) {
    const placeholders = projectIds.map(() => '?').join(',');
    const params = [...projectIds, term, term];
    let sql = `
      SELECT wi.id, wi.title, wi.item_type, wi.status, wi.cluster_id, c.name AS cluster_name, c.project_key
      FROM work_items wi
      LEFT JOIN clusters c ON c.id = wi.cluster_id
      WHERE wi.cluster_id IN (${placeholders})
        AND (wi.title LIKE ? OR wi.description LIKE ?)
    `;
    if (status) {
      sql += ' AND wi.status = ?';
      params.push(status);
    }
    if (labelId) {
      sql += ' AND EXISTS (SELECT 1 FROM work_item_labels wil WHERE wil.work_item_id = wi.id AND wil.label_id = ?)';
      params.push(labelId);
    }
    sql += ' ORDER BY wi.updated_at DESC LIMIT ?';
    params.push(limit);

    const [workItems] = await pool.query(sql, params);
    for (const row of workItems) {
      results.push({
        kind: 'work_item',
        id: row.id,
        title: row.title,
        subtitle: [formatIssueKey(row.project_key, row.id), row.cluster_name, row.item_type, row.status].filter(Boolean).join(' · '),
        link: `/work/${row.id}`,
      });
    }
  }

  if (projectIds.length && (!kind || kind === 'project')) {
    const placeholders = projectIds.map(() => '?').join(',');
    const [projects] = await pool.query(
      `SELECT id, name, description, project_key FROM clusters
       WHERE id IN (${placeholders}) AND (name LIKE ? OR description LIKE ? OR project_key LIKE ?)
       ORDER BY updated_at DESC LIMIT ?`,
      [...projectIds, term, term, term, limit],
    );
    for (const row of projects) {
      results.push({
        kind: 'project',
        id: row.id,
        title: row.name,
        subtitle: [row.project_key, row.description].filter(Boolean).join(' · ') || 'Project',
        link: `/projects/${row.id}/board`,
      });
    }
  }

  if (projectIds.length && (!kind || kind === 'topic')) {
    const placeholders = projectIds.map(() => '?').join(',');
    const [topics] = await pool.query(
      `SELECT t.id, t.title, t.project_id, c.name AS cluster_name
       FROM discussion_topics t
       JOIN clusters c ON c.id = t.project_id
       WHERE t.project_id IN (${placeholders}) AND t.title LIKE ?
       ORDER BY t.updated_at DESC LIMIT ?`,
      [...projectIds, term, limit],
    );
    for (const row of topics) {
      results.push({
        kind: 'topic',
        id: row.id,
        title: row.title,
        subtitle: `${row.cluster_name} · Updates`,
        link: `/projects/${row.project_id}/updates?topic=${row.id}`,
      });
    }
  }

  if (!kind || kind === 'attachment') {
    const [attachments] = await pool.query(
      `SELECT a.id, a.original_name, a.entity_type, a.entity_id, a.mime_type
       FROM attachments a
       WHERE a.original_name LIKE ?
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [term, limit],
    );
    for (const row of attachments) {
      let link = '/';
      if (row.entity_type === 'work_item') link = `/work/${row.entity_id}`;
      else if (row.entity_type === 'project') link = `/projects/${row.entity_id}/board`;
      results.push({
        kind: 'attachment',
        id: row.id,
        title: row.original_name,
        subtitle: `${row.mime_type} · ${row.entity_type}`,
        link,
      });
    }
  }

  if (!kind || kind === 'whiteboard') {
    const [boards] = await pool.query(
      `SELECT id, title, board_type FROM whiteboards
       WHERE title LIKE ? OR description LIKE ?
       ORDER BY updated_at DESC LIMIT ?`,
      [term, term, limit],
    );
    for (const row of boards) {
      results.push({
        kind: 'whiteboard',
        id: row.id,
        title: row.title,
        subtitle: row.board_type === 'diagram' ? 'Flow diagram' : 'Sticky board',
        link: `/whiteboards/${row.id}`,
      });
    }
  }

  return { results: results.slice(0, limit) };
}
