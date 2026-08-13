import { getPool } from '../db/index.js';
import { ensureM3Schema } from './schemaService.js';
import { saveUpload, deleteUploadFile, resolveUploadPath } from './uploadService.js';
import { logActivity } from './activityService.js';
import { assertProjectAccess, canEdit } from './authorizationService.js';

const ENTITY_TYPES = ['work_item', 'transaction', 'discussion', 'project'];

async function projectIdForEntity(entityType, entityId) {
  const pool = getPool();
  if (entityType === 'work_item') {
    const [rows] = await pool.query('SELECT cluster_id FROM work_items WHERE id = ?', [entityId]);
    return rows[0]?.cluster_id || null;
  }
  if (entityType === 'transaction') {
    const [rows] = await pool.query('SELECT project_id FROM transactions WHERE id = ?', [entityId]);
    return rows[0]?.project_id || null;
  }
  if (entityType === 'project') return entityId;
  if (entityType === 'discussion') {
    const [rows] = await pool.query(`
      SELECT COALESCE(t.project_id, d.entity_id) AS project_id
      FROM discussions d
      LEFT JOIN discussion_topics t ON t.id = d.topic_id
      WHERE d.id = ?
      LIMIT 1
    `, [entityId]);
    return rows[0]?.project_id || null;
  }
  return null;
}

async function assertEntityAttachmentAccess(entityType, entityId, userId) {
  if (!ENTITY_TYPES.includes(entityType)) {
    return { error: 'Invalid entity type', status: 400 };
  }
  const projectId = await projectIdForEntity(entityType, entityId);
  if (!projectId) return { error: 'Not found', status: 404 };
  return assertProjectAccess(projectId, userId, 'view');
}

export async function listAttachments(entityType, entityId, userId = null) {
  if (!ENTITY_TYPES.includes(entityType)) return [];
  if (userId != null) {
    const access = await assertEntityAttachmentAccess(entityType, entityId, userId);
    if (access.error) return { error: access.error, status: access.status };
  }
  await ensureM3Schema();
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT a.*, u.name AS uploaded_by_name
    FROM attachments a
    JOIN users u ON a.uploaded_by = u.id
    WHERE a.entity_type = ? AND a.entity_id = ?
    ORDER BY a.created_at ASC
  `, [entityType, entityId]);
  return rows;
}

export async function listAttachmentsByDiscussionIds(discussionIds) {
  if (!discussionIds.length) return {};
  await ensureM3Schema();
  const pool = getPool();
  const placeholders = discussionIds.map(() => '?').join(', ');
  const [rows] = await pool.query(`
    SELECT a.*, u.name AS uploaded_by_name
    FROM attachments a
    JOIN users u ON u.id = a.uploaded_by
    WHERE a.entity_type = 'discussion' AND a.entity_id IN (${placeholders})
    ORDER BY a.created_at ASC
  `, discussionIds);

  const map = {};
  for (const row of rows) {
    if (!map[row.entity_id]) map[row.entity_id] = [];
    map[row.entity_id].push(row);
  }
  return map;
}

export async function createAttachment({ entityType, entityId, data, contentType, originalName }, userId) {
  if (!ENTITY_TYPES.includes(entityType)) return { error: 'Invalid entity type' };
  if (!entityId) return { error: 'Entity id required' };

  const access = await assertEntityAttachmentAccess(entityType, entityId, userId);
  if (access.error) return { error: access.error, status: access.status };

  await ensureM3Schema();
  let saved;
  try {
    saved = saveUpload({ data, contentType, originalName });
  } catch (e) {
    return { error: e.message, status: 400 };
  }

  const pool = getPool();
  const [result] = await pool.query(`
    INSERT INTO attachments (entity_type, entity_id, file_name, original_name, mime_type, file_size, storage_path, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    entityType,
    entityId,
    saved.fileName,
    originalName || saved.fileName,
    saved.mimeType,
    saved.fileSize,
    saved.storagePath,
    userId,
  ]);

  const attachment = await getAttachmentById(result.insertId);
  const projectId = await projectIdForEntity(entityType, entityId);

  await logActivity({
    eventType: 'attachment_added',
    entityType,
    entityId,
    projectId,
    actorId: userId,
    summary: `Attached ${originalName || saved.fileName}`,
    payload: { attachment_id: attachment.id, file_name: attachment.original_name },
  });

  return { attachment };
}

export async function getAttachmentById(id) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT a.*, u.name AS uploaded_by_name
    FROM attachments a
    JOIN users u ON a.uploaded_by = u.id
    WHERE a.id = ?
  `, [id]);
  return rows[0] || null;
}

export async function assertAttachmentDownloadAccess(attachmentId, userId) {
  const attachment = await getAttachmentById(attachmentId);
  if (!attachment) return { error: 'Not found', status: 404 };
  const access = await assertEntityAttachmentAccess(
    attachment.entity_type,
    attachment.entity_id,
    userId,
  );
  if (access.error) return { error: access.error, status: access.status };
  return { attachment };
}

export async function deleteAttachment(id, userId) {
  const existing = await getAttachmentById(id);
  if (!existing) return { error: 'Not found', status: 404 };

  const access = await assertEntityAttachmentAccess(
    existing.entity_type,
    existing.entity_id,
    userId,
  );
  if (access.error) return { error: access.error, status: access.status };

  const isOwner = Number(existing.uploaded_by) === Number(userId);
  if (!isOwner && !canEdit(access.role)) {
    return { error: 'Not allowed to remove this file', status: 403 };
  }

  deleteUploadFile(existing.storage_path);
  const pool = getPool();
  await pool.query('DELETE FROM attachments WHERE id = ?', [id]);

  const projectId = await projectIdForEntity(existing.entity_type, existing.entity_id);
  await logActivity({
    eventType: 'attachment_removed',
    entityType: existing.entity_type,
    entityId: existing.entity_id,
    projectId,
    actorId: userId,
    summary: `Removed attachment ${existing.original_name}`,
    payload: { attachment_id: id },
  });

  return { ok: true };
}

export function getAttachmentFilePath(attachment) {
  return resolveUploadPath(attachment.storage_path);
}

export async function countAttachments(entityType, entityId) {
  await ensureM3Schema();
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS c FROM attachments WHERE entity_type = ? AND entity_id = ?',
    [entityType, entityId],
  );
  return Number(rows[0]?.c || 0);
}
