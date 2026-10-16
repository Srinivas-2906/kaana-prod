interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="about-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <i className="ti ti-x" />
        </button>
        <img src="/botiq-icon.png" alt="" className="modal-brand-icon" width={56} height={56} />
        <h2 id="about-title">Bot IQ</h2>
        <p className="modal-eyebrow">A product of Kaana AI Technologies</p>
        <p>
          WhatsApp inbox, templates, and automation for businesses on the Meta WhatsApp Business Platform.
        </p>
        <p className="modal-cta">
          Support:{' '}
          <a href="mailto:hello@kaana.in">hello@kaana.in</a>
        </p>
      </div>
    </div>
  );
}
