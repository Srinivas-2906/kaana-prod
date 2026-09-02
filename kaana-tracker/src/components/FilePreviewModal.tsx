import { useEffect, useState } from 'react';
import { Download, ExternalLink, X } from 'lucide-react';
import type { Attachment } from '../types';
import { downloadAttachmentFile, fetchAttachmentBlob } from './MessageAttachments';

function isImage(mime: string) {
  return mime.startsWith('image/');
}

function isPdf(mime: string) {
  return mime === 'application/pdf';
}

function isTextLike(mime: string, name: string) {
  return mime.startsWith('text/') || /\.(txt|csv|md|json|log)$/i.test(name);
}

type Props = {
  attachment: Attachment | null;
  onClose: () => void;
};

export function FilePreviewModal({ attachment, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!attachment) {
      setUrl(null);
      setText('');
      setError('');
      return undefined;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const blob = await fetchAttachmentBlob(attachment.id, false);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        if (isTextLike(attachment.mime_type, attachment.original_name)) {
          const raw = await blob.text();
          if (!cancelled) setText(raw.slice(0, 200_000));
        } else {
          setText('');
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Preview failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment]);

  useEffect(() => {
    if (!attachment) return undefined;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [attachment, onClose]);

  if (!attachment) return null;

  const image = isImage(attachment.mime_type);
  const pdf = isPdf(attachment.mime_type);
  const textLike = isTextLike(attachment.mime_type, attachment.original_name);

  return (
    <div className="file-preview-backdrop" onClick={onClose} role="presentation">
      <div className="file-preview-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="File preview">
        <header className="file-preview-header">
          <div>
            <strong>{attachment.original_name}</strong>
            <div className="muted">{attachment.mime_type}</div>
          </div>
          <div className="file-preview-actions">
            <button type="button" className="btn btn-ghost btn-compact" onClick={() => downloadAttachmentFile(attachment)} title="Download">
              <Download size={16} />
            </button>
            {url && (
              <a className="btn btn-ghost btn-compact" href={url} target="_blank" rel="noopener noreferrer" title="Open in new tab">
                <ExternalLink size={16} />
              </a>
            )}
            <button type="button" className="btn btn-ghost btn-compact" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </header>
        <div className="file-preview-body">
          {loading && <p className="muted">Loading preview…</p>}
          {error && <p className="file-preview-error">{error}</p>}
          {!loading && !error && image && url && (
            <img src={url} alt={attachment.original_name} className="file-preview-image" />
          )}
          {!loading && !error && pdf && url && (
            <iframe title={attachment.original_name} src={url} className="file-preview-pdf" />
          )}
          {!loading && !error && textLike && (
            <pre className="file-preview-text">{text || '(empty file)'}</pre>
          )}
          {!loading && !error && !image && !pdf && !textLike && (
            <div className="file-preview-fallback">
              <p className="muted">No inline preview for this file type.</p>
              <button type="button" className="btn btn-primary" onClick={() => downloadAttachmentFile(attachment)}>
                Download file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function useAttachmentPreview() {
  const [preview, setPreview] = useState<Attachment | null>(null);
  return {
    preview,
    openPreview: setPreview,
    closePreview: () => setPreview(null),
  };
}
