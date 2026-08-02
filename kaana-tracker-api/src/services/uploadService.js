import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = process.env.UPLOADS_DIR || path.join(__dirname, '../../data/uploads');

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const EXT_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
};

export function getUploadsRoot() {
  return uploadsRoot;
}

export function saveUpload({ data, contentType, originalName = 'file' }) {
  if (!data) throw new Error('Missing file data');
  const mime = String(contentType || 'application/octet-stream').toLowerCase();
  if (!ALLOWED_TYPES.has(mime)) {
    throw new Error('File type not allowed');
  }

  const buf = Buffer.from(String(data), 'base64');
  if (!buf.length) throw new Error('Empty file');
  if (buf.length > 8 * 1024 * 1024) throw new Error('File too large (max 8 MB)');

  fs.mkdirSync(uploadsRoot, { recursive: true });
  const ext = EXT_MAP[mime] || path.extname(originalName).slice(1) || 'bin';
  const fileName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const storagePath = fileName;
  const fullPath = path.join(uploadsRoot, fileName);
  fs.writeFileSync(fullPath, buf);

  return {
    fileName,
    storagePath,
    mimeType: mime,
    fileSize: buf.length,
  };
}

export function resolveUploadPath(storagePath) {
  const safe = String(storagePath || '').replace(/\.\./g, '').replace(/^\//, '');
  const full = path.join(uploadsRoot, safe);
  if (!full.startsWith(uploadsRoot)) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

export function deleteUploadFile(storagePath) {
  const full = resolveUploadPath(storagePath);
  if (full) {
    try {
      fs.unlinkSync(full);
    } catch {
      // ignore
    }
  }
}
