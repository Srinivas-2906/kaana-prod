import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = process.env.UPLOADS_DIR || path.join(__dirname, '../../data/uploads');

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
  'application/pdf',
  'text/plain', 'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
]);

const EXT_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
};

const ALLOWED_EXT = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'pdf', 'txt', 'csv',
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip',
]);

export function getUploadsRoot() {
  return uploadsRoot;
}

function inferMimeFromName(originalName) {
  const ext = path.extname(originalName || '').slice(1).toLowerCase();
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', heic: 'image/heic', pdf: 'application/pdf', txt: 'text/plain',
    csv: 'text/csv', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    zip: 'application/zip',
  };
  return map[ext] || null;
}

export function saveUpload({ data, contentType, originalName = 'file' }) {
  if (!data) throw new Error('Missing file data');

  let mime = String(contentType || '').toLowerCase().split(';')[0].trim();
  if (!mime || mime === 'application/octet-stream') {
    mime = inferMimeFromName(originalName) || mime;
  }
  if (!ALLOWED_TYPES.has(mime)) {
    const ext = path.extname(originalName).slice(1).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      throw new Error('File type not allowed. Use images, PDF, Office docs, CSV, TXT, or ZIP.');
    }
    mime = inferMimeFromName(originalName) || 'application/octet-stream';
  }

  const buf = Buffer.from(String(data), 'base64');
  if (!buf.length) throw new Error('Empty file');
  if (buf.length > 10 * 1024 * 1024) throw new Error('File too large (max 10 MB)');

  fs.mkdirSync(uploadsRoot, { recursive: true });
  const ext = EXT_MAP[mime] || path.extname(originalName).slice(1).toLowerCase() || 'bin';
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

export function isImageMime(mime) {
  return String(mime || '').startsWith('image/');
}
