import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getToken, clearAuth, API, apiPatch } from '../lib/api';
import { whatsappHref, leadStatusLabel, LEAD_STATUSES } from '../lib/admin';
import type { OnboardingIntake } from '../lib/onboarding';
import './dashboard.css';
import './onboarding.css';

type TenantRow = {
  id: string;
  slug: string;
  name: string;
  industry: string;
  plan: string;
  status: string;
  stage?: string;
  stageLabel?: string;
  whatsappConnected?: boolean;
  intakeSubmitted?: boolean;
  ownerEmail?: string;
  ownerName?: string;
  agentPhone?: string;
  createdAt?: string;
  trialDaysLeft?: number | null;
};

type SiteLead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  path: string;
  status: string;
  adminNotes: string;
  contactedAt: string | null;
  createdAt: string;
};

type QueueAction = {
  kind: string;
  priority: number;
  tenantId?: string;
  leadId?: string;
  title: string;
  detail: string;
  href: string;
};

type QueueData = {
  pipeline: Record<string, number>;
  stages: { id: string; label: string; count: number }[];
  actions: QueueAction[];
};

type Overview = {
  notifyEmail: string;
  emailConfigured: boolean;
  visitors: { pageviewsToday: number; pageviewsWeek: number; pageviewsTotal: number };
  signups: { today: number; week: number; total: number };
  leads?: { today: number; week: number; total: number };
  topPaths: { path: string; views: number }[];
  billing: { totalOrders: number; activeSubscriptions: number; revenueInr: number };
  recentEvents: { event_type: string; path: string; created_at: string }[];
  recentNotifications: { kind: string; subject: string; sent_email: number; created_at: string }[];
  recentPayments: {
    plan: string;
    amount: number;
    status: string;
    razorpay_payment_id: string | null;
    created_at: string;
    tenant_name: string;
  }[];
  recentLeads?: { name: string; phone: string; source: string; path: string; created_at: string }[];
};

type BillingRow = {
  id: string;
  tenantName: string;
  slug: string;
  ownerEmail: string;
  plan: string;
  status: string;
  amountInr: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  periodEnd: string | null;
};

type Tab = 'queue' | 'overview' | 'leads' | 'businesses' | 'billing';

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function fmtInr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function AdminPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'queue';
  const setTab = (t: Tab) => setSearchParams({ tab: t });

  const [data, setData] = useState<{
    tenants: TenantRow[];
    total: number;
    stats: { plan: string; count: number }[];
    pendingIntakes?: (OnboardingIntake & { tenantName: string; slug: string; industry: string })[];
    overview?: Overview;
    queue?: QueueData;
  } | null>(null);
  const [leads, setLeads] = useState<SiteLead[] | null>(null);
  const [billing, setBilling] = useState<BillingRow[] | null>(null);
  const [error, setError] = useState('');
  const [activating, setActivating] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingLead, setUpdatingLead] = useState('');

  function load() {
    const token = getToken();
    if (!token) { navigate('/login?next=/admin'); return; }
    fetch(`${API}/admin/tenants`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || 'Access denied');
        setData(json);
      })
      .catch((e) => setError(e.message));
  }

  function loadBilling() {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/admin/billing`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || 'Failed to load billing');
        setBilling(json.subscriptions ?? []);
      })
      .catch((e) => setError(e.message));
  }

  function loadLeads() {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/admin/leads`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || 'Failed to load leads');
        setLeads(json.leads ?? []);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(() => { load(); }, [navigate]);

  useEffect(() => {
    if (tab === 'billing' && billing === null) loadBilling();
    if (tab === 'leads' && leads === null) loadLeads();
  }, [tab, billing, leads]);

  async function updateLead(id: string, body: { status?: string; markContacted?: boolean }) {
    setUpdatingLead(id);
    try {
      await apiPatch(`/admin/leads/${id}`, body);
      loadLeads();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setUpdatingLead('');
    }
  }

  async function activate(tenantId: string) {
    setActivating(tenantId);
    try {
      await apiPatch(`/admin/tenants/${tenantId}/activate`, {});
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Activation failed');
    } finally {
      setActivating('');
    }
  }

  if (error && !data) {
    return (
      <main className="page-main dash-page" id="main-content">
        <div className="container"><p>{error}</p><Link to="/dashboard" className="btn btn-ghost">Back</Link></div>
      </main>
    );
  }

  if (!data) return <main className="page-main" id="main-content"><div className="container">Loading…</div></main>;

  const ov = data.overview;

  return (
    <main className="page-main dash-page" id="main-content">
      <div className="container">
        <div className="dash-header">
          <div>
            <p className="section-label">Platform admin</p>
            <h1>Kaana business tracker</h1>
            <p className="dash-plan">
              {data.total} businesses · alerts to <strong>{ov?.notifyEmail ?? 'srinivas@kaana.in'}</strong>
              {ov && !ov.emailConfigured && ' · add RESEND_API_KEY to send real emails'}
            </p>
          </div>
          <div className="dash-header-actions">
            <button type="button" className="btn btn-ghost" onClick={() => { load(); if (tab === 'billing') loadBilling(); if (tab === 'leads') loadLeads(); }}>Refresh</button>
            <button type="button" className="btn btn-ghost" onClick={() => { clearAuth(); navigate('/'); }}>Log out</button>
          </div>
        </div>

        <nav className="admin-tabs" aria-label="Admin sections">
          {([
            ['queue', 'Today'],
            ['overview', 'Overview'],
            ['leads', 'Leads'],
            ['businesses', 'Businesses'],
            ['billing', 'Billing'],
          ] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              type="button"
              className={`admin-tab${tab === t ? ' admin-tab-active' : ''}`}
              onClick={() => setTab(t)}
            >
              {label}
              {t === 'queue' && data.queue?.actions.length ? (
                <span className="admin-tab-count">{data.queue.actions.length}</span>
              ) : null}
            </button>
          ))}
        </nav>

        {error && <p className="dash-msg" style={{ color: 'var(--danger, #e55)' }}>{error}</p>}

        {tab === 'queue' && data.queue && (
          <>
            <div className="admin-pipeline">
              {data.queue.stages.filter((s) => s.count > 0).map((s) => (
                <div key={s.id} className="admin-pipeline-item">
                  <strong>{s.count}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: 16 }}>
                Needs attention ({data.queue.actions.length})
              </h2>
              {data.queue.actions.length === 0 ? (
                <p className="dash-plan">Nothing urgent — check back when you get a new signup or lead.</p>
              ) : (
                <ul className="admin-action-list">
                  {data.queue.actions.map((a, i) => (
                    <li key={`${a.kind}-${a.tenantId || a.leadId}-${i}`}>
                      <div>
                        <strong>{a.title}</strong>
                        <small>{a.detail}</small>
                      </div>
                      {a.href.startsWith('/admin/tenants/') ? (
                        <Link to={a.href} className="btn btn-ghost">Open</Link>
                      ) : (
                        <button type="button" className="btn btn-ghost" onClick={() => setTab('leads')}>View</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {tab === 'leads' && (
          <div className="dash-admin-table">
            {!leads ? (
              <p className="dash-plan">Loading leads…</p>
            ) : leads.length === 0 ? (
              <p className="dash-plan">No homepage leads yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>WhatsApp</th>
                    <th>Status</th>
                    <th>When</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td><strong>{l.name}</strong><br /><small>{l.source}</small></td>
                      <td>{l.phone}</td>
                      <td>
                        <select
                          className="admin-select"
                          value={l.status}
                          disabled={updatingLead === l.id}
                          onChange={(e) => updateLead(l.id, { status: e.target.value })}
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>{leadStatusLabel(s)}</option>
                          ))}
                        </select>
                      </td>
                      <td><small>{fmtDate(l.createdAt)}</small></td>
                      <td className="admin-row-actions">
                        <a
                          href={whatsappHref(l.phone, `Hi ${l.name}, this is Kaana — thanks for your interest!`)}
                          className="btn btn-ghost"
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                        {l.status === 'new' && (
                          <button
                            type="button"
                            className="btn btn-accent"
                            disabled={updatingLead === l.id}
                            onClick={() => updateLead(l.id, { markContacted: true })}
                          >
                            Mark contacted
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'overview' && ov && (
          <>
            <div className="dash-stats" style={{ marginBottom: 32 }}>
              <div className="dash-stat">
                <strong>{ov.visitors.pageviewsToday}</strong>
                <span>Page views today</span>
              </div>
              <div className="dash-stat">
                <strong>{ov.visitors.pageviewsWeek}</strong>
                <span>Page views (7 days)</span>
              </div>
              <div className="dash-stat">
                <strong>{ov.signups.week}</strong>
                <span>Signups (7 days)</span>
              </div>
              <div className="dash-stat">
                <strong>{ov.signups.total}</strong>
                <span>Total signups</span>
              </div>
              <div className="dash-stat">
                <strong>{ov.leads?.week ?? 0}</strong>
                <span>Leads (7 days)</span>
              </div>
              <div className="dash-stat">
                <strong>{ov.leads?.total ?? 0}</strong>
                <span>Total leads</span>
              </div>
              <div className="dash-stat">
                <strong>{ov.billing.activeSubscriptions}</strong>
                <span>Active plans</span>
              </div>
              <div className="dash-stat">
                <strong>{fmtInr(ov.billing.revenueInr)}</strong>
                <span>Subscription revenue</span>
              </div>
            </div>

            <div className="dash-grid" style={{ marginBottom: 32 }}>
              <section className="dash-card dash-card-wide">
                <h2>Top pages (30 days)</h2>
                {ov.topPaths.length === 0 ? (
                  <p className="dash-plan">No page views yet — visit the site to start tracking.</p>
                ) : (
                  <div className="dash-admin-table">
                    <table>
                      <thead><tr><th>Path</th><th>Views</th></tr></thead>
                      <tbody>
                        {ov.topPaths.map((p) => (
                          <tr key={p.path}><td><code>{p.path}</code></td><td>{p.views}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="dash-card">
                <h2>Recent alerts</h2>
                {ov.recentNotifications.length === 0 ? (
                  <p className="dash-plan">Signups and payments will appear here.</p>
                ) : (
                  <ul className="admin-feed">
                    {ov.recentNotifications.map((n, i) => (
                      <li key={`${n.created_at}-${i}`}>
                        <span className="admin-feed-kind">{n.kind}</span>
                        <strong>{n.subject}</strong>
                        <small>{fmtDate(n.created_at)}{n.sent_email ? ' · emailed' : ' · logged only'}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="dash-card">
                <h2>Recent leads</h2>
                {!ov.recentLeads?.length ? (
                  <p className="dash-plan">Homepage form submissions appear here.</p>
                ) : (
                  <ul className="admin-feed">
                    {ov.recentLeads.map((l, i) => (
                      <li key={`${l.created_at}-${i}`}>
                        <strong>{l.name}</strong>
                        <span>{l.phone}</span>
                        <small>{fmtDate(l.created_at)} · {l.source}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="dash-card">
                <h2>Recent visits</h2>
                {ov.recentEvents.length === 0 ? (
                  <p className="dash-plan">Anonymous page views from the marketing site.</p>
                ) : (
                  <ul className="admin-feed">
                    {ov.recentEvents.map((e, i) => (
                      <li key={`${e.created_at}-${i}`}>
                        <code>{e.path}</code>
                        <small>{fmtDate(e.created_at)}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {ov.recentPayments.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: '1.125rem', marginBottom: 12 }}>Recent payments</h2>
                <div className="dash-admin-table">
                  <table>
                    <thead><tr><th>Business</th><th>Plan</th><th>Amount</th><th>Status</th><th>When</th></tr></thead>
                    <tbody>
                      {ov.recentPayments.map((p, i) => (
                        <tr key={i}>
                          <td>{p.tenant_name}</td>
                          <td>{p.plan}</td>
                          <td>{fmtInr(Math.round((p.amount || 0) / 100))}</td>
                          <td>{p.status}</td>
                          <td><small>{fmtDate(p.created_at)}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {tab === 'businesses' && (
          <>
            {data.pendingIntakes && data.pendingIntakes.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: '1.125rem', marginBottom: 16 }}>Pending setup ({data.pendingIntakes.length})</h2>
                {data.pendingIntakes.map((item) => (
                  <article key={item.tenantId} className="dash-locked-banner" style={{ marginBottom: 12 }}>
                    <h3>{item.tenantName} · {item.industry}</h3>
                    <p>Intake: <strong>{item.status}</strong>{item.submittedAt ? ` · submitted ${fmtDate(item.submittedAt)}` : ''}</p>
                    <div className="dash-locked-actions">
                      <button type="button" className="btn btn-accent" disabled={!!activating} onClick={() => activate(item.tenantId!)}>
                        {activating === item.tenantId ? 'Activating…' : 'Mark live & seed catalog'}
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setExpanded(expanded === item.tenantId ? null : item.tenantId ?? null)}>
                        {expanded === item.tenantId ? 'Hide answers' : 'View answers'}
                      </button>
                    </div>
                    {expanded === item.tenantId && (
                      <pre className="admin-intake-json">{JSON.stringify(item.answers, null, 2)}</pre>
                    )}
                  </article>
                ))}
              </section>
            )}

            <div className="dash-admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Contact</th>
                    <th>Industry</th>
                    <th>Plan</th>
                    <th>Signed up</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.tenants.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <Link to={`/admin/tenants/${t.id}`}><strong>{t.name}</strong></Link><br />
                        <small>{t.slug}</small>
                      </td>
                      <td><span className="admin-badge-neutral">{t.stageLabel || t.status}</span></td>
                      <td>
                        {t.ownerName && <>{t.ownerName}<br /></>}
                        <a href={`mailto:${t.ownerEmail}`}>{t.ownerEmail || '—'}</a>
                        {t.agentPhone && <><br /><small>{t.agentPhone}</small></>}
                      </td>
                      <td>{t.industry}</td>
                      <td>{t.plan}</td>
                      <td><small>{fmtDate(t.createdAt)}</small></td>
                      <td>
                        <Link to={`/admin/tenants/${t.id}`} className="btn btn-ghost">View</Link>
                        {t.status === 'pending_onboarding' && t.intakeSubmitted && (
                          <button type="button" className="btn btn-accent" disabled={!!activating} onClick={() => activate(t.id)}>
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'billing' && (
          <div className="dash-admin-table">
            {!billing ? (
              <p className="dash-plan">Loading billing…</p>
            ) : billing.length === 0 ? (
              <p className="dash-plan">No subscription orders yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Owner email</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment ID</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.tenantName}</strong><br /><small>{b.slug}</small></td>
                      <td>{b.ownerEmail || '—'}</td>
                      <td>{b.plan}</td>
                      <td>{fmtInr(b.amountInr)}</td>
                      <td>{b.status}</td>
                      <td><small>{b.razorpayPaymentId || '—'}</small></td>
                      <td><small>{fmtDate(b.createdAt)}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <p className="dash-links" style={{ marginTop: 24 }}><Link to="/dashboard">← Workspace</Link></p>
      </div>
    </main>
  );
}
