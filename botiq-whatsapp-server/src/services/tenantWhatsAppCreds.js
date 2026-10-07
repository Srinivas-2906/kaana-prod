import { getTenantById } from '../tenantContext.js';

/** Tenant-scoped WhatsApp Cloud API credentials (never send to clients). */
export function getTenantWhatsAppCredentials(tenantId) {
  const tenant = getTenantById(tenantId);
  if (!tenant) return null;

  const accessToken = tenant.whatsapp_token?.trim();
  const wabaId = tenant.whatsapp_waba_id?.trim();
  const phoneNumberId = tenant.whatsapp_phone_id?.trim();

  if (!accessToken || !wabaId) return null;

  return { accessToken, wabaId, phoneNumberId };
}
