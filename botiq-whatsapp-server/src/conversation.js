import { getClient, getRequestTenantId, runWithTenantAsync, checkTenantLimits, incrementUsage } from './tenantContext.js';
import { getTenantById } from './tenantContext.js';
import { handleIndustryMessage } from './industryBot.js';
import { handleClinicMessage } from './clinicBot.js';
import { searchProperties, getPropertyById, buildListingsUrl } from './data/properties.js';
import { getSession, resetSession, patchSession } from './sessions.js';
import {
  addMessage, updateConversation, setConversationName, createLead,
} from './store.js';
import { sendText, sendPropertyCard, sendOptions, resolvePayload, delay, showTyping } from './messaging.js';

const RESTART_RE = /^(hi|hello|hey|start|restart|propbot)$/i;
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3002';
const LISTINGS_BASE = process.env.LISTINGS_BASE_URL || `${PUBLIC_URL.replace(/\/$/, '')}/listings`;
const TYPING_DELAY_MS = Number(process.env.TYPING_DELAY_MS) || 350;

const MAIN_MENU = ['🏠 Browse properties', '📅 Book site visit', '💰 Check pricing', '📞 Talk to agent'];
const BHK_OPTIONS = ['2BHK Apartment', '3BHK Apartment', 'Villa', 'Commercial'];
const BUDGET_OPTIONS = ['₹50L - ₹75L', '₹75L - ₹1Cr', '₹1Cr - ₹1.5Cr', 'Above ₹1.5Cr'];
const DATE_OPTIONS = ['Tomorrow', 'This Saturday', 'This Sunday', 'Pick a date'];
const TIME_OPTIONS = ['10:00 AM', '11:00 AM', '12:00 PM', '3:00 PM'];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Next 10 calendar days for "Pick a date" (WhatsApp list max 10 rows) */
function getMoreDateOptions() {
  const options = [];
  for (let i = 1; i <= 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    options.push(`${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`);
  }
  return options;
}

function normalize(text) {
  return (text || '').trim().replace(/\s+/g, ' ');
}

export function matchOption(input, options, { kind } = {}) {
  const text = normalize(input);
  if (!text) return null;

  const lower = text.toLowerCase();

  const exact = options.find((o) => o.toLowerCase() === lower);
  if (exact) return exact;

  if (kind === 'bhk') {
    if (/\b2\s*bhk\b/i.test(text) || text === '2') return '2BHK Apartment';
    if (/\b3\s*bhk\b/i.test(text) || text === '3') return '3BHK Apartment';
    if (/\bvilla\b/i.test(text)) return 'Villa';
    if (/\bcommercial\b/i.test(text)) return 'Commercial';
  }

  if (kind === 'budget') {
    if (/above\s*1\.?5|1\.5\s*cr\+/i.test(text)) return 'Above ₹1.5Cr';
    if (/1\s*cr\s*[-–]\s*1\.?5|100\s*[-–]\s*150/i.test(text)) return '₹1Cr - ₹1.5Cr';
    if (/75\s*l\s*[-–]\s*1|75\s*lak.*(cr|crore)|75\s*[-–]\s*100/i.test(text)) return '₹75L - ₹1Cr';
    if (/50\s*l\s*[-–]\s*75|50\s*lak|50\s*[-–]\s*75/i.test(text)) return '₹50L - ₹75L';
    if (/^75\s*l(akh|ac|cr)?s?$/i.test(text) || /^75\s*lakhs?$/i.test(text)) return '₹75L - ₹1Cr';
    if (/^50\s*l(akh|ac|cr)?s?$/i.test(text)) return '₹50L - ₹75L';
  }

  if (/^\d+$/.test(text) && kind !== 'bhk') {
    const num = parseInt(text, 10);
    if (num >= 1 && num <= options.length) return options[num - 1];
  }

  const partials = options.filter(
    (o) => lower.includes(o.toLowerCase()) || o.toLowerCase().includes(lower),
  );
  if (partials.length === 1) return partials[0];

  return null;
}

/** Resolve list/button id first, then typed reply */
function pickOption(body, buttonPayload, options, kind) {
  if (buttonPayload) {
    const fromPayload = resolvePayload(buttonPayload, options);
    if (fromPayload) return fromPayload;
  }
  return matchOption(body, options, { kind });
}

function resultActions(properties) {
  const book = properties.map((p) => `📅 Book — ${p.title}`);
  return [
    ...book,
    '🔍 Show 3 more',
    '🔄 Change budget',
    '🔄 Change BHK type',
    '🌐 View all properties',
    '👤 Talk to agent',
  ];
}

/** Short pause after typing dots (typing is fired immediately on message receipt) */
async function prepareReply() {
  await delay(TYPING_DELAY_MS);
}

async function botSay(phone, text) {
  await prepareReply();
  addMessage(phone, 'bot', text);
  await sendText(phone, text);
  incrementUsage(getRequestTenantId(), 'bot_replies');
  await delay(150);
}

/** Every button/list menu — typing pause before interactive reply */
async function sendChoices(phone, step) {
  await prepareReply();
  await sendOptions(phone, step);
  await delay(100);
}

async function showWelcome(phone) {
  const client = getClient();
  await botSay(
    phone,
    `Hi! 👋 Welcome to ${client.name}. I'm ${client.botName}, your AI assistant. How can I help you today?`,
  );
  await sendChoices(phone, { kind: 'quickReplies', options: MAIN_MENU });
  patchSession(phone, { phase: 'main_menu' });
}

async function startBrowse(phone) {
  await botSay(phone, 'Great! What type of property are you looking for?');
  await sendChoices(phone, { kind: 'quickReplies', options: BHK_OPTIONS });
  patchSession(phone, { phase: 'browse_bhk', shownIds: [], resultOffset: 0 });
}

async function askBudget(phone, bhk) {
  patchSession(phone, { phase: 'browse_budget', filters: { ...getSession(phone).filters, bhk } });
  await botSay(phone, "Perfect. What's your budget range?");
  await sendChoices(phone, { kind: 'quickReplies', options: BUDGET_OPTIONS });
}

async function showResults(phone, { reset = false } = {}) {
  const session = getSession(phone);
  const { bhk, budget } = session.filters;

  if (!bhk || !budget) {
    await botSay(phone, "Let's pick your property type and budget first.");
    if (!bhk) await startBrowse(phone);
    else {
      patchSession(phone, { phase: 'browse_budget' });
      await botSay(phone, "What's your budget range?");
      await sendChoices(phone, { kind: 'quickReplies', options: BUDGET_OPTIONS });
    }
    return;
  }

  if (reset) {
    patchSession(phone, { shownIds: [], resultOffset: 0 });
  }

  const { items, total, hasMore } = searchProperties({
    bhk,
    budgetLabel: budget,
    excludeIds: reset ? [] : session.shownIds,
    limit: 3,
  });

  if (items.length === 0) {
    await botSay(
      phone,
      session.shownIds.length > 0
        ? "That's all the properties matching your criteria. Would you like to change your filters or speak with an agent?"
        : `I couldn't find more matches for ${session.filters.bhk ?? 'your search'} in ${session.filters.budget ?? 'that budget'}. Try changing your budget or property type.`,
    );
    await sendChoices(phone, {
      kind: 'quickReplies',
      options: ['🔄 Change budget', '🔄 Change BHK type', '👤 Talk to agent'],
      text: 'What would you like to do?',
    });
    patchSession(phone, { phase: 'no_results' });
    return;
  }

  const newShown = [...session.shownIds, ...items.map((p) => p.id)];
  patchSession(phone, {
    phase: 'results',
    shownIds: newShown,
    resultOffset: newShown.length,
    lastResults: items,
  });

  const filterSummary = `*${bhk}* · *${budget}*`;
  const countMsg = total > items.length
    ? `I found ${total} properties for ${filterSummary}. Here are ${items.length} picks 👇`
    : `I found ${items.length} properties for ${filterSummary}! 🎉`;

  await prepareReply();
  addMessage(phone, 'bot', countMsg);
  await sendText(phone, countMsg);
  await delay(150);

  for (const card of items) {
    addMessage(phone, 'bot', `${card.title} · ${card.price} · ${card.location} · ${card.bhk}`, { propertyCards: [card] });
    await sendPropertyCard(phone, card);
    await delay(200);
  }

  const actions = resultActions(items);
  if (!hasMore) {
    const idx = actions.indexOf('🔍 Show 3 more');
    if (idx >= 0) actions.splice(idx, 1);
  }

  await sendChoices(phone, {
    kind: 'quickReplies',
    options: actions,
    text: 'What would you like to do next?',
  });

  updateConversation(phone, {
    lead: {
      intent: `${bhk} · ${budget}`,
      stage: 'Browsing listings',
      confidence: 85,
    },
  });
}

async function startBooking(phone, property) {
  patchSession(phone, { phase: 'booking_date', selectedProperty: property });
  await botSay(phone, `Awesome choice! Let me book a site visit for *${property.title}*. What's your preferred date?`);
  await sendChoices(phone, { kind: 'quickReplies', options: DATE_OPTIONS });
}

async function escalateToAgent(phone, reason = 'Customer requested agent') {
  const client = getClient();
  const session = getSession(phone);
  createLead({
    phone,
    name: session.contactName ?? 'WhatsApp User',
    property: session.selectedProperty,
    budget: session.filters.budget,
    bhk: session.filters.bhk,
    stage: 'agent',
    note: reason,
  });
  updateConversation(phone, { status: 'agent', unread: 1 });
  await botSay(
    phone,
    `Connecting you with ${client.agentName} from ${client.name}. 👤\n\nShe'll reach you shortly on this number. Average response time: under 15 minutes.`,
  );
  patchSession(phone, { phase: 'agent', complete: true });
}

async function confirmBooking(phone, contactText) {
  const client = getClient();
  const session = getSession(phone);
  const property = session.selectedProperty;
  const visitDate = session.visitDate ?? 'Selected date';
  const visitTime = session.visitTime ?? 'Selected time';
  const name = contactText.split(',')[0]?.trim() ?? contactText;
  const ref = `PV-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  setConversationName(phone, name);
  patchSession(phone, { contactName: name, bookingRef: ref });

  createLead({
    phone,
    name,
    property,
    budget: session.filters.budget,
    bhk: session.filters.bhk,
    stage: 'site',
    note: `Site visit: ${visitDate} ${visitTime} · Ref ${ref} · ${contactText}`,
  });

  // Message 1 — this IS the WhatsApp confirmation (automated, no agent needed)
  await botSay(
    phone,
    `✅ *Site visit confirmed!*\n\n📍 *${property.title}*\n${property.location}\n📅 ${visitDate} · ${visitTime}\n👤 ${client.agentName} will meet you there\n🎫 Booking ref: *${ref}*\n\n_This is your official confirmation — save this message._`,
  );

  // Message 2 — what happens next (bot automated follow-up)
  await botSay(
    phone,
    `${client.agentName} is assigned to your visit. She'll WhatsApp you a *reminder 1 day before* with directions & contact details.\n\nNeed to reschedule? Reply *Talk to agent*.`,
  );

  await sendChoices(phone, {
    kind: 'finalButtons',
    options: ['Browse more', 'Talk to agent', 'Done'],
    text: 'Anything else?',
  });

  updateConversation(phone, { status: 'resolved', stats: { resolution: 'Automated ✓', timeToBook: '4 minutes' } });
  patchSession(phone, { phase: 'complete', complete: true });
}

export async function handleIncomingMessage(phone, rawBody, buttonPayload, incomingMessageId, tenantId = getRequestTenantId()) {
  const tenant = getTenantById(tenantId);
  if (tenant?.industry === 'clinic') {
    return handleClinicMessage(phone, rawBody, buttonPayload, incomingMessageId, tenant);
  }
  if (tenant && tenant.industry && tenant.industry !== 'real-estate') {
    return handleIndustryMessage(phone, rawBody, buttonPayload, incomingMessageId, tenant);
  }
  return runWithTenantAsync(tenantId, async () => {
    await handleIncomingMessageInner(phone, rawBody, buttonPayload, incomingMessageId, tenantId);
  });
}

async function handleIncomingMessageInner(phone, rawBody, buttonPayload, incomingMessageId, tenantId) {
  const limits = checkTenantLimits(tenantId);
  if (!limits.ok) {
    await sendText(phone, limits.reason);
    return;
  }

  const client = getClient();
  const body = normalize(rawBody);
  const session = getSession(phone);

  if (incomingMessageId) {
    patchSession(phone, { lastMessageId: incomingMessageId });
    // Fire typing dots immediately — before any flow logic
    void showTyping(incomingMessageId).catch((err) =>
      console.warn('Typing indicator:', err.message),
    );
  }

  addMessage(phone, 'user', body || buttonPayload, {}, tenantId);

  if (RESTART_RE.test(body) && !buttonPayload) {
    resetSession(phone);
    updateConversation(phone, { status: 'bot', unread: 0 });
    await showWelcome(phone);
    return;
  }

  if (session.complete && session.phase !== 'agent') {
    if (body.toLowerCase() === 'done') {
      await botSay(phone, `Thank you! Reach out to ${client.name} anytime. 🏠`);
      return;
    }
    if (RESTART_RE.test(body) || body.toLowerCase() === 'browse more') {
      resetSession(phone);
      await startBrowse(phone);
      return;
    }
    if (/agent/i.test(body)) {
      await escalateToAgent(phone);
      return;
    }
    await botSay(phone, 'Send *hi* to start a new search, or pick an option above.');
    return;
  }

  switch (session.phase) {
    case 'welcome':
    case 'main_menu': {
      const choice = buttonPayload
        ? resolvePayload(buttonPayload, MAIN_MENU) ?? matchOption(body, MAIN_MENU)
        : matchOption(body, MAIN_MENU);

      if (choice === '🏠 Browse properties' || choice === '📅 Book site visit') {
        await startBrowse(phone);
      } else if (choice === '💰 Check pricing') {
        await botSay(phone, 'Our 3BHK apartments in Hyderabad start from ₹58L. Share your budget and I can show exact matches!');
        await startBrowse(phone);
      } else if (choice === '📞 Talk to agent') {
        await escalateToAgent(phone);
      } else {
        await botSay(phone, "Please pick an option to continue:");
        await sendChoices(phone, { kind: 'quickReplies', options: MAIN_MENU });
      }
      break;
    }

    case 'browse_bhk': {
      const bhk = pickOption(body, buttonPayload, BHK_OPTIONS, 'bhk');
      if (!bhk) {
        await botSay(phone, 'Please choose a property type (e.g. *3BHK* or *Villa*):');
        await sendChoices(phone, { kind: 'quickReplies', options: BHK_OPTIONS });
        break;
      }
      await askBudget(phone, bhk);
      break;
    }

    case 'browse_budget': {
      const budget = pickOption(body, buttonPayload, BUDGET_OPTIONS, 'budget');
      if (!budget) {
        await botSay(phone, 'Please choose a budget range (e.g. *₹75L - ₹1Cr*):');
        await sendChoices(phone, { kind: 'quickReplies', options: BUDGET_OPTIONS });
        break;
      }
      patchSession(phone, { filters: { ...session.filters, budget }, shownIds: [], resultOffset: 0 });
      await showResults(phone, { reset: true });
      break;
    }

    case 'no_results': {
      if (/budget/i.test(body)) {
        patchSession(phone, { phase: 'browse_budget' });
        await botSay(phone, "What's your new budget range?");
        await sendChoices(phone, { kind: 'quickReplies', options: BUDGET_OPTIONS });
      } else if (/bhk/i.test(body)) {
        await startBrowse(phone);
      } else if (/agent/i.test(body)) {
        await escalateToAgent(phone);
      } else {
        await sendChoices(phone, {
          kind: 'quickReplies',
          options: ['🔄 Change budget', '🔄 Change BHK type', '👤 Talk to agent'],
          text: 'What would you like to do?',
        });
      }
      break;
    }

    case 'results': {
      const lastResults = session.lastResults ?? [];
      const actions = resultActions(lastResults);
      const { total } = searchProperties({
        bhk: session.filters.bhk,
        budgetLabel: session.filters.budget,
        excludeIds: [],
        limit: 999,
      });

      let choice = pickOption(body, buttonPayload, actions);

      if (choice?.startsWith('📅 Book —')) {
        const title = choice.replace('📅 Book — ', '');
        const property =
          lastResults.find((p) => p.title === title)
          ?? lastResults.find((p) => title.startsWith(p.title) || p.title.startsWith(title))
          ?? getPropertyById(session.shownIds.at(-1));
        if (property) await startBooking(phone, property);
        break;
      }
      if (choice === '🔍 Show 3 more') {
        await showResults(phone);
        break;
      }
      if (choice === '🔄 Change budget') {
        patchSession(phone, { phase: 'browse_budget' });
        await botSay(phone, "What's your new budget range?");
        await sendChoices(phone, { kind: 'quickReplies', options: BUDGET_OPTIONS });
        break;
      }
      if (choice === '🔄 Change BHK type') {
        await startBrowse(phone);
        break;
      }
      if (choice === '🌐 View all properties') {
        const url = buildListingsUrl(LISTINGS_BASE, {
          bhk: session.filters.bhk,
          budgetLabel: session.filters.budget,
        });
        await botSay(
          phone,
          `Browse all ${total} matching properties here:\n🔗 ${url}\n\nOr continue here — I can show 3 more or book a visit.`,
        );
        await sendChoices(phone, {
          kind: 'quickReplies',
          options: actions.filter((a) => a !== '🌐 View all properties'),
          text: 'What next?',
        });
        break;
      }
      if (choice === '👤 Talk to agent') {
        await escalateToAgent(phone);
        break;
      }

      await botSay(phone, "Please pick one of the options:");
      await sendChoices(phone, { kind: 'quickReplies', options: actions, text: 'What would you like to do next?' });
      break;
    }

    case 'booking_date': {
      const date = matchOption(body, DATE_OPTIONS);
      if (!date) {
        await botSay(phone, 'Please pick your preferred visit date:');
        await sendChoices(phone, { kind: 'quickReplies', options: DATE_OPTIONS });
        break;
      }
      if (date === 'Pick a date') {
        const moreDates = getMoreDateOptions();
        patchSession(phone, { phase: 'booking_pick_date', moreDates });
        await botSay(phone, 'Sure! Choose a date below, or type one (e.g. *20 June*):');
        await sendChoices(phone, {
          kind: 'quickReplies',
          options: moreDates,
          text: 'Available dates',
        });
        break;
      }
      patchSession(phone, { phase: 'booking_time', visitDate: date });
      await botSay(phone, `Great — *${date}* works! What time suits you best?`);
      await sendChoices(phone, { kind: 'quickReplies', options: TIME_OPTIONS });
      break;
    }

    case 'booking_pick_date': {
      const options = session.moreDates ?? getMoreDateOptions();
      let picked = pickOption(body, buttonPayload, options);
      if (!picked && body.length >= 3) {
        picked = body;
      }
      if (!picked) {
        await botSay(phone, 'Please pick a date from the list or type your preferred day:');
        await sendChoices(phone, { kind: 'quickReplies', options, text: 'Available dates' });
        break;
      }
      patchSession(phone, { phase: 'booking_time', visitDate: picked });
      await botSay(phone, `Great — *${picked}* works! What time suits you best?`);
      await sendChoices(phone, { kind: 'quickReplies', options: TIME_OPTIONS });
      break;
    }

    case 'booking_time': {
      const time = matchOption(body, TIME_OPTIONS);
      if (!time) {
        await botSay(phone, 'Please choose a time slot:');
        await sendChoices(phone, { kind: 'quickReplies', options: TIME_OPTIONS });
        break;
      }
      patchSession(phone, { phase: 'booking_contact', visitTime: time });
      await botSay(phone, 'Almost done! May I have your name and phone number to confirm the booking?');
      break;
    }

    case 'booking_contact': {
      if (body.length < 3) {
        await botSay(phone, 'Please send your name and phone number (e.g. Rahul Sharma, 98400 12345)');
        break;
      }
      await confirmBooking(phone, body);
      break;
    }

    case 'agent':
      await botSay(phone, `${client.agentName} has been notified. She'll reply here shortly.`);
      break;

    default:
      await showWelcome(phone);
  }
}

/** Called on first message if needed — showWelcome is triggered by hi */
export async function advanceFlow(phone) {
  await showWelcome(phone);
}
