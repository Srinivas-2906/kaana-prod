import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  verifyMetaWebhookSignature,
  webhookSignatureRequired,
} from '../src/services/metaWebhookSignature.js';

const SECRET = 'test-app-secret-not-real';

function signBody(body, secret) {
  const hex = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return `sha256=${hex}`;
}

test('accepts valid X-Hub-Signature-256', () => {
  const raw = Buffer.from('{"object":"whatsapp_business_account"}');
  const header = signBody(raw, SECRET);
  const result = verifyMetaWebhookSignature(raw, header, SECRET);
  assert.equal(result.ok, true);
});

test('rejects wrong secret', () => {
  const raw = Buffer.from('{"object":"whatsapp_business_account"}');
  const header = signBody(raw, SECRET);
  const result = verifyMetaWebhookSignature(raw, header, 'other-secret');
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'signature_mismatch');
});

test('rejects missing header', () => {
  const raw = Buffer.from('{}');
  const result = verifyMetaWebhookSignature(raw, undefined, SECRET);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_signature');
});

test('rejects malformed header', () => {
  const raw = Buffer.from('{}');
  const result = verifyMetaWebhookSignature(raw, 'sha256=not-valid-hex', SECRET);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'invalid_signature_format');
});

test('webhookSignatureRequired honors skip flag', () => {
  const prevSkip = process.env.META_WEBHOOK_SKIP_SIGNATURE;
  const prevEnv = process.env.NODE_ENV;
  process.env.META_WEBHOOK_SKIP_SIGNATURE = '1';
  process.env.NODE_ENV = 'production';
  assert.equal(webhookSignatureRequired(), false);
  process.env.META_WEBHOOK_SKIP_SIGNATURE = prevSkip;
  process.env.NODE_ENV = prevEnv;
});
