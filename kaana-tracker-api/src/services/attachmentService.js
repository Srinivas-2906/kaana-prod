import { getPool } from '../db/index.js';
import { ensureM3Schema } from './schemaService.js';
import { saveUpload, deleteUploadFile, resolveUploadPath } from './uploadService.js';
import { logActivity } from './activityService.js';

const ENTITY_TYPES = ['work_item', 'transaction', 'discussion', 'project'];

function projectIdForEntity(entityType, entityId) {
  const pool = getPool();
  return (async () => {
    if (entityType === 'work_item') {
      const [rows] = await pool.query('SELECT cluster_id FROM work_items WHERE id = ?', [entityId]);
      return rows[0]?.cluster_id || null;
    }
    if (entityType === 'transaction') {
      const [rows] = await pool.query('SELECT project_id FROM transactions WHERE id = ?', [entityId]);
      return rows[0]?.project_id || null;
    }
    if (entityType === 'project') return entityId;
    return null;
  })();
}

export async function listAttachments(entityType, entityId) {
  if (!ENTITY_TYPES.includes(entityType)) return [];
  await ensureM3Schema();
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT a.*, u.name AS uploaded_by_name
    FROM attachments a
    JOIN users u ON a.uploaded_by = u.id
    WHERE a.entity_type = ? AND a.entity_id = ?
    ORDER BY a.created_at DESC
  `, [entityType, entityId]);
  return rows;
}

export async function createAttachment({ entityType, entityId, data, contentType, originalName }, userId) {
  if (!ENTITY_TYPES.includes(entityType)) return { error: 'Invalid entity type' };
  if (!entityId) return { error: 'Entity id required' };

  await ensureM3Schema();
  let saved;
  try {
    saved = saveUpload({ data, contentType, originalName });
  } catch (e) {
    return { error: e.message };
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

export async function deleteAttachment(id, userId) {
  const existing = await getAttachmentById(id);
  if (!existing) return { error: 'Not found' };

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
