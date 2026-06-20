import { useEffect, useState } from 'react';
import {
  isWalkthroughConfigured,
  SETUP_WALKTHROUGH_URL,
  toEmbedUrl,
  WALKTHROUGH_STEPS,
  WALKTHROUGH_TRUST,
} from '../lib/setupWalkthrough';
import './setup-walkthrough-card.css';

type Props = {
  variant?: 'card' | 'inline';
};

export function SetupWalkthroughCard({ variant = 'card' }: Props) {
  const [open, setOpen] = useState(false);
  const configured = isWalkthroughConfigured();
  const embedUrl = configured ? toEmbedUrl(SETUP_WALKTHROUGH_URL) : null;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  function handlePlay() {
    if (embedUrl) {
      setOpen(true);
      return;
    }
    if (configured) {
      window.open(SETUP_WALKTHROUGH_URL, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <>
      <button
        type="button"
        className={`setup-walkthrough-card${variant === 'inline' ? ' setup-walkthrough-card-inline' : ''}${configured ? '' : ' setup-walkthrough-card-no-video'}`}
        onClick={handlePlay}
        aria-label="Watch setup walkthrough — 8 minutes"
      >
        <div className="setup-walkthrough-preview" aria-hidden="true">
          <span className="setup-walkthrough-preview-play">▶</span>
          <span className="setup-walkthrough-preview-label">Watch walkthrough</span>
          <span className="setup-walkthrough-preview-duration">8 min</span>
        </div>

        <h3 className="setup-walkthrough-card-title">See how setup works</h3>
        <p className="setup-walkthrough-card-sub">From signup to live in 1–3 business days</p>

        <ol className="setup-walkthrough-card-steps">
          {WALKTHROUGH_STEPS.map((step, i) => (
            <li key={step}>
              <span className="setup-walkthrough-step-num">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>

        <ul className="setup-walkthrough-card-trust">
          {WALKTHROUGH_TRUST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </button>

      {open && embedUrl && (
        <div
          className="setup-walkthrough-modal-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="setup-walkthrough-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Setup walkthrough video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="setup-walkthrough-modal-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <div className="setup-walkthrough-modal-frame">
              <iframe
                src={embedUrl}
                title="Kaana setup walkthrough"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
