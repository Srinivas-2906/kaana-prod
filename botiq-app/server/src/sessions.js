/** Per-phone conversation state for the flow engine — scoped by tenant */

import { getRequestTenantId } from './tenantContext.js';

const sessions = new Map();

function sessionKey(tenantId, phone) {
  return `${tenantId}:${String(phone).replace(/\D/g, '')}`;
}

function blankSession() {
  return {
    phase: 'welcome',
    filters: { bhk: null, budget: null },
    shownIds: [],
    resultOffset: 0,
    selectedProperty: null,
    contactName: null,
    lastMessageId: null,
    complete: false,
  };
}

export function getSession(phone, tenantId = getRequestTenantId()) {
  const key = sessionKey(tenantId, phone);
  if (!sessions.has(key)) {
    sessions.set(key, blankSession());
  }
  return sessions.get(key);
}

export function resetSession(phone, tenantId = getRequestTenantId()) {
  const key = sessionKey(tenantId, phone);
  sessions.set(key, blankSession());
}

export function patchSession(phone, patch, tenantId = getRequestTenantId()) {
  const session = getSession(phone, tenantId);
  Object.assign(session, patch);
}
