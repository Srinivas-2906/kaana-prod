import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  listAttachments,
  createAttachment,
  deleteAttachment,
  getAttachmentFilePath,
  assertAttachmentDownloadAccess,
} from '../services/attachmentService.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    if (!entityType || !entityId) return res.status(400).json({ error: 'entityType and entityId required' });
    const result = await listAttachments(String(entityType), Number(entityId), req.user.sub);
    if (result?.error) return res.status(result.status || 403).json({ error: result.error });
    res.json({ attachments: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list attachments' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { entityType, entityId, data, contentType, originalName } = req.body;
    const result = await createAttachment({
      entityType,
      entityId: Number(entityId),
      data,
      contentType,
      originalName,
    }, req.user.sub);
    if (result.error) return res.status(result.status || 400).json({ error: result.error });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const access = await assertAttachmentDownloadAccess(Number(req.params.id), req.user.sub);
    if (access.error) return res.status(access.status || 403).json({ error: access.error });

    const { attachment } = access;
    const filePath = getAttachmentFilePath(attachment);
    if (!filePath) return res.status(404).json({ error: 'File missing' });

    const asDownload = req.query.download === '1' || req.query.download === 'true';
    const safeName = String(attachment.original_name || 'download').replace(/[^\w.\-()+ ]/g, '_');
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader(
      'Content-Disposition',
      `${asDownload ? 'attachment' : 'inline'}; filename="${safeName}"`,
    );
    res.sendFile(filePath);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteAttachment(Number(req.params.id), req.user.sub);
    if (result.error) return res.status(result.status || 404).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

export default router;
