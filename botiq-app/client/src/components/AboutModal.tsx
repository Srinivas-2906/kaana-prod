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
        <div className="modal-icon"><i className="ti ti-robot" /></div>
        <h2 id="about-title">About BotIQ</h2>
        <p>
          BotIQ is a demo product by <strong>Kaana AI Technologies</strong>.
          We build custom AI chatbots for WhatsApp, web, and SMS for real estate,
          retail, restaurants, and more.
        </p>
        <p className="modal-cta">
          Contact us to build your own:{' '}
          <a href="https://kaanaai.com" target="_blank" rel="noreferrer">kaanaai.com</a>
        </p>
      </div>
    </div>
  );
}
