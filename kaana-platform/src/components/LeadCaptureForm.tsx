import { useState } from 'react';
import { API } from '../lib/api';
import { trackEvent } from '../lib/track';
import { trackAnalyticsEvent } from '../lib/analytics';

type LeadCaptureFormProps = {
  source?: string;
  className?: string;
};

export function LeadCaptureForm({ source = 'homepage', className = '' }: LeadCaptureFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const path = window.location.pathname + window.location.search;

    try {
      const res = await fetch(`${API}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, source, path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit');

      trackEvent('lead_submit', path, { name, phone });
      trackAnalyticsEvent('Lead Submit', { source });
      setDone(true);
      setName('');
      setPhone('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className={`lead-capture lead-capture-done ${className}`}>
        <p className="lead-capture-success">Thanks — we&apos;ll WhatsApp you within a few hours.</p>
        <button type="button" className="btn btn-ghost" onClick={() => setDone(false)}>
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form className={`lead-capture ${className}`} onSubmit={submit}>
      <p className="lead-capture-label">Not ready for full signup? Leave your number — we&apos;ll call you on WhatsApp.</p>
      <div className="lead-capture-fields">
        <input
          type="text"
          name="name"
          placeholder="Your name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <input
          type="tel"
          name="phone"
          placeholder="WhatsApp number"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
        <button type="submit" className="btn btn-accent" disabled={loading}>
          {loading ? 'Sending…' : 'Get a callback'}
        </button>
      </div>
      {error && <p className="lead-capture-error">{error}</p>}
      <p className="lead-capture-fine">No spam. Usually reply same day.</p>
    </form>
  );
}
