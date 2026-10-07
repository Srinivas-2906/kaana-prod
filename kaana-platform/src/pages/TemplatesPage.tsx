import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getToken,
  fetchWhatsAppTemplates,
  createWhatsAppTemplate,
  refreshWhatsAppTemplateStatus,
  type WhatsAppTemplate,
} from '../lib/api';
import './dashboard.css';

const CATEGORIES = ['UTILITY', 'MARKETING', 'AUTHENTICATION'] as const;

export function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    language: 'en',
    category: 'UTILITY' as (typeof CATEGORIES)[number],
    body: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [refreshingName, setRefreshingName] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchWhatsAppTemplates();
      setTemplates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    void loadTemplates();
  }, [loadTemplates, navigate]);

  async function submitTemplate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    setError('');
    try {
      const { template } = await createWhatsAppTemplate(form);
      setMsg(`Submitted "${template.name}" to Meta (status: ${template.status}).`);
      setForm({ name: '', language: 'en', category: 'UTILITY', body: '' });
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function refreshStatus(name: string) {
    setRefreshingName(name);
    setError('');
    try {
      const { template } = await refreshWhatsAppTemplateStatus(name);
      setTemplates((prev) =>
        prev.map((t) => (t.name === template.name ? { ...t, ...template } : t)),
      );
      setMsg(`Refreshed status for ${template.name}: ${template.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setRefreshingName(null);
    }
  }

  return (
    <main className="dash-page">
      <div className="dash-inner">
        <header className="dash-header">
          <div>
            <p className="dash-kicker">Bot IQ · WhatsApp</p>
            <h1>Message templates</h1>
            <p className="dash-sub">
              List and submit templates on your connected WhatsApp Business Account via Meta Graph API.
            </p>
          </div>
          <Link to="/dashboard" className="btn btn-ghost">← Dashboard</Link>
        </header>

        {error && <p className="dash-msg dash-msg-error">{error}</p>}
        {msg && <p className="dash-msg">{msg}</p>}

        <section className="dash-card dash-card-wide templates-create">
          <h2>Create &amp; submit template</h2>
          <form className="templates-form" onSubmit={submitTemplate}>
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="appointment_reminder"
                required
              />
            </label>
            <label>
              Language
              <input
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                placeholder="en"
                required
              />
            </label>
            <label>
              Category
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as (typeof CATEGORIES)[number] })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="templates-body">
              Body
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                placeholder="Your appointment is confirmed for {{1}}."
                required
              />
            </label>
            <div className="templates-form-actions">
              <button type="submit" className="btn btn-accent" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit to Meta'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void loadTemplates()} disabled={loading}>
                Refresh list
              </button>
            </div>
          </form>
        </section>

        <section className="dash-card dash-card-wide">
          <div className="templates-list-head">
            <h2>Templates on your WABA</h2>
            {loading && <span className="templates-loading">Loading…</span>}
          </div>
          {!loading && templates.length === 0 && (
            <p>No templates returned from Meta yet. Create one above or refresh after Embedded Signup.</p>
          )}
          {templates.length > 0 && (
            <div className="templates-table-wrap">
              <table className="templates-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Language</th>
                    <th>Body</th>
                    <th>Meta status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={`${t.name}-${t.language}`}>
                      <td><code>{t.name}</code></td>
                      <td>{t.category}</td>
                      <td>{t.language}</td>
                      <td className="templates-body-cell">{t.body || '—'}</td>
                      <td><span className={`templates-status templates-status-${(t.status || '').toLowerCase()}`}>{t.status}</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={refreshingName === t.name}
                          onClick={() => void refreshStatus(t.name)}
                        >
                          {refreshingName === t.name ? '…' : 'Refresh status'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
