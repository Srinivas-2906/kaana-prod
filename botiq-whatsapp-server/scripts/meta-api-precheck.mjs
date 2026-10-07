#!/usr/bin/env node
/**
 * Meta App Review api_precheck helper.
 * Requires .env with WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_ACCOUNT_ID.
 *
 * Usage:
 *   node scripts/meta-api-precheck.mjs messaging
 *   node scripts/meta-api-precheck.mjs template
 */
import 'dotenv/config';

const version = process.env.META_API_VERSION || 'v22.0';
const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const testTo = process.env.WHATSAPP_TEST_PHONE;

const mode = process.argv[2] || 'messaging';

if (!token) {
  console.error('Missing WHATSAPP_ACCESS_TOKEN in .env');
  process.exit(1);
}

async function run() {
  if (mode === 'messaging') {
    if (!phoneId || !testTo) {
      console.error('Need WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TEST_PHONE');
      process.exit(1);
    }
    const res = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: testTo.replace(/\D/g, ''),
        type: 'text',
        text: { body: 'Kaana api_precheck — whatsapp_business_messaging' },
      }),
    });
    const body = await res.json();
    console.log(JSON.stringify(body, null, 2));
    process.exit(res.ok ? 0 : 1);
  }

  if (mode === 'template') {
    if (!wabaId) {
      console.error('Need WHATSAPP_BUSINESS_ACCOUNT_ID');
      process.exit(1);
    }
    const name = `kaana_precheck_${Date.now()}`.slice(0, 512);
    const res = await fetch(`https://graph.facebook.com/${version}/${wabaId}/message_templates`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        language: 'en',
        category: 'UTILITY',
        components: [{ type: 'BODY', text: 'Kaana api_precheck — whatsapp_business_management.' }],
      }),
    });
    const body = await res.json();
    console.log(JSON.stringify(body, null, 2));
    process.exit(res.ok ? 0 : 1);
  }

  console.error('Usage: node scripts/meta-api-precheck.mjs messaging|template');
  process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
