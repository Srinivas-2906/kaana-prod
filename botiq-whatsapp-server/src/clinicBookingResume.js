/** Session handoff when patient picks a service on the web catalog. */
import { getCatalogItems } from './db/index.js';
import { patchSession } from './sessions.js';
import { getPatientByPhone } from './services/clinicStore.js';

export function prepareBookingResume(phone, tenant, serviceId) {
  const items = getCatalogItems(tenant.id);
  const item = items.find((i) => i.id === serviceId);
  if (!item) return null;

  const existing = getPatientByPhone(phone, tenant.id);
  const patch = {
    phase: existing?.name && existing.name !== 'New Patient' ? 'date' : 'name',
    reason: item.title,
    serviceId: item.id,
    industry: 'clinic',
    resumedFromWeb: true,
    webResumeAt: Date.now(),
  };
  if (existing?.name && existing.name !== 'New Patient') {
    patch.name = existing.name;
  }
  patchSession(phone, patch, tenant.id);
  return item.title;
}
