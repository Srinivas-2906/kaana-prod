import { OAuth2Client } from 'google-auth-library';

export async function verifyGoogleIdToken(idToken, clientId) {
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new Error('Google account has no email address');
  }
  if (payload.email_verified === false) {
    throw new Error('Google email is not verified');
  }

  const name = [payload.given_name, payload.family_name].filter(Boolean).join(' ').trim()
    || payload.name
    || payload.email.split('@')[0];

  return {
    email: payload.email,
    name,
    googleSub: payload.sub,
  };
}
