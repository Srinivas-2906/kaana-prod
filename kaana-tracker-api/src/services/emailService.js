const ROLE_LABELS = {
  viewer: 'View only',
  contributor: 'View & edit',
  manager: 'View, edit & manage team',
};

function roleLabel(role) {
  return ROLE_LABELS[role] || role;
}

export async function sendProjectInviteEmail({
  to,
  inviterName,
  projectName,
  inviteUrl,
  role,
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVITE_FROM_EMAIL || 'Kaana Tracker <invites@kaana.in>';
  const subject = `${inviterName} invited you to ${projectName}`;
  const roleText = roleLabel(role);

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #0f172a;">
      <h2 style="margin-bottom: 0.5rem;">You're invited to collaborate</h2>
      <p style="color: #475569; line-height: 1.5;">
        <strong>${inviterName}</strong> invited you to join
        <strong>${projectName}</strong> on Kaana Tracker as <strong>${roleText}</strong>.
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
        If you weren't expecting this, you can ignore this email.
      </p>
    </div>
  `.trim();

  if (!apiKey) {
    console.log(`[invite-email] To: ${to} | ${inviteUrl}`);
    return { ok: true, dev: true };
  }

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
    return { error: 'Failed to send invitation email' };
  }

  return { ok: true };
}
