import { Sparkles } from './KaanaIcons';
import './automation-ai-card.css';

const ITEMS = [
  'Automated replies',
  'Lead qualification workflows',
  'Business-specific automation',
  'AI-assisted experiences where useful',
  'Human takeover at any time',
];

/** Single platform card — AI lives here only, not on homepage or pricing. */
export function AutomationAICard() {
  return (
    <article className="platform-scroll-card automation-ai-card">
      <div className="platform-card-top">
        <span className="platform-icon-wrap">
          <Sparkles size={20} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="platform-status platform-status-live">Included</span>
      </div>
      <h3>Automation &amp; AI</h3>
      <ul className="automation-ai-card-list">
        {ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
