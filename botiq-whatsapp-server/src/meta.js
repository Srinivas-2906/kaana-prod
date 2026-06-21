import { getTenantById, getRequestTenantId } from './tenantContext.js';

const API_VERSION = process.env.META_API_VERSION || 'v21.0';
const DEFAULT_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const DEFAULT_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

if (!DEFAULT_PHONE_ID || !DEFAULT_TOKEN) {
  console.warn('⚠️  Missing Meta WhatsApp env vars. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env');
}

function getCredentials() {
  const tenant = getTenantById(getRequestTenantId());
  return {
    phoneId: tenant?.whatsapp_phone_id || DEFAULT_PHONE_ID,
    token: tenant?.whatsapp_token || DEFAULT_TOKEN,
  };
}

function normalizeTo(to) {
  return String(to).replace(/^whatsapp:/i, '').replace(/\D/g, '');
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);
}

export function optionId(option, index) {
  return `opt_${index}_${slugify(option)}`.slice(0, 256);
}

async function sendMessage(to, payload) {
  const { phoneId, token } = getCredentials();
  if (!phoneId || !token) throw new Error('WhatsApp not configured for this tenant');

  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizeTo(to),
        ...payload,
      }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || JSON.stringify(data));
  }
  return data;
}

export async function showTyping(messageId) {
  if (!messageId) return null;
  const { phoneId, token } = getCredentials();
  if (!phoneId || !token) return null;

  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
        typing_indicator: { type: 'text' },
      }),
    },
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || JSON.stringify(data));
  return data;
}

export async function sendText(to, body) {
  return sendMessage(to, { type: 'text', text: { body } });
}

export async function sendPropertyCard(to, card) {
  const caption = [
    `*${card.title}*`,
    card.location ? `${card.location} · ${card.bhk || card.category || ''}` : (card.subtitle || ''),
    `${card.price}${card.sqft ? ` · ${card.sqft}` : ''}`,
    card.status ? `_${card.status}_` : '',
  ].filter(Boolean).join('\n');

  const imageUrl = card.image || card.image_url;
  if (imageUrl) {
    return sendMessage(to, { type: 'image', image: { link: imageUrl, caption } });
  }
  return sendText(to, caption);
}

function formatOptionsBody(step, numbered = false) {
  const prompt = step.text || 'Please choose an option:';
  const lines = step.options.map((opt, i) =>
    numbered ? `${i + 1}. ${opt}` : `• ${opt}`,
  );
  return `${prompt}\n\n${lines.join('\n')}\n\n_Reply with the number or exact option text._`;
}

function canUseButtons(options) {
  return options.length <= 3 && options.every((o) => o.length <= 20);
}

export async function sendOptions(to, step) {
  const body = step.text || 'Please choose an option:';
  try {
    if (canUseButtons(step.options)) {
      await sendButtons(to, body, step.options);
    } else {
      await sendList(to, body, step.options);
    }
  } catch (err) {
    console.error('Meta interactive send failed, using text fallback:', err.message);
    await sendText(to, formatOptionsBody(step, true));
  }
}

async function sendButtons(to, body, options) {
  return sendMessage(to, {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body.slice(0, 1024) },
      action: {
        buttons: options.map((title, i) => ({
          type: 'reply',
          reply: { id: optionId(title, i), title: title.slice(0, 20) },
        })),
      },
    },
  });
}

async function sendList(to, body, options) {
  return sendMessage(to, {
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: body.slice(0, 1024) },
      action: {
        button: 'Choose',
        sections: [{
          title: 'Options',
          rows: options.map((item, i) => ({
            id: optionId(item, i),
            title: item.slice(0, 24),
            description: item.length > 24 ? item.slice(0, 72) : ' ',
          })),
        }],
      },
    },
  });
}

export function resolvePayload(payload, options) {
  if (!payload) return null;
  const idx = options.findIndex((_, i) => payload === optionId(options[i], i));
  if (idx >= 0) return options[idx];
  return options.find((opt) => opt.toLowerCase() === payload.toLowerCase()) ?? null;
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendDocument(to, url, filename, caption) {
  return sendMessage(to, {
    type: 'document',
    document: { link: url, filename: filename || 'document.pdf', caption: caption || '' },
  });
}
