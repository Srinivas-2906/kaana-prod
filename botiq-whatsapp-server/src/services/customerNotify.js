import { notifyKaana } from './notify.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'Kaana <onboarding@resend.dev>';
const PLATFORM_URL = (process.env.KAANA_PLATFORM_URL || 'http://localhost:5180').replace(/\/$/, '');
const BOTIQ_URL = (process.env.KAANA_BOTIQ_URL || 'http://localhost:5174').replace(/\/$/, '');
const WALKTHROUGH_URL = process.env.KAANA_SETUP_WALKTHROUGH_URL || `${PLATFORM_URL}/#how-it-works`;
const API_VERSION = process.env.META_API_VERSION || 'v21.0';
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

async function sendPlatformWhatsApp(to, body) {
  const normalized = normalizePhone(to);
  if (!normalized || !PHONE_ID || !WA_TOKEN) {
    console.log(`[Kaana customer WA → ${to || '—'}] (not sent — missing phone or Meta env)\n${body}`);
    return { ok: false, sent: false, reason: 'not_configured' };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalized,
          type: 'text',
          text: { body },
        }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      console.error('[Kaana customer WA]', data?.error?.message || JSON.stringify(data));
      return { ok: false, sent: false, reason: data?.error?.message || 'api_error' };
    }
    return { ok: true, sent: true };
  } catch (e) {
    console.error('[Kaana customer WA]', e.message);
    return { ok: false, sent: false, reason: e.message };
  }
}

async function sendCustomerEmail({ to, subject, text, html }) {
  if (!to || !RESEND_API_KEY) {
    console.log(`[Kaana customer email → ${to || '—'}] ${subject}\n${text}`);
    return { ok: true, emailed: false };
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
        to: [to],
        subject,
        html: html || `<pre style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
      }),
    });
    if (res.ok) return { ok: true, emailed: true };
    console.error('[Kaana customer email]', await res.text());
  } catch (e) {
    console.error('[Kaana customer email]', e.message);
  }
  return { ok: true, emailed: false };
}

async function deliverCustomerMessage({ kind, email, phone, subject, text, html }) {
  const wa = await sendPlatformWhatsApp(phone, text);
  const em = await sendCustomerEmail({ to: email, subject, text, html });
  void notifyKaana({
    kind: `customer_${kind}`,
    subject: `[Customer ${kind}] ${subject}`,
    text: `To: ${email || '—'} / ${phone || '—'}\n\n${text}\n\nWA sent: ${wa.sent} · Email sent: ${em.emailed}`,
  });
  return { whatsapp: wa, email: em };
}

/** Message 1 — immediately after signup */
export function notifyCustomerSignup({ name, businessName, email, phone }) {
  const first = (name || 'there').split(' ')[0];
  const onboardingUrl = `${PLATFORM_URL}/onboarding`;
  const text = [
    `Thanks for signing up with Kaana, ${first}!`,
    '',
    `Next step: complete your setup form (about 5 minutes) so we can configure WhatsApp for ${businessName}.`,
    '',
    onboardingUrl,
    '',
    'Questions? Reply to this message anytime.',
  ].join('\n');

  return deliverCustomerMessage({
    kind: 'signup',
    email,
    phone,
    subject: `Next step: complete your Kaana setup form`,
    text,
    html: `<p>Hi ${escapeHtml(first)},</p>
      <p>Thanks for signing up with Kaana.</p>
      <p><strong>Next step:</strong> complete your setup form (about 5 minutes) so we can configure WhatsApp for <strong>${escapeHtml(businessName)}</strong>.</p>
      <p><a href="${escapeHtml(onboardingUrl)}">Complete setup form →</a></p>
      <p>Questions? Reply to our WhatsApp or email anytime.</p>`,
  });
}

/** Message 2 — after questionnaire submitted */
export function notifyCustomerIntakeSubmitted({ name, businessName, email, phone }) {
  const first = (name || 'there').split(' ')[0];
  const text = [
    `Hi ${first}, we received your setup details for ${businessName}.`,
    '',
    'No action needed from you right now.',
    '',
    'Our team will contact you on WhatsApp within 1–3 business days when your setup is ready.',
    '',
    `See how setup works (8 min): ${WALKTHROUGH_URL}`,
  ].join('\n');

  return deliverCustomerMessage({
    kind: 'intake_submitted',
    email,
    phone,
    subject: `We received your setup details — ${businessName}`,
    text,
    html: `<p>Hi ${escapeHtml(first)},</p>
      <p>We received your setup details for <strong>${escapeHtml(businessName)}</strong>.</p>
      <p><strong>No action needed from you right now.</strong></p>
      <p>Our team will contact you on WhatsApp within <strong>1–3 business days</strong> when your setup is ready.</p>
      <p><a href="${escapeHtml(WALKTHROUGH_URL)}">See how setup works (8 min)</a></p>`,
  });
}

/** Message 3 — after admin activation */
export function notifyCustomerActivated({ name, businessName, email, phone, trialEndsAt }) {
  const first = (name || 'there').split(' ')[0];
  const trialEnd = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '14 days from today';
  const dashboardUrl = `${PLATFORM_URL}/dashboard`;
  const text = [
    `You're live on Kaana, ${first}!`,
    '',
    `Open your inbox: ${BOTIQ_URL}`,
    `Dashboard: ${dashboardUrl}`,
    '',
    `Your 14-day trial runs until ${trialEnd}. Founding price: ₹999/mo after trial.`,
    '',
    'Send a test message to your WhatsApp business number — it will appear in your inbox.',
  ].join('\n');

  return deliverCustomerMessage({
    kind: 'activated',
    email,
    phone,
    subject: `You're live on Kaana — ${businessName}`,
    text,
    html: `<p>Hi ${escapeHtml(first)},</p>
      <p><strong>You're live on Kaana!</strong></p>
      <ul>
        <li><a href="${escapeHtml(BOTIQ_URL)}">Open your inbox</a></li>
        <li><a href="${escapeHtml(dashboardUrl)}">Open dashboard</a></li>
      </ul>
      <p>Your 14-day trial runs until <strong>${escapeHtml(trialEnd)}</strong>. Founding price: ₹999/mo after trial.</p>
      <p>Send a test message to your WhatsApp business number — it will appear in your inbox.</p>`,
  });
}
