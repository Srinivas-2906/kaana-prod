/**
 * Generic industry bot — works for all non-real-estate verticals.
 * Real estate uses conversation.js (full property flow).
 */
import { getClient, getRequestTenantId, checkTenantLimits, incrementUsage, runWithTenantAsync } from './tenantContext.js';
import { getCatalogItems } from './db/index.js';
import { getSession, resetSession, patchSession } from './sessions.js';
import { addMessage, updateConversation, setConversationName, createLead } from './store.js';
import { sendText, sendPropertyCard, sendOptions, resolvePayload, delay, showTyping } from './messaging.js';

const RESTART_RE = /^(hi|hello|hey|start|restart|bot)$/i;
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3002';

const INDUSTRY_MENUS = {
  clinic: ['📅 Book appointment', '💊 Services & pricing', '📋 Reports & queries', '📞 Talk to staff'],
  coaching: ['📚 Course info', '🎯 Book demo class', '💰 Fees & batches', '📞 Talk to counsellor'],
  salon: ['💇 Book slot', '✨ View services', '💎 Packages & offers', '📞 Talk to stylist'],
  retail: ['🛍️ Browse catalog', '📦 Track order', '🔄 Returns & exchange', '📞 Talk to store'],
  restaurant: ['🍽️ View menu', '📅 Reserve table', '🥡 Order takeaway', '📞 Call restaurant'],
  ecommerce: ['🛒 Shop now', '📦 Track order', '↩️ Returns', '📞 Support'],
  professional: ['📋 Book consultation', '💼 Services & fees', '📄 Document help', '📞 Talk to expert'],
  fitness: ['💪 Membership plans', '🏋️ Book trial', '📅 Class schedule', '📞 Talk to trainer'],
  education: ['🎓 Admissions', '📚 Courses & fees', '📅 Campus visit', '📞 Talk to counsellor'],
  'home-services': ['🔧 Book service', '💰 Get quote', '📅 Schedule visit', '📞 Talk to technician'],
  automotive: ['🚗 Browse vehicles', '🔧 Book service', '🛣️ Test drive', '📞 Talk to sales'],
  other: ['📋 Our services', '💰 Pricing', '📅 Book appointment', '📞 Talk to team'],
};

function normalize(text) {
  return (text || '').trim().replace(/\s+/g, ' ');
}

function matchOption(input, options) {
  const text = normalize(input);
  if (!text) return null;
  const lower = text.toLowerCase();
  const exact = options.find((o) => o.toLowerCase() === lower);
  if (exact) return exact;
  if (/^\d+$/.test(text)) {
    const num = parseInt(text, 10);
    if (num >= 1 && num <= options.length) return options[num - 1];
  }
  const partials = options.filter((o) => lower.includes(o.toLowerCase().slice(0, 8)) || o.toLowerCase().includes(lower));
  if (partials.length === 1) return partials[0];
  return null;
}

function pickOption(body, buttonPayload, options) {
  if (buttonPayload) {
    const fromPayload = resolvePayload(buttonPayload, options);
    if (fromPayload) return fromPayload;
  }
  return matchOption(body, options);
}

function listingsUrl(tenant) {
  return `${PUBLIC_URL.replace(/\/$/, '')}/listings?tenant=${tenant.slug}`;
}

async function botReply(phone, text, messageId) {
  if (messageId) {
    void showTyping(messageId).catch(() => {});
    await delay(350);
  }
  await sendText(phone, text);
  addMessage(phone, 'bot', text);
  incrementUsage(getRequestTenantId());
}

async function sendCatalogCard(phone, item) {
  await sendPropertyCard(phone, {
    title: item.title,
    subtitle: item.subtitle,
    price: item.price,
    location: item.location,
    bhk: item.category,
    image: item.image_url,
    image_url: item.image_url,
    status: item.status || 'Available',
  });
  addMessage(phone, 'bot', `${item.title} — ${item.price}`, { card: true });
  incrementUsage(getRequestTenantId());
}

export async function handleIndustryMessage(phone, body, buttonPayload, messageId, tenant) {
  return runWithTenantAsync(tenant.id, async () => {
    const limits = checkTenantLimits(tenant.id);
    if (!limits.ok) {
      await sendText(phone, limits.reason);
      return;
    }

    const client = getClient();
    const industry = tenant.industry || 'other';
    const menu = INDUSTRY_MENUS[industry] || INDUSTRY_MENUS.other;
    const session = getSession(phone);
    addMessage(phone, 'user', body || buttonPayload || '');

    if (RESTART_RE.test(body || '')) {
      resetSession(phone);
      patchSession(phone, { phase: 'menu', industry });
      const welcome = `${client.emoji} Hi! Welcome to *${client.name}*.\n\nI'm ${client.botName}. How can I help you today?`;
      await botReply(phone, welcome, messageId);
      await sendOptions(phone, { text: 'Choose an option:', options: menu });
      incrementUsage(tenant.id);
      return;
    }

    const phase = session.phase || 'menu';

    if (phase === 'menu') {
      const choice = pickOption(body, buttonPayload, menu);
      if (!choice) {
        await sendOptions(phone, { text: 'Please pick an option:', options: menu });
        return;
      }
      patchSession(phone, { phase: 'qualify', choice, step: 0 });

      if (/catalog|browse|shop|menu|services|membership|vehicles|course|admission/i.test(choice)) {
        const items = getCatalogItems(tenant.id).slice(0, 3);
        if (items.length) {
          await botReply(phone, `Here are our top picks 👇`, messageId);
          for (const item of items) await sendCatalogCard(phone, item);
          await sendOptions(phone, {
            text: 'What would you like to do next?',
            options: ['✅ Book / order', '📋 See more', '📞 Talk to team'],
          });
          patchSession(phone, { phase: 'after_catalog' });
        } else {
          await botReply(phone, `Visit our page: ${listingsUrl(client)}`, messageId);
        }
        return;
      }

      if (/track|order|report|return/i.test(choice)) {
        await botReply(phone, 'Please share your order/reference number and we\'ll check status right away.', messageId);
        patchSession(phone, { phase: 'track' });
        return;
      }

      if (/talk|call|agent|staff|support|counsellor|expert|trainer|sales|stylist/i.test(choice)) {
        patchSession(phone, { phase: 'agent' });
        createLead({ phone, name: session.name || 'WhatsApp Lead', stage: 'agent', note: choice, tenantId: tenant.id });
        updateConversation(phone, { status: 'agent' }, tenant.id);
        await botReply(phone, `${client.agentName} from our team will reply shortly. Average wait: under 10 minutes.`, messageId);
        return;
      }

      await botReply(phone, 'What date works best for you?', messageId);
      await sendOptions(phone, {
        text: 'Pick a slot:',
        options: ['Today', 'Tomorrow', 'This weekend', 'Flexible'],
      });
      patchSession(phone, { phase: 'book_date' });
      return;
    }

    if (phase === 'book_date') {
      const date = pickOption(body, buttonPayload, ['Today', 'Tomorrow', 'This weekend', 'Flexible']) || body;
      patchSession(phone, { phase: 'book_time', date });
      await sendOptions(phone, {
        text: `Great — ${date}. Preferred time?`,
        options: ['10:00 AM', '2:00 PM', '4:00 PM', 'Evening'],
      });
      return;
    }

    if (phase === 'book_time') {
      const time = pickOption(body, buttonPayload, ['10:00 AM', '2:00 PM', '4:00 PM', 'Evening']) || body;
      const items = getCatalogItems(tenant.id);
      const item = items[0];
      createLead({
        phone,
        name: session.name || 'WhatsApp Lead',
        property: item,
        budget: item?.price,
        bhk: item?.category,
        stage: 'site',
        note: `Booked: ${session.date || 'Flexible'} ${time}`,
        tenantId: tenant.id,
      });
      patchSession(phone, { phase: 'done', complete: true });
      await botReply(
        phone,
        `✅ Confirmed!\n📅 ${session.date || 'Flexible'} · ${time}\n${item ? `📌 ${item.title}` : ''}\n\nWe'll send a reminder before your visit.`,
        messageId,
      );
      await sendText(phone, `View more: ${listingsUrl(client)}`);
      return;
    }

    if (phase === 'after_catalog') {
      const choice = pickOption(body, buttonPayload, ['✅ Book / order', '📋 See more', '📞 Talk to team']);
      if (choice?.includes('Talk')) {
        patchSession(phone, { phase: 'agent' });
        createLead({ phone, stage: 'agent', tenantId: tenant.id });
        updateConversation(phone, { status: 'agent' }, tenant.id);
        await botReply(phone, `${client.agentName} will assist you shortly.`, messageId);
        return;
      }
      if (choice?.includes('more')) {
        await botReply(phone, listingsUrl(client), messageId);
        return;
      }
      patchSession(phone, { phase: 'book_date' });
      await sendOptions(phone, { text: 'When would you like to visit/order?', options: ['Today', 'Tomorrow', 'This weekend', 'Flexible'] });
      return;
    }

    if (phase === 'track') {
      createLead({ phone, stage: 'new', note: `Tracking: ${body}`, tenantId: tenant.id });
      await botReply(phone, `Thanks! We're checking on "${body}". You'll get an update shortly.`, messageId);
      patchSession(phone, { phase: 'menu' });
      return;
    }

    // Fallback
    await sendOptions(phone, { text: 'How can I help?', options: menu });
    patchSession(phone, { phase: 'menu' });
  });
}

export async function startIndustryConversation(phone, tenant) {
  const client = getClient();
  resetSession(phone);
  patchSession(phone, { phase: 'menu', industry: tenant.industry });
  const welcome = `${client.emoji} Hi! Welcome to *${client.name}*.\n\nI'm ${client.botName}. How can I help you today?`;
  const menu = INDUSTRY_MENUS[tenant.industry] || INDUSTRY_MENUS.other;
  await sendText(phone, welcome);
  addMessage(phone, 'bot', welcome);
  await sendOptions(phone, { text: 'Choose an option:', options: menu });
}
