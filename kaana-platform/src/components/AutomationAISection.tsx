import { Sparkles } from './KaanaIcons';
import './automation-ai.css';

const ITEMS = [
  'Automated replies for common questions',
  'Lead qualification workflows',
  'Business-specific automation',
  'AI-assisted experiences where useful',
  'Human takeover at any time',
];

export function AutomationAISection() {
  return (
    <section id="automation" className="automation-ai">
      <div className="container">
        <p className="ultimate-kicker">Automation &amp; AI</p>
        <h2 className="ultimate-title">
          <span className="title-line">Modern tools.</span>
          <span className="title-line ultimate-accent">Human control.</span>
        </h2>
        <p className="ultimate-desc automation-ai-desc">
          Kaana is a business platform for WhatsApp leads — not an AI demo. Automation and AI-assisted
          features support your team where they help, and your staff can take over any conversation at any time.
        </p>

        <ul className="automation-ai-list">
          {ITEMS.map((item) => (
            <li key={item}>
              <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <p className="automation-ai-note">
          AI-assisted replies and business workflows are available as part of Kaana&apos;s platform and continue to improve over time.
        </p>
      </div>
    </section>
  );
}
