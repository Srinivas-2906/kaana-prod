/**
 * Messaging provider facade.
 * Set WHATSAPP_PROVIDER=meta  → Meta Cloud API (your setup)
 * Set WHATSAPP_PROVIDER=twilio → Twilio WhatsApp
 */

const provider = (process.env.WHATSAPP_PROVIDER || 'meta').toLowerCase();

let impl;

if (provider === 'twilio') {
  impl = await import('./twilio.js');
} else if (provider === 'meta') {
  impl = await import('./meta.js');
} else {
  throw new Error(`Unknown WHATSAPP_PROVIDER: ${provider}. Use "meta" or "twilio".`);
}

export const sendText = impl.sendText;
export const sendPropertyCard = impl.sendPropertyCard;
export const sendOptions = impl.sendOptions;
export const resolvePayload = impl.resolvePayload;
export const delay = impl.delay;
export const showTyping = impl.showTyping ?? (async () => {});

export const activeProvider = provider;
