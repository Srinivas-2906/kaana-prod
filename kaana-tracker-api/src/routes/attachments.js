import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  listAttachments, createAttachment, getAttachmentById, deleteAttachment, getAttachmentFilePath,
} from '../services/attachmentService.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    if (!entityType || !entityId) return res.status(400).json({ error: 'entityType and entityId required' });
    const attachments = await listAttachments(String(entityType), Number(entityId));
    res.json({ attachments });
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
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const attachment = await getAttachmentById(Number(req.params.id));
    if (!attachment) return res.status(404).json({ error: 'Not found' });
    const filePath = getAttachmentFilePath(attachment);
    if (!filePath) return res.status(404).json({ error: 'File missing' });
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.original_name}"`);
    res.sendFile(filePath);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteAttachment(Number(req.params.id), req.user.sub);
    if (result.error) return res.status(404).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

export default router;
