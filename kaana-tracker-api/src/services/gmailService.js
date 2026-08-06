import { google } from 'googleapis';

function parseServiceAccountJson() {
  const raw = process.env.GMAIL_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    console.error('Invalid GMAIL_SERVICE_ACCOUNT_JSON');
    return null;
  }
}

export function gmailSendEnabled() {
  return Boolean(parseServiceAccountJson());
}

function allowedSenderDomains() {
  return (process.env.GMAIL_ALLOWED_DOMAINS || 'kaana.in')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedSenderEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const domain = normalized.split('@')[1];
  if (!domain) return false;
  return allowedSenderDomains().includes(domain);
}

function buildMimeMessage({ fromHeader, to, subject, html }) {
  return [
    `From: ${fromHeader}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\r\n');
}

function formatGmailError(detail, senderEmail) {
  if (String(detail).includes('invalid_grant')) {
    return [
      'Email could not be sent — Google Workspace delegation is not configured yet.',
      `Sign in as a real @kaana.in mailbox (currently ${senderEmail || 'unknown'}).`,
      'Your admin must authorize Client ID 107784437040244747788 with scope https://www.googleapis.com/auth/gmail.send in Google Admin → Security → API controls → Domain-wide delegation.',
      'Use the invite link below to share manually until email is enabled.',
    ].join(' ');
  }
  return `Failed to send invitation email: ${detail}`;
}

export async function sendViaGmail({
  fromEmail,
  fromName,
  to,
  subject,
  html,
}) {
  const credentials = parseServiceAccountJson();
  if (!credentials) {
    return { error: 'Gmail is not configured on the server' };
  }

  const sender = String(fromEmail || '').trim().toLowerCase();
  if (!isAllowedSenderEmail(sender)) {
    const domains = allowedSenderDomains().join(', ');
    return { error: `Invites can only be sent from a @${domains} Google Workspace address` };
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: sender,
  });

  const gmail = google.gmail({ version: 'v1', auth });
  const fromHeader = fromName ? `${fromName} via Kaana Tracker <${sender}>` : `Kaana Tracker <${sender}>`;
  const raw = Buffer.from(buildMimeMessage({ fromHeader, to, subject, html })).toString('base64url');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
    return { ok: true, provider: 'gmail' };
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    console.error('Gmail send failed:', sender, detail);
    return { error: formatGmailError(detail, sender) };
  }
}
