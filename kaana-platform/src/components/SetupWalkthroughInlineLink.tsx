import { isWalkthroughConfigured, SETUP_WALKTHROUGH_LABEL, SETUP_WALKTHROUGH_URL } from '../lib/setupWalkthrough';
import './setup-walkthrough-inline.css';

export function SetupWalkthroughInlineLink() {
  if (!isWalkthroughConfigured()) return null;

  return (
    <p className="setup-walkthrough-inline">
      <a
        href={SETUP_WALKTHROUGH_URL}
        target="_blank"
        rel="noreferrer"
        className="setup-walkthrough-inline-link"
      >
        ▶ {SETUP_WALKTHROUGH_LABEL}
      </a>
    </p>
  );
}
