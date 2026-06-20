import { Link } from 'react-router-dom';
import { useIndustry } from '../context/IndustryContext';
import { CTA } from '../lib/onboarding';
import { DemoBotIQ, DemoCRM } from './demos/ProductDemos';
import './home-demo.css';

type DemoKind = 'inbox' | 'crm';

const CONFIG: Record<DemoKind, {
  kicker: string;
  title: string;
  accent: string;
  desc: string;
  bullets: string[];
}> = {
  inbox: {
    kicker: 'Team inbox',
    title: 'Reply as a team',
    accent: 'from one WhatsApp number',
    desc: 'See every WhatsApp message in one place. Assign chats, take over from automatic replies, and never lose a conversation.',
    bullets: [
      'Multiple team members, one business number',
      'Full chat history in one thread',
      'Take over from automatic replies anytime',
    ],
  },
  crm: {
    kicker: 'Lead tracking',
    title: 'Track every enquiry',
    accent: 'from first message to sale',
    desc: 'Leads from WhatsApp land in your list automatically — with contact details, status, and follow-up reminders.',
    bullets: [
      'Every WhatsApp enquiry saved with name and number',
      'See stage from first message to closed deal',
      'Follow-ups so nothing slips through',
    ],
  },
};

type Props = {
  kind: DemoKind;
  id: string;
  flip?: boolean;
};

export function HomeProductDemo({ kind, id, flip }: Props) {
  const { industry, industryId } = useIndustry();
  const cfg = CONFIG[kind];
  const block = industry.showcase[kind];

  return (
    <section id={id} className={`home-demo home-demo-${kind} ${flip ? 'home-demo-flip' : ''}`}>
      <div className="container home-demo-inner">
        <div className="home-demo-copy">
          <p className="ultimate-kicker">{cfg.kicker}</p>
          <h2 className="ultimate-title">
            <span className="title-line">{cfg.title}</span>
            <span className={`title-line ${kind === 'crm' ? 'ultimate-accent-secondary' : 'ultimate-accent'}`}>
              {cfg.accent}
            </span>
          </h2>
          <p className="ultimate-desc">{block.desc || cfg.desc}</p>
          <ul className="home-demo-bullets">
            {cfg.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <Link to={`/signup?industry=${industryId}`} className="btn btn-accent">
            {CTA.primary}
          </Link>
        </div>

        <div className="home-demo-stage">
          <p className="home-demo-example home-demo-example-desktop">
            Example: <strong>{industry.businessName}</strong> · {industry.name}
          </p>
          <div className={`home-demo-frame home-demo-frame-${kind}`}>
            {kind === 'inbox' ? (
              <DemoBotIQ industry={industry} />
            ) : (
              <DemoCRM industry={industry} />
            )}
          </div>
          <p className="home-demo-hint home-demo-hint-desktop">
            {kind === 'inbox'
              ? 'Team inbox · updates when you switch industry'
              : 'Lead pipeline · synced from WhatsApp'}
          </p>
        </div>
      </div>
    </section>
  );
}
