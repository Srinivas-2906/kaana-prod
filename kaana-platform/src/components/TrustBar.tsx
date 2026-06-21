import { ShieldCheck, MessageCircle, Clock } from './KaanaIcons';
import './trust-bar.css';

const PROOF_ITEMS = [
  { Icon: ShieldCheck, text: 'Meta WhatsApp Business API' },
  { Icon: MessageCircle, text: 'Built for Indian businesses' },
  { Icon: ShieldCheck, text: 'Razorpay payments' },
  { Icon: Clock, text: 'Personal setup included' },
];

export function TrustBar() {
  return (
    <div className="trust-bar" role="complementary" aria-label="Social proof">
      <div className="trust-marquee-outer">
        <div className="trust-marquee-track" aria-hidden="true">
          {[...PROOF_ITEMS, ...PROOF_ITEMS].map((item, i) => (
            <span key={i} className="trust-marquee-item">
              <item.Icon size={14} aria-hidden="true" />
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
