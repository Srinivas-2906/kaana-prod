import { ReactNode } from 'react';

const STEP_LABELS = ['Welcome', 'Project', 'Finance', 'Partners', 'Opening', 'Done'];

type OnboardingLayoutProps = {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  footer?: ReactNode;
};

export function OnboardingLayout({
  step,
  title,
  subtitle,
  children,
  onBack,
  onSkip,
  showSkip,
  footer,
}: OnboardingLayoutProps) {
  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <div className="onboarding-brand">
          <span className="public-brand-icon">K</span>
          <span>Kaana Tracker</span>
        </div>
        <div className="onboarding-progress" aria-label={`Step ${step} of ${STEP_LABELS.length}`}>
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={`onboarding-progress-step${i + 1 <= step ? ' active' : ''}${i + 1 === step ? ' current' : ''}`}
              title={label}
            />
          ))}
        </div>
      </header>
      <main className="onboarding-main">
        <div className="onboarding-card card">
          <p className="onboarding-step-label muted">Step {step} of {STEP_LABELS.length}</p>
          <h1 className="onboarding-title">{title}</h1>
          {subtitle && <p className="onboarding-subtitle muted">{subtitle}</p>}
          <div className="onboarding-body">{children}</div>
          <div className="onboarding-actions">
            {onBack && (
              <button type="button" className="btn btn-ghost" onClick={onBack}>
                Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {showSkip && onSkip && (
              <button type="button" className="btn btn-ghost" onClick={onSkip}>
                Skip for now
              </button>
            )}
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}
