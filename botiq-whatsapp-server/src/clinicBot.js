/**
 * Dental clinic WhatsApp assistant — booking flow creates Patient + Appointment in dashboard.
 */
import { getClient, getRequestTenantId, checkTenantLimits, incrementUsage, runWithTenantAsync } from './tenantContext.js';
import { getCatalogItems } from './db/index.js';
import { getSession, resetSession, patchSession } from './sessions.js';
import { addMessage, updateConversation, setConversationName } from './store.js';
import { sendText, sendOptions, resolvePayload, delay, showTyping } from './messaging.js';
import {
  getOrCreatePatient,
  createAppointment,
  resolveScheduledAt,
  getAvailableSlots,
  getPatientByPhone,
} from './services/clinicStore.js';

const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3002';
const RESTART_RE = /^(hi|hello|hey|start|restart|menu)$/i;

const MENU = ['📅 Book an appointment', '💊 View our services', '📞 Speak with our team'];

const DATE_OPTIONS = ['Today', 'Tomorrow', 'This Saturday', 'Flexible'];

function servicesUrl(tenant, phone) {
  const base = `${PUBLIC_URL.replace(/\/$/, '')}/services?tenant=${tenant.slug}`;
  const digits = phone ? String(phone).replace(/\D/g, '') : '';
  return digits ? `${base}&from=${digits}` : base;
}

/** Called from /api/clinic/resume-booking before redirecting back to WhatsApp. */
export { prepareBookingResume } from './clinicBookingResume.js';

const WEB_RESUME_TTL_MS = 30 * 60 * 1000;

async function continueBookingAfterWeb(phone, body, tenant, messageId) {
  const session = getSession(phone, tenant.id);
  const fromWeb = session.resumedFromWeb
    && session.webResumeAt
    && Date.now() - session.webResumeAt < WEB_RESUME_TTL_MS;

  if (!fromWeb && !/^continue my booking/i.test(body || '')) return false;

  if (session.resumedFromWeb && !fromWeb) {
    patchSession(phone, { resumedFromWeb: false, webResumeAt: null }, tenant.id);
    return false;
  }

  const service = parseServiceSelection(body, tenant.id) || session.reason;
  if (!service) return false;

  patchSession(phone, { reason: service, resumedFromWeb: false, webResumeAt: null }, tenant.id);
  const updated = getSession(phone, tenant.id);

  if (updated.phase === 'date' && updated.name) {
    await sendOptions(phone, {
      text: `When would you like to come in for *${service}*?`,
      options: DATE_OPTIONS,
    });
    return true;
  }

  if (updated.phase === 'name') {
    await reply(phone, `What's your full name for *${service}*?`, messageId);
    return true;
  }

  await startBookingWithService(phone, service, tenant, messageId);
  return true;
}

async function reply(phone, text, messageId) {
  if (messageId) {
    void showTyping(messageId).catch(() => {});
    await delay(350);
  }
  await sendText(phone, text);
  addMessage(phone, 'bot', text);
  incrementUsage(getRequestTenantId());
}

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
  const partials = options.filter(
    (o) => lower.includes(o.toLowerCase().slice(0, 6)) || o.toLowerCase().includes(lower.slice(0, 6)),
  );
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

function convIdForPhone(phone) {
  return `wa-${String(phone).replace(/\D/g, '')}`;
}

function parseServiceSelection(body, tenantId) {
  const text = normalize(body);
  if (!text) return null;

  let cleaned = text
    .replace(/^continue my booking\s*[—–-]\s*/i, '')
    .replace(/^i'd like to book:\s*/i, '')
    .replace(/^i would like to book:\s*/i, '')
    .replace(/^book(?: appointment)?:\s*/i, '')
    .replace(/^service:\s*/i, '')
    .trim();

  const items = getCatalogItems(tenantId);
  const titles = items.map((i) => i.title);

  const fromCleaned = matchOption(cleaned, titles);
  if (fromCleaned) return fromCleaned;

  const fromOriginal = matchOption(text, titles);
  if (fromOriginal) return fromOriginal;

  const partial = items.find(
    (item) =>
      cleaned.toLowerCase().includes(item.title.toLowerCase()) ||
      item.title.toLowerCase().includes(cleaned.toLowerCase()),
  );
  return partial?.title ?? null;
}

function findCatalogItem(tenantId, title) {
  return getCatalogItems(tenantId).find((i) => i.title === title) ?? null;
}

async function startBookingWithService(phone, serviceTitle, tenant, messageId) {
  const session = getSession(phone, tenant.id);
  if (session.reason === serviceTitle) {
    if (session.phase === 'date' && session.name) return;
    if (session.phase === 'name') return;
  }

  const item = findCatalogItem(tenant.id, serviceTitle);
  patchSession(phone, {
    phase: 'name',
    reason: serviceTitle,
    serviceId: item?.id ?? null,
    industry: 'clinic',
  });

  const existing = getPatientByPhone(phone, tenant.id);
  if (existing?.name && existing.name !== 'New Patient') {
    patchSession(phone, { name: existing.name, phase: 'date' });
    await sendOptions(phone, {
      text: `When would you like to come in for *${serviceTitle}*?`,
      options: DATE_OPTIONS,
    });
    return;
  }

  await reply(phone, `What's your full name for *${serviceTitle}*?`, messageId);
}

async function sendMainMenu(phone, text = 'How can we help you today?') {
  await sendOptions(phone, { text, options: MENU });
}

export async function handleClinicMessage(phone, body, buttonPayload, messageId, tenant) {
  return runWithTenantAsync(tenant.id, async () => {
    const limits = checkTenantLimits(tenant.id);
    if (!limits.ok) {
      await sendText(phone, limits.reason);
      return;
    }

    const client = getClient();
    const session = getSession(phone);
    addMessage(phone, 'user', body || buttonPayload || '');

    if (RESTART_RE.test(body || '')) {
      if (session.resumedFromWeb) {
        if (await continueBookingAfterWeb(phone, body, tenant, messageId)) return;
      }

      const midFlow = ['name', 'date', 'time', 'await_service'].includes(session.phase);
      if (midFlow) {
        if (session.phase === 'name') {
          await reply(phone, `What's your full name?`, messageId);
        } else if (session.phase === 'date') {
          await sendOptions(phone, { text: 'When would you like to come in?', options: DATE_OPTIONS });
        } else if (session.phase === 'time') {
          const timeOptions = session.timeOptions || ['10:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
          await sendOptions(phone, { text: 'Which time works for you?', options: timeOptions });
        } else {
          const catalogTitles = getCatalogItems(tenant.id).map((i) => i.title).slice(0, 4);
          await sendOptions(phone, { text: 'Which service would you like?', options: catalogTitles });
        }
        return;
      }

      resetSession(phone);
      patchSession(phone, { phase: 'menu', industry: 'clinic' });
      const existing = getPatientByPhone(phone, tenant.id);
      const firstName = existing?.name?.split(/\s+/)[0];
      const intro = firstName && firstName !== 'New' && firstName !== 'Patient'
        ? `Hi ${firstName}! How can we help?`
        : 'How can we help you today?';
      await sendMainMenu(phone, intro);
      return;
    }

    if (session.resumedFromWeb || /^continue my booking/i.test(body || '')) {
      if (await continueBookingAfterWeb(phone, body, tenant, messageId)) return;
    }

    const servicePick = parseServiceSelection(body, tenant.id);
    if (servicePick && session.phase !== 'done' && session.phase !== 'agent') {
      if (servicePick === session.reason && ['name', 'date'].includes(session.phase)) return;
      await startBookingWithService(phone, servicePick, tenant, messageId);
      return;
    }

    const phase = session.phase || 'menu';

    if (phase === 'menu') {
      const choice = pickOption(body, buttonPayload, MENU);
      if (!choice) {
        await sendMainMenu(phone, 'Please choose one of the options below:');
        return;
      }

      if (/services|pricing|view our/i.test(choice)) {
        const url = servicesUrl(tenant, phone);
        patchSession(phone, { phase: 'await_service', industry: 'clinic' });
        const catalogTitles = getCatalogItems(tenant.id).map((i) => i.title).slice(0, 3);
        await sendOptions(phone, {
          text: `Browse treatments & prices:\n${url}${catalogTitles.length ? '\n\nOr pick a service:' : ''}`,
          options: catalogTitles.length
            ? [...catalogTitles, '📞 Speak with our team']
            : ['📅 Book an appointment', '📞 Speak with our team'],
        });
        return;
      }

      if (/talk|staff|speak|team|call/i.test(choice)) {
        patchSession(phone, { phase: 'agent' });
        getOrCreatePatient({ phone, name: session.name, tenantId: tenant.id, conversationId: convIdForPhone(phone) });
        updateConversation(phone, { status: 'agent' }, tenant.id);
        const contact = client.agentPhone || client.whatsappNumber || 'our clinic line';
        await reply(
          phone,
          `Of course — someone from our team will reply here shortly.\n\nYou can also reach us at ${contact}.`,
          messageId,
        );
        return;
      }

      // Book appointment — show services link first, then fallback list
      const url = servicesUrl(tenant, phone);
      const catalogTitles = getCatalogItems(tenant.id).map((i) => i.title);
      patchSession(phone, { phase: 'await_service', industry: 'clinic' });
      if (catalogTitles.length) {
        await sendOptions(phone, {
          text: `Browse or pick a service:\n${url}`,
          options: catalogTitles.slice(0, 4),
        });
      } else {
        await reply(phone, `Browse our services here:\n${url}`, messageId);
      }
      return;
    }

    if (phase === 'await_service') {
      const catalogTitles = getCatalogItems(tenant.id).map((i) => i.title);
      const quickOptions = [
        ...catalogTitles.slice(0, 3),
        '📅 Book an appointment',
        '📞 Speak with our team',
      ];
      const choice = pickOption(body, buttonPayload, quickOptions);

      if (choice && /talk|staff|speak|team/i.test(choice)) {
        patchSession(phone, { phase: 'agent' });
        updateConversation(phone, { status: 'agent' }, tenant.id);
        await reply(phone, 'Someone from our team will reply here shortly.', messageId);
        return;
      }

      if (choice && /book an appointment/i.test(choice)) {
        if (catalogTitles.length) {
          await sendOptions(phone, {
            text: 'Which service would you like?',
            options: catalogTitles.slice(0, 4),
          });
          return;
        }
      }

      const service = choice && catalogTitles.includes(choice) ? choice : parseServiceSelection(body, tenant.id);
      if (service) {
        await startBookingWithService(phone, service, tenant, messageId);
        return;
      }

      await sendOptions(phone, {
        text: `Pick a service:\n${servicesUrl(tenant, phone)}`,
        options: catalogTitles.slice(0, 4),
      });
      return;
    }

    if (phase === 'after_services') {
      const choice = pickOption(body, buttonPayload, ['📅 Book an appointment', '📞 Speak with our team', '✅ All set, thanks']);
      if (choice?.includes('Book')) {
        patchSession(phone, { phase: 'await_service' });
        const catalogTitles = getCatalogItems(tenant.id).map((i) => i.title).slice(0, 4);
        await sendOptions(phone, { text: 'Which service would you like?', options: catalogTitles });
        return;
      }
      if (choice?.includes('Speak') || choice?.includes('Talk')) {
        patchSession(phone, { phase: 'agent' });
        updateConversation(phone, { status: 'agent' }, tenant.id);
        await reply(phone, 'Our team will assist you shortly.', messageId);
        return;
      }
      patchSession(phone, { phase: 'menu' });
      await reply(phone, 'Thank you! Message *hi* anytime if you need anything else.', messageId);
      return;
    }

    if (phase === 'name') {
      const name = normalize(body).slice(0, 80) || 'Patient';
      patchSession(phone, { name, phase: 'date' });
      setConversationName(phone, name, tenant.id);
      await sendOptions(phone, {
        text: `Thanks, ${name}. When would you like to come in?`,
        options: DATE_OPTIONS,
      });
      return;
    }

    if (phase === 'date') {
      const dateLabel = pickOption(body, buttonPayload, DATE_OPTIONS) || body;
      const dateStr = resolveScheduledAt(dateLabel, '10:00 AM').slice(0, 10);
      const slots = getAvailableSlots(tenant.id, dateStr);
      const timeOptions = slots.length >= 4 ? slots.slice(0, 4) : ['10:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
      patchSession(phone, { phase: 'time', date: dateLabel, dateStr, timeOptions });
      await sendOptions(phone, {
        text: `${dateLabel} — which time works best for you?`,
        options: timeOptions,
      });
      return;
    }

    if (phase === 'time') {
      const timeOptions = session.timeOptions || ['10:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];
      const time = pickOption(body, buttonPayload, timeOptions) || body;
      const scheduledAt = resolveScheduledAt(session.date || 'Today', time);
      const patient = getOrCreatePatient({
        phone,
        name: session.name || 'Patient',
        tenantId: tenant.id,
        chiefComplaint: session.reason || '',
        conversationId: convIdForPhone(phone),
      });

      const appt = createAppointment(tenant.id, {
        patientId: patient.id,
        service: session.reason || 'Consultation',
        serviceId: session.serviceId || null,
        scheduledAt,
        status: 'requested',
        source: 'WhatsApp',
      });

      patchSession(phone, { phase: 'done', appointmentId: appt.id });
      const when = new Date(scheduledAt);
      const whenStr = when.toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      await reply(
        phone,
        `You're all set ✅\n\n📅 ${whenStr}\n🦷 ${session.reason || 'Consultation'}\n\nOur team will confirm your appointment shortly. We'll also send a reminder before your visit.\n\nMessage *hi* anytime to book again or ask a question.`,
        messageId,
      );
      updateConversation(phone, {
        status: 'bot',
        lead: { intent: session.reason, stage: 'Appointment requested', confidence: 90 },
      }, tenant.id);
      return;
    }

    if (phase === 'agent') {
      if (!session.agentAckSent) {
        patchSession(phone, { agentAckSent: true });
        await reply(phone, 'Someone from our team will reply here shortly.', messageId);
      }
      return;
    }

    patchSession(phone, { phase: 'menu' });
    await sendMainMenu(phone);
  });
}

export async function startClinicConversation(phone, tenant) {
  resetSession(phone);
  patchSession(phone, { phase: 'menu', industry: 'clinic' });
  await sendMainMenu(phone, 'How can we help you today?');
}
