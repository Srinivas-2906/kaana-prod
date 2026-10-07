import crypto from 'crypto';

/**
 * Verify Meta WhatsApp webhook POST signature (X-Hub-Signature-256).
 * @param {Buffer|string} rawBody - Unparsed request body
 * @param {string|undefined} signatureHeader - Value of X-Hub-Signature-256
 * @param {string|undefined} appSecret - META_APP_SECRET
 */
export function verifyMetaWebhookSignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret) return { ok: false, reason: 'no_app_secret' };
  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return { ok: false, reason: 'missing_signature' };
  }
  const prefix = 'sha256=';
  if (!signatureHeader.startsWith(prefix)) {
    return { ok: false, reason: 'invalid_signature_format' };
  }
  const receivedHex = signatureHeader.slice(prefix.length);
  if (!/^[a-f0-9]{64}$/i.test(receivedHex)) {
    return { ok: false, reason: 'invalid_signature_format' };
  }

  const bodyBuf = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), 'utf8');
  const expectedHex = crypto.createHmac('sha256', appSecret).update(bodyBuf).digest('hex');

  const received = Buffer.from(receivedHex, 'hex');
  const expected = Buffer.from(expectedHex, 'hex');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    return { ok: false, reason: 'signature_mismatch' };
  }

  return { ok: true };
}

/** Whether POST webhooks must pass signature verification. */
export function webhookSignatureRequired() {
  if (process.env.META_WEBHOOK_SKIP_SIGNATURE === '1') return false;
  if (process.env.NODE_ENV === 'production') return true;
  return Boolean(process.env.META_APP_SECRET);
}

export function webhookSignatureConfigured() {
  return Boolean(process.env.META_APP_SECRET?.trim());
}
