import { isWalkthroughConfigured, SETUP_WALKTHROUGH_LABEL, SETUP_WALKTHROUGH_URL } from '../lib/setupWalkthrough';
import './setup-status.css';

type Props = {
  context: 'success' | 'dashboard';
};

export function SetupWalkthroughLink({ context }: Props) {
  const configured = isWalkthroughConfigured();

  return (
    <div className="setup-walkthrough">
      {context === 'success' ? (
        <p>Want to know exactly what happens while we set things up?</p>
      ) : (
        <p>While we set things up:</p>
      )}
      {!configured ? (
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {SETUP_WALKTHROUGH_LABEL}
        </span>
      ) : (
        <a
          href={SETUP_WALKTHROUGH_URL}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost"
        >
          {SETUP_WALKTHROUGH_LABEL} ↗
        </a>
      )}
    </div>
  );
}
