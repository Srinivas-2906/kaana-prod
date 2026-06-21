import type { Tenant } from '../lib/api';
import './setup-status.css';

export type SetupStepStatus = 'complete' | 'current' | 'pending';

export type SetupStep = {
  id: string;
  label: string;
  status: SetupStepStatus;
};

type Props = {
  tenant: Tenant | null;
  compact?: boolean;
};

function icon(status: SetupStepStatus) {
  if (status === 'complete') return '✓';
  if (status === 'current') return '⏳';
  return '○';
}

export function SetupStatus({ tenant, compact = false }: Props) {
  const steps = tenant?.setupStatus ?? [];
  if (!steps.length) return null;

  const trialNote = tenant?.trialStarted && tenant.trialDaysLeft != null
    ? tenant.trialDaysLeft > 0
      ? `Trial: ${tenant.trialDaysLeft} day${tenant.trialDaysLeft === 1 ? '' : 's'} left (ends ${tenant.trialEndsAtFormatted ?? 'soon'})`
      : 'Trial ended — upgrade to keep your workspace active'
    : tenant?.onboardingPending
      ? 'Trial starts when we activate your workspace'
      : null;

  return (
    <div className={`setup-status${compact ? ' setup-status-compact' : ''}`}>
      <div className="setup-status-head">
        <p className="section-label">Setup status</p>
        {!compact && (
          <p className="setup-status-desc">
            Track where you are — from signup to live on WhatsApp.
          </p>
        )}
      </div>
      <ol className="setup-status-list" aria-label="Setup progress">
        {steps.map((step) => (
          <li
            key={step.id}
            className={`setup-status-item setup-status-${step.status}`}
            aria-current={step.status === 'current' ? 'step' : undefined}
          >
            <span className="setup-status-icon" aria-hidden="true">{icon(step.status)}</span>
            <span className="setup-status-label">{step.label}</span>
          </li>
        ))}
      </ol>
      {trialNote && <p className="setup-status-trial">{trialNote}</p>}
    </div>
  );
}
