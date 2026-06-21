import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getToken, API, apiPatch, BOTIQ, CRM } from '../lib/api';
import { whatsappHref } from '../lib/admin';
import type { OnboardingIntake } from '../lib/onboarding';
import './dashboard.css';
import './onboarding.css';

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function fmtInr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

type TenantDetail = {
  tenant: {
    id: string;
    slug: string;
    name: string;
    industry: string;
    plan: string;
    status: string;
    stage: string;
    stageLabel: string;
    ownerEmail: string;
    ownerName: string;
    agentPhone: string;
    whatsappConnected?: boolean;
    whatsappNumber?: string;
    createdAt: string;
    trialEndsAt: string | null;
    trialDaysLeft: number | null;
    intake?: OnboardingIntake;
    subscription: { plan: string; status: string; amountInr: number; periodEnd: string | null } | null;
  };
  usage: {
    conversationsTotal: number;
    leadsTotal: number;
    botReplies: number;
    messagesSent: number;
  };
  activity: { conversations7d: number; messages7d: number };
  links: { botiq: string; crm: string; listings: string };
};

export function AdminTenantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TenantDetail | null>(null);
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  function load() {
    const token = getToken();
    if (!token) { navigate('/login?next=/admin'); return; }
    fetch(`${API}/admin/tenants/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || 'Not found');
        setData(json);
        setNotes(json.tenant?.intake?.adminNotes || '');
      })
      .catch((e) => setError(e.message));
  }

  useEffect(() => { load(); }, [id, navigate]);

  async function activate() {
    if (!id) return;
    setActivating(true);
    try {
      await apiPatch(`/admin/tenants/${id}/activate`, {});
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Activation failed');
    } finally {
      setActivating(false);
    }
  }

  async function saveNotes() {
    if (!id) return;
    setSavingNotes(true);
    try {
      await apiPatch(`/admin/tenants/${id}/notes`, { adminNotes: notes });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSavingNotes(false);
    }
  }

  if (error && !data) {
    return (
      <main className="page-main dash-page" id="main-content">
        <div className="container"><p>{error}</p><Link to="/admin">← Admin</Link></div>
      </main>
    );
  }

  if (!data) return <main className="page-main" id="main-content"><div className="container">Loading…</div></main>;

  const t = data.tenant;
  const phone = t.agentPhone || t.whatsappNumber || '';
  const waText = `Hi ${t.ownerName || t.name}, this is Kaana — following up on your setup.`;
  const waLink = phone ? whatsappHref(phone, waText) : null;

  return (
    <main className="page-main dash-page" id="main-content">
      <div className="container">
        <p className="dash-links"><Link to="/admin?tab=businesses">← All businesses</Link></p>

        <div className="dash-header">
          <div>
            <p className="section-label">{t.stageLabel}</p>
            <h1>{t.name}</h1>
            <p className="dash-plan">{t.slug} · {t.industry} · {t.plan}</p>
          </div>
          <div className="dash-header-actions">
            {t.stage === 'ready_to_activate' && (
              <button type="button" className="btn btn-accent" disabled={activating} onClick={activate}>
                {activating ? 'Activating…' : 'Mark live'}
              </button>
            )}
            {waLink && (
              <a href={waLink} className="btn btn-ghost" target="_blank" rel="noreferrer">WhatsApp</a>
            )}
            <a href={`mailto:${t.ownerEmail}`} className="btn btn-ghost">Email</a>
          </div>
        </div>

        {error && <p className="dash-msg" style={{ color: '#e55' }}>{error}</p>}

        <div className="dash-stats" style={{ marginBottom: 28 }}>
          <div className="dash-stat">
            <strong>{t.trialDaysLeft ?? '—'}</strong>
            <span>Trial days left</span>
          </div>
          <div className="dash-stat">
            <strong>{data.usage.conversationsTotal}</strong>
            <span>Conversations</span>
          </div>
          <div className="dash-stat">
            <strong>{data.usage.leadsTotal}</strong>
            <span>CRM leads</span>
          </div>
          <div className="dash-stat">
            <strong>{data.activity.conversations7d}</strong>
            <span>Active convos (7d)</span>
          </div>
          <div className="dash-stat">
            <strong>{data.usage.botReplies}</strong>
            <span>Bot replies (month)</span>
          </div>
          <div className="dash-stat">
            <strong>{t.whatsappConnected ? 'Yes' : 'No'}</strong>
            <span>WhatsApp connected</span>
          </div>
        </div>

        <div className="dash-grid">
          <section className="dash-card">
            <h2>Contact</h2>
            <ul className="admin-detail-list">
              <li><span>Owner</span><strong>{t.ownerName || '—'}</strong></li>
              <li><span>Email</span><a href={`mailto:${t.ownerEmail}`}>{t.ownerEmail || '—'}</a></li>
              <li><span>Phone</span>{phone || '—'}</li>
              <li><span>Signed up</span>{fmtDate(t.createdAt)}</li>
              <li><span>Trial ends</span>{fmtDate(t.trialEndsAt)}</li>
            </ul>
          </section>

          <section className="dash-card">
            <h2>Billing</h2>
            {t.subscription ? (
              <ul className="admin-detail-list">
                <li><span>Plan</span><strong>{t.subscription.plan}</strong></li>
                <li><span>Status</span>{t.subscription.status}</li>
                <li><span>Amount</span>{fmtInr(t.subscription.amountInr)}</li>
                <li><span>Period end</span>{fmtDate(t.subscription.periodEnd)}</li>
              </ul>
            ) : (
              <p className="dash-plan">No payment yet — on {t.plan} plan.</p>
            )}
          </section>

          <section className="dash-card dash-card-wide">
            <h2>Questionnaire</h2>
            {t.intake?.answers && Object.keys(t.intake.answers).length > 0 ? (
              <pre className="admin-intake-json">{JSON.stringify(t.intake.answers, null, 2)}</pre>
            ) : (
              <p className="dash-plan">Not submitted yet ({t.intake?.status ?? 'draft'}).</p>
            )}
          </section>

          <section className="dash-card dash-card-wide">
            <h2>Admin notes</h2>
            <textarea
              className="admin-notes-input"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Call notes, setup checklist, follow-up date…"
            />
            <button type="button" className="btn btn-ghost" disabled={savingNotes} onClick={saveNotes} style={{ marginTop: 10 }}>
              {savingNotes ? 'Saving…' : 'Save notes'}
            </button>
          </section>

          <section className="dash-card">
            <h2>Open apps</h2>
            <div className="admin-link-stack">
              <a href={BOTIQ} target="_blank" rel="noreferrer" className="btn btn-ghost">BotIQ inbox</a>
              <a href={CRM} target="_blank" rel="noreferrer" className="btn btn-ghost">PropCRM</a>
              <a href={data.links.listings} target="_blank" rel="noreferrer" className="btn btn-ghost">Mini-site</a>
            </div>
            <p className="dash-plan" style={{ marginTop: 12 }}>Log in as the customer to see their workspace, or use platform admin tools above.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
