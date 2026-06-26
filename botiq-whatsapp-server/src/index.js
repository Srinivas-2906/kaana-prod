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
import demoRouter from './routes/demo.js';
import { corsMiddleware } from './middleware/cors.js';
import { getWhatsAppDisplayNumber, setWhatsAppDisplayNumber } from './whatsappConfig.js';
import { startReminderScheduler } from './services/clinicReminders.js';

initDatabase();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'propbot_verify_token';

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(corsMiddleware);

app.use('/api/platform', platformRouter);
app.use('/api/billing', billingRouter);
app.use('/api/demo', demoRouter);
app.use('/api', apiRouter);
app.use('/listings', express.static(path.join(__dirname, '../public/listings')));
app.use('/services', express.static(path.join(__dirname, '../public/services')));

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
  console.log(`   Demo chat:  POST http://localhost:${PORT}/api/demo/whatsapp`);
  console.log(`   Listings:   http://localhost:${PORT}/listings`);
  console.log(`   Webhook:    http://localhost:${PORT}/webhook`);
  startReminderScheduler(60000);
  if (process.env.NODE_ENV !== 'production') {
    console.log('   Clinic login: demo@dentacare.in / demo1234');
  }
  console.log('');
  if (activeProvider === 'meta') {
    verifyMetaTokenOnStart();
  }
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Port ${PORT} is already in use. Stop the other server first:`);
    console.error(`   lsof -ti :${PORT} | xargs kill\n`);
    process.exit(1);
  }
  throw err;
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
      const data = await res.json();
      if (data.display_phone_number) {
        setWhatsAppDisplayNumber(data.display_phone_number);
        console.log('✅ Meta access token valid · WhatsApp:', data.display_phone_number);
      } else {
        console.log('✅ Meta access token valid');
      }
      return;
    }
    console.error('\n⚠️  Meta access token EXPIRED or invalid — bot cannot reply on WhatsApp');
    console.error('   Run: npm run test-token');
    console.error('   Then paste new token into .env → WHATSAPP_ACCESS_TOKEN\n');
  } catch {
    /* offline check skipped */
  }
}
