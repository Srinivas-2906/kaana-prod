import { useCallback, useEffect, useState } from 'react';
import { Download, FileText, Paperclip, Trash2, X } from 'lucide-react';
import {
  attachmentDownloadUrl,
  deleteAttachment,
  fetchAttachments,
  uploadAttachment,
} from '../lib/api';
import { authHeaders } from '../lib/auth';
import type { Attachment } from '../types';
import { FilePreviewModal, useAttachmentPreview } from './FilePreviewModal';

function isImage(mime: string) {
  return mime.startsWith('image/');
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fetchAttachmentBlob(id: number, download = false) {
  const url = `${attachmentDownloadUrl(id)}${download ? '?download=1' : ''}`;
  const headers = await authHeaders();
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Could not fetch file');
  return res.blob();
}

export async function downloadAttachmentFile(attachment: Attachment) {
  const blob = await fetchAttachmentBlob(attachment.id, true);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = attachment.original_name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function openAttachmentFile(attachment: Attachment) {
  const blob = await fetchAttachmentBlob(attachment.id, false);
  window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer');
}

export function previewAttachment(attachment: Attachment, openPreview: (a: Attachment) => void) {
  openPreview(attachment);
}

export function PendingFileList({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (index: number) => void;
}) {
  if (!files.length) return null;
  return (
    <ul className="message-pending-files">
      {files.map((file, idx) => (
        <li key={`${file.name}-${idx}`}>
          <Paperclip size={13} />
          <span>{file.name}</span>
          <span className="muted">{formatSize(file.size)}</span>
          <button type="button" className="btn btn-ghost btn-compact" onClick={() => onRemove(idx)} aria-label="Remove file">
            <X size={13} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function MessageFilePicker({
  files,
  onChange,
  disabled,
  id,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  id?: string;
}) {
  function onFiles(list: FileList | null) {
    if (!list?.length) return;
    onChange([...files, ...Array.from(list)]);
  }

  return (
    <div className="message-file-picker">
      <label htmlFor={id || 'message-file-input'} className="btn btn-ghost btn-compact message-attach-btn">
        <Paperclip size={14} />
        Attach files
      </label>
      <input
        id={id || 'message-file-input'}
        type="file"
        multiple
        hidden
        disabled={disabled}
        accept="image/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <PendingFileList files={files} onRemove={(idx) => onChange(files.filter((_, i) => i !== idx))} />
    </div>
  );
}

export async function uploadFilesToDiscussion(discussionId: number, files: File[]) {
  for (const file of files) {
    await uploadAttachment('discussion', discussionId, file);
  }
}

export function MessageAttachments({
  discussionId,
  initialAttachments = [],
  canUpload = false,
  canRemove = false,
  onChange,
}: {
  discussionId: number;
  initialAttachments?: Attachment[];
  canUpload?: boolean;
  canRemove?: boolean;
  onChange?: () => void;
}) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [thumbUrls, setThumbUrls] = useState<Record<number, string>>({});
  const { preview, openPreview, closePreview } = useAttachmentPreview();

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments, discussionId]);

  const reload = useCallback(() => {
    if (discussionId < 1) return;
    fetchAttachments('discussion', discussionId)
      .then((r) => setAttachments(r.attachments))
      .catch(() => {});
  }, [discussionId]);

  useEffect(() => {
    let cancelled = false;
    const urls: Record<number, string> = {};

    (async () => {
      for (const a of attachments) {
        if (!isImage(a.mime_type)) continue;
        try {
          const blob = await fetchAttachmentBlob(a.id, false);
          if (!cancelled) urls[a.id] = URL.createObjectURL(blob);
        } catch {
          // skip thumb
        }
      }
      if (!cancelled) setThumbUrls(urls);
    })();

    return () => {
      cancelled = true;
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [attachments]);

  async function onUpload(list: FileList | null) {
    if (!list?.length || discussionId < 1) return;
    setUploading(true);
    setError('');
    try {
      await uploadFilesToDiscussion(discussionId, Array.from(list));
      reload();
      onChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function onRemove(id: number) {
    if (!confirm('Remove this file?')) return;
    await deleteAttachment(id);
    reload();
    onChange?.();
  }

  if (discussionId < 1) return null;

  return (
    <div className="message-attachments">
      <FilePreviewModal attachment={preview} onClose={closePreview} />
      {attachments.map((a) => (
        <div key={a.id} className="message-attachment-card">
          {isImage(a.mime_type) && thumbUrls[a.id] ? (
            <button type="button" className="message-attachment-thumb" onClick={() => openPreview(a)}>
              <img src={thumbUrls[a.id]} alt={a.original_name} />
            </button>
          ) : (
            <div className="message-attachment-icon" aria-hidden>
              <FileText size={18} />
            </div>
          )}
          <div className="message-attachment-meta">
            <button type="button" className="message-attachment-name" onClick={() => openPreview(a)}>
              {a.original_name}
            </button>
            <span className="muted">{formatSize(a.file_size)}</span>
          </div>
          <div className="message-attachment-actions">
            <button type="button" className="btn btn-ghost btn-compact" title="Download" onClick={() => downloadAttachmentFile(a)}>
              <Download size={14} />
            </button>
            {canRemove && (
              <button type="button" className="btn btn-ghost btn-compact" title="Remove" onClick={() => onRemove(a.id)}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}

      {canUpload && (
        <label className="message-attachment-add">
          <Paperclip size={14} />
          {uploading ? 'Uploading…' : 'Add file'}
          <input
            type="file"
            multiple
            hidden
            accept="image/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
            onChange={(e) => onUpload(e.target.files)}
          />
        </label>
      )}

      {error && <p className="message-attachment-error">{error}</p>}
    </div>
  );
}
