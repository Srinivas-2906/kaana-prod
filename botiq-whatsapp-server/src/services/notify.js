import { nanoid } from 'nanoid';
import { getDb } from '../db/index.js';

const NOTIFY_EMAIL = process.env.KAANA_NOTIFY_EMAIL || 'srinivas@kaana.in';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'Kaana <onboarding@resend.dev>';

/**
 * Notify Kaana team — always logs + stores; emails when Resend is configured.
 */
export async function notifyKaana({ kind, subject, text, html }) {
  const db = getDb();
  const id = nanoid();
  const body = text || '';

  db.prepare(`
    INSERT INTO platform_notifications (id, kind, subject, body, sent_email)
    VALUES (?, ?, ?, ?, 0)
  `).run(id, kind || 'general', subject, body);

  if (!RESEND_API_KEY) {
    console.log(`[Kaana notify → ${NOTIFY_EMAIL}] ${subject}\n${body}`);
    return { ok: true, emailed: false, stored: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [NOTIFY_EMAIL],
        subject,
        html: html || `<pre style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(body)}</pre>`,
      }),
    });
    if (res.ok) {
      db.prepare('UPDATE platform_notifications SET sent_email = 1 WHERE id = ?').run(id);
      return { ok: true, emailed: true, stored: true };
    }
    const err = await res.text();
    console.error('[Kaana notify] Resend error:', err);
  } catch (e) {
    console.error('[Kaana notify]', e.message);
  }

  return { ok: true, emailed: false, stored: true };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function notifySignup({ businessName, name, email, phone, industry, plan }) {
  const text = [
    'New signup on Kaana',
    '',
    `Business: ${businessName}`,
    `Name: ${name || '—'}`,
    `Email: ${email}`,
    `Phone: ${phone || '—'}`,
    `Industry: ${industry || '—'}`,
    `Plan: ${plan || 'trial'}`,
    '',
    'Next: they should fill the setup questionnaire at /onboarding',
  ].join('\n');

  return notifyKaana({
    kind: 'signup',
    subject: `[Kaana] New signup — ${businessName}`,
    text,
    html: `<h2>New signup</h2><ul>
      <li><strong>Business:</strong> ${escapeHtml(businessName)}</li>
      <li><strong>Name:</strong> ${escapeHtml(name || '—')}</li>
      <li><strong>Email:</strong> ${escapeHtml(email)}</li>
      <li><strong>Phone:</strong> ${escapeHtml(phone || '—')}</li>
      <li><strong>Industry:</strong> ${escapeHtml(industry || '—')}</li>
      <li><strong>Plan:</strong> ${escapeHtml(plan || 'trial')}</li>
    </ul>`,
  });
}

export function notifyIntakeSubmitted({ tenantName, industry, email, phone, answers }) {
  const summary = Object.entries(answers || {})
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join('\n');

  const text = [
    'Setup questionnaire submitted',
    '',
    `Business: ${tenantName}`,
    `Industry: ${industry || '—'}`,
    `Email: ${email || '—'}`,
    `Phone: ${phone || '—'}`,
    '',
    'Answers:',
    summary || '(empty)',
  ].join('\n');

  return notifyKaana({
    kind: 'intake',
    subject: `[Kaana] Questionnaire done — ${tenantName}`,
    text,
  });
}

export function notifyPayment({ tenantName, plan, amount, paymentId, demo }) {
  const rupees = amount ? `₹${(amount / 100).toLocaleString('en-IN')}` : '—';
  const text = [
    demo ? 'Demo payment (Razorpay not configured)' : 'Payment received',
    '',
    `Business: ${tenantName}`,
    `Plan: ${plan}`,
    `Amount: ${rupees}`,
    paymentId ? `Payment ID: ${paymentId}` : '',
  ].filter(Boolean).join('\n');

  return notifyKaana({
    kind: 'payment',
    subject: `[Kaana] ${demo ? 'Demo plan' : 'Payment'} — ${tenantName} (${plan})`,
    text,
  });
}

export function notifySiteLead({ name, phone, source, path }) {
  const text = [
    'New homepage lead',
    '',
    `Name: ${name}`,
    `WhatsApp: ${phone}`,
    `Source: ${source || 'homepage'}`,
    path ? `Page: ${path}` : '',
  ].filter(Boolean).join('\n');

  return notifyKaana({
    kind: 'lead',
    subject: `[Kaana] New lead — ${name}`,
    text,
    html: `<h2>New lead from website</h2><ul>
      <li><strong>Name:</strong> ${escapeHtml(name)}</li>
      <li><strong>WhatsApp:</strong> ${escapeHtml(phone)}</li>
      <li><strong>Source:</strong> ${escapeHtml(source || 'homepage')}</li>
      ${path ? `<li><strong>Page:</strong> ${escapeHtml(path)}</li>` : ''}
    </ul>`,
  });
}
