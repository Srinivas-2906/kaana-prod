import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/index.js';
import { handleIncomingMessage } from './conversation.js';
import { activeProvider } from './messaging.js';
import { getTenantByWhatsAppPhoneId } from './tenantContext.js';
import apiRouter from './api.js';
import platformRouter from './routes/platform.js';
import billingRouter from './routes/billing.js';

initDatabase();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'propbot_verify_token';

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-Slug');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use('/api/platform', platformRouter);
app.use('/api/billing', billingRouter);
app.use('/api', apiRouter);
app.use('/listings', express.static(path.join(__dirname, '../public/listings')));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'Kaana Platform API',
    multiTenant: true,
    platform: '/api/platform',
    provider: activeProvider,
    endpoints: {
      webhook: '/webhook/whatsapp',
      listings: '/listings',
      conversations: '/api/conversations',
      leads: '/api/leads',
      properties: '/api/properties',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, provider: activeProvider });
});

function handleMetaVerify(req, res) {
  if (activeProvider !== 'meta') {
    return res.status(404).send('Meta webhook verification only applies when WHATSAPP_PROVIDER=meta');
  }

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Meta webhook verified');
    return res.status(200).send(challenge);
  }

  console.warn('❌ Meta webhook verification failed');
  return res.sendStatus(403);
}

app.get('/webhook/whatsapp', handleMetaVerify);
app.get('/webhook', handleMetaVerify);

async function handleInboundWebhook(req, res) {
  if (activeProvider === 'meta') {
    res.sendStatus(200);
    try {
      await handleMetaWebhook(req.body);
    } catch (err) {
      console.error('Meta webhook error:', err);
    }
    return;
  }

  const from = req.body.From;
  const body = req.body.Body || '';
  const buttonPayload = req.body.ButtonPayload || req.body.ListId || '';

  console.log(`📩 ${from}: ${body || buttonPayload || '(empty)'}`);
  res.status(200).send('<Response></Response>');

  try {
    await handleIncomingMessage(from, body, buttonPayload);
  } catch (err) {
    console.error('Webhook handler error:', err);
  }
}

app.post('/webhook/whatsapp', handleInboundWebhook);
app.post('/webhook', handleInboundWebhook);

async function handleMetaWebhook(body) {
  if (body.object !== 'whatsapp_business_account') return;

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages?.length) continue;

      const phoneNumberId = value.metadata?.phone_number_id;
      const tenant = getTenantByWhatsAppPhoneId(phoneNumberId);
      const tenantId = tenant?.id || process.env.DEFAULT_TENANT_ID || 'prestige-properties';

      for (const msg of value.messages) {
        const from = msg.from;
        let text = '';
        let payload = '';

        if (msg.type === 'text') {
          text = msg.text?.body ?? '';
        } else if (msg.type === 'interactive') {
          const btn = msg.interactive?.button_reply;
          const list = msg.interactive?.list_reply;
          if (btn) {
            payload = btn.id;
            text = btn.title;
          } else if (list) {
            payload = list.id;
            text = list.title;
          }
        } else {
          continue;
        }

        console.log(`📩 +${from}: ${text || payload || '(empty)'}`);

        try {
          await handleIncomingMessage(from, text, payload, msg.id, tenantId);
        } catch (err) {
          if (String(err.message).includes('Authentication')) {
            console.error('❌ Meta token expired — run: npm run test-token');
            console.error('   Update WHATSAPP_ACCESS_TOKEN in .env then restart server');
          } else {
            console.error('Handler error:', err);
          }
        }
      }
    }
  }
}

app.listen(PORT, () => {
  console.log('');
  console.log('🏠 Kaana Platform — WhatsApp Server');
  console.log(`   Provider:   ${activeProvider}`);
  console.log(`   API:        http://localhost:${PORT}/api`);
  console.log(`   Listings:   http://localhost:${PORT}/listings`);
  console.log(`   Webhook:    http://localhost:${PORT}/webhook`);
  console.log(`   Dashboard:  polls /api/conversations & /api/leads`);
  console.log('');
  if (activeProvider === 'meta') {
    verifyMetaTokenOnStart();
  }
});

async function verifyMetaTokenOnStart() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.META_API_VERSION || 'v21.0';
  if (!token || !phoneId) return;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${phoneId}?fields=display_phone_number`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.ok) {
      console.log('✅ Meta access token valid');
      return;
    }
    console.error('\n⚠️  Meta access token EXPIRED or invalid — bot cannot reply on WhatsApp');
    console.error('   Run: npm run test-token');
    console.error('   Then paste new token into .env → WHATSAPP_ACCESS_TOKEN\n');
  } catch {
    /* offline check skipped */
  }
}
