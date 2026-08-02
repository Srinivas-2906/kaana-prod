import { getPool } from '../db/index.js';

const LINK_TYPES = ['derived_from', 'belongs_to', 'contributed_to', 'related', 'supersedes'];

export async function createLink(data, userId) {
  if (!LINK_TYPES.includes(data.link_type)) return { error: 'Invalid link type' };
  if (!data.source_type || !data.source_id || !data.target_type || !data.target_id) {
    return { error: 'Source and target required' };
  }

  const pool = getPool();
  const [result] = await pool.query(`
    INSERT INTO entity_links (source_type, source_id, target_type, target_id, link_type, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [data.source_type, data.source_id, data.target_type, data.target_id, data.link_type, userId]);

  const [rows] = await pool.query('SELECT * FROM entity_links WHERE id = ?', [result.insertId]);
  return { link: rows[0] };
}

export async function getLinksForEntity(entityType, entityId) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT el.*, u.name AS created_by_name
    FROM entity_links el
    JOIN users u ON el.created_by = u.id
    WHERE (el.source_type = ? AND el.source_id = ?)
       OR (el.target_type = ? AND el.target_id = ?)
    ORDER BY el.created_at DESC
  `, [entityType, entityId, entityType, entityId]);
  return rows;
}

export async function getLinkedWorkItems(entityType, entityId) {
  const pool = getPool();
  const links = await getLinksForEntity(entityType, entityId);
  const workIds = new Set();

  for (const link of links) {
    if (link.source_type === 'work_item') workIds.add(link.source_id);
    if (link.target_type === 'work_item') workIds.add(link.target_id);
  }

  if (!workIds.size) return [];

  const [rows] = await pool.query(`
    SELECT w.*, c.name AS cluster_name, c.color AS cluster_color
    FROM work_items w
    LEFT JOIN clusters c ON w.cluster_id = c.id
    WHERE w.id IN (?)
  `, [[...workIds]]);
  return rows;
}

export async function linkWorkItems(sourceId, targetId, linkType, userId) {
  return createLink({
    source_type: 'work_item',
    source_id: sourceId,
    target_type: 'work_item',
    target_id: targetId,
    link_type: linkType,
  }, userId);
}
