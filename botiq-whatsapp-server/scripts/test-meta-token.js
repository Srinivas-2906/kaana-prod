import 'dotenv/config';

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const version = process.env.META_API_VERSION || 'v21.0';
const testTo = process.env.WHATSAPP_TEST_PHONE || '919008747926';

if (!token || token.includes('your_') || token === 'NEW_TOKEN') {
  console.error('❌ WHATSAPP_ACCESS_TOKEN is missing or still a placeholder in .env');
  console.error('   Get a token from Meta Developer Console → WhatsApp → API Setup');
  process.exit(1);
}

if (!phoneId) {
  console.error('❌ WHATSAPP_PHONE_NUMBER_ID is missing in .env');
  process.exit(1);
}

console.log('Checking token against Phone Number ID...');

const check = await fetch(
  `https://graph.facebook.com/${version}/${phoneId}?fields=display_phone_number,verified_name`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const checkData = await check.json();

if (!check.ok) {
  const msg = checkData?.error?.message ?? '';
  console.error('❌ Token invalid or expired');
  if (msg.includes('expired')) {
    console.error('   Your temporary Meta token expired (they last ~24 hours).');
  }
  console.error('\nFix:');
  console.error('  1. developers.facebook.com → your app → WhatsApp → API Setup');
  console.error('  2. Click "Generate access token" (or create System User permanent token)');
  console.error('  3. Paste into .env → WHATSAPP_ACCESS_TOKEN=...');
  console.error('  4. Restart: npm start');
  process.exit(1);
}

console.log('✅ Token works. Phone:', checkData.display_phone_number, '—', checkData.verified_name);

console.log(`\nSending hello_world template to ${testTo}...`);

const send = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messaging_product: 'whatsapp',
    to: testTo,
    type: 'template',
    template: { name: 'hello_world', language: { code: 'en_US' } },
  }),
});

const sendData = await send.json();

if (!send.ok) {
  console.error('❌ Send failed:');
  console.error(JSON.stringify(sendData, null, 2));
  process.exit(1);
}

console.log('✅ hello_world sent! Check WhatsApp on +', testTo);
console.log('   Message ID:', sendData.messages?.[0]?.id);
