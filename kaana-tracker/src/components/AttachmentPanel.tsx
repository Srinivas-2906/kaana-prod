import { useCallback, useEffect, useRef, useState } from 'react';
import { Paperclip, Trash2 } from 'lucide-react';
import { attachmentDownloadUrl, deleteAttachment, fetchAttachments, uploadAttachment } from '../lib/api';
import type { Attachment } from '../types';
import { authHeaders } from '../lib/auth';

export function AttachmentPanel({
  entityType,
  entityId,
  onChange,
  readOnly = false,
}: {
  entityType: string;
  entityId: number;
  onChange?: () => void;
  readOnly?: boolean;
}) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => {
    fetchAttachments(entityType, entityId)
      .then((r) => setAttachments(r.attachments))
      .catch(console.error);
  }, [entityType, entityId]);

  useEffect(() => { reload(); }, [reload]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        await uploadAttachment(entityType, entityId, file);
      }
      reload();
      onChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function onRemove(id: number) {
    if (!confirm('Remove this attachment?')) return;
    await deleteAttachment(id);
    reload();
    onChange?.();
  }

  async function openAttachment(id: number) {
    const url = attachmentDownloadUrl(id);
    const headers = await authHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) return;
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), '_blank');
  }

  return (
    <div className="attachment-panel">
      {!readOnly && (
        <div
          className="attachment-drop"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <Paperclip size={16} />
          <span>{uploading ? 'Uploading…' : 'Drop files or click to upload'}</span>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>
      )}
      {error && <p style={{ color: '#dc2626', fontSize: '0.8125rem' }}>{error}</p>}
      <ul className="attachment-list">
        {attachments.map((a) => (
          <li key={a.id} className="attachment-item">
            <button type="button" className="attachment-link" onClick={() => openAttachment(a.id)}>
              {a.original_name}
            </button>
            <span className="muted">{(a.file_size / 1024).toFixed(0)} KB · {a.uploaded_by_name}</span>
            {!readOnly && (
              <button type="button" className="btn btn-ghost attachment-remove" onClick={() => onRemove(a.id)} aria-label="Remove">
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
        {!attachments.length && <li className="muted">No attachments yet.</li>}
      </ul>
    </div>
  );
}
