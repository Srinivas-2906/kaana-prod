import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM;

if (!accountSid || !authToken || !from) {
  console.warn('⚠️  Missing Twilio env vars. Copy .env.example → .env and fill credentials.');
}

const client = twilio(accountSid, authToken);

/** Cache Content SIDs so we don't recreate templates every message */
const contentCache = new Map();

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);
}

function optionId(option, index) {
  return `opt_${index}_${slugify(option)}`.slice(0, 200);
}

export async function showTyping() {
  /* Twilio does not expose WhatsApp typing indicators */
}

export async function sendText(to, body) {
  return client.messages.create({ from, to, body });
}

export async function sendPropertyCard(to, card) {
  const caption = [
    `*${card.title}*`,
    card.location,
    `${card.price} · ${card.sqft}`,
    `_${card.status}_`,
  ].join('\n');

  return client.messages.create({
    from,
    to,
    body: caption,
    mediaUrl: [card.image],
  });
}

/**
 * Send interactive buttons (≤3) or a list picker (>3).
 * Falls back to numbered plain text if Content API fails.
 */
export async function sendOptions(to, step) {
  const { options, text } = step;
  const body = text || formatOptionsBody(step);

  try {
    if (options.length <= 3) {
      await sendQuickReply(to, body, options);
    } else {
      await sendListPicker(to, body, options);
    }
  } catch (err) {
    console.error('Interactive send failed, using text fallback:', err.message);
    await sendText(to, formatOptionsBody(step, true));
  }
}

function formatOptionsBody(step, numbered = false) {
  const prompt = step.text || 'Please choose an option:';
  const lines = step.options.map((opt, i) =>
    numbered ? `${i + 1}. ${opt}` : `• ${opt}`,
  );
  return `${prompt}\n\n${lines.join('\n')}\n\n_Reply with the number or exact option text._`;
}

async function sendQuickReply(to, body, options) {
  const cacheKey = `qr:${body}:${options.join('|')}`;
  let contentSid = contentCache.get(cacheKey);

  if (!contentSid) {
    const content = await client.content.v1.contents.create({
      friendly_name: `propbot_qr_${slugify(body)}_${Date.now()}`,
      language: 'en',
      types: {
        'twilio/quick-reply': {
          body,
          actions: options.map((title, i) => ({
            title: title.slice(0, 20),
            id: optionId(title, i),
          })),
        },
      },
    });
    contentSid = content.sid;
    contentCache.set(cacheKey, contentSid);
  }

  return client.messages.create({ from, to, contentSid });
}

async function sendListPicker(to, body, options) {
  const cacheKey = `lp:${body}:${options.join('|')}`;
  let contentSid = contentCache.get(cacheKey);

  if (!contentSid) {
    const content = await client.content.v1.contents.create({
      friendly_name: `propbot_list_${slugify(body)}_${Date.now()}`,
      language: 'en',
      types: {
        'twilio/list-picker': {
          body,
          button: 'Choose',
          items: options.map((item, i) => ({
            id: optionId(item, i),
            item: item.slice(0, 24),
            description: item.length > 24 ? item.slice(0, 72) : '',
          })),
        },
      },
    });
    contentSid = content.sid;
    contentCache.set(cacheKey, contentSid);
  }

  return client.messages.create({ from, to, contentSid });
}

/** Map button/list payload back to the original option label */
export function resolvePayload(payload, options) {
  if (!payload) return null;
  const idx = options.findIndex((_, i) => payload === optionId(options[i], i));
  if (idx >= 0) return options[idx];
  return options.find((opt) => opt.toLowerCase() === payload.toLowerCase()) ?? null;
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
