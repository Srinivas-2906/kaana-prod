import { gmailSendEnabled, sendViaGmail } from './gmailService.js';

const ROLE_LABELS = {
  viewer: 'View only',
  contributor: 'View & edit',
  manager: 'View, edit & manage team',
};

function roleLabel(role) {
  return ROLE_LABELS[role] || role;
}

function buildInviteHtml({ inviterName, projectName, inviteUrl, roleText }) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #0f172a;">
      <p style="margin: 0 0 1.25rem; font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #3b82f6;">
        Kaana Tracker
      </p>
      <h2 style="margin: 0 0 0.5rem;">You're invited to collaborate</h2>
      <p style="color: #475569; line-height: 1.5;">
        <strong>${inviterName}</strong> invited you to join
        <strong>${projectName}</strong> on <strong>Kaana Tracker</strong> as <strong>${roleText}</strong>.
      </p>
      <p style="margin: 1.5rem 0;">
        <a href="${inviteUrl}" style="display: inline-block; background: #3b82f6; color: #fff; text-decoration: none; padding: 0.75rem 1.25rem; border-radius: 0.5rem; font-weight: 600;">
          Accept invitation
        </a>
      </p>
      <p style="color: #64748b; font-size: 0.875rem;">
        Or copy this link: ${inviteUrl}
      </p>
      <p style="color: #94a3b8; font-size: 0.8125rem; margin-top: 2rem;">
        Kaana Tracker · <a href="https://tracker.kaana.in" style="color: #64748b;">tracker.kaana.in</a><br />
        If you weren't expecting this, you can ignore this email.
      </p>
    </div>
  `.trim();
}

async function sendViaResend({ from, to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Invite email failed:', res.status, body);
    let detail = '';
    try {
      const parsed = JSON.parse(body);
      detail = parsed.message || parsed.error || '';
    } catch {
      detail = body.slice(0, 200);
    }
    const message = detail
      ? `Failed to send invitation email: ${detail}`
      : 'Failed to send invitation email';
    return { error: message };
  }

  return { ok: true, provider: 'resend' };
}

export async function sendProjectInviteEmail({
  to,
  inviterName,
  projectName,
  inviteUrl,
  role,
  senderEmail,
}) {
  const roleText = roleLabel(role);
  const subject = `[Kaana Tracker] ${inviterName} invited you to ${projectName}`;
  const html = buildInviteHtml({ inviterName, projectName, inviteUrl, roleText });

  if (gmailSendEnabled() && senderEmail) {
    return sendViaGmail({
      fromEmail: senderEmail,
      fromName: inviterName,
      to,
      subject,
      html,
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVITE_FROM_EMAIL || process.env.RESEND_FROM || 'Kaana Tracker <onboarding@resend.dev>';
  const fromHeader = from.includes('<') ? from : `Kaana Tracker <${from}>`;

  if (!apiKey && !gmailSendEnabled()) {
    console.log(`[invite-email] From: ${senderEmail || from} | To: ${to} | ${inviteUrl}`);
    return { ok: true, dev: true };
  }

  if (!apiKey) {
    return { error: 'Gmail is not configured and no fallback email provider is available' };
  }

  return sendViaResend({ from: fromHeader, to, subject, html });
}
