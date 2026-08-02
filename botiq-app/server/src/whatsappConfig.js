/** Cached Meta WhatsApp business display number (digits only, for wa.me links). */

let displayPhoneDigits = null;

export function setWhatsAppDisplayNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  displayPhoneDigits = digits || null;
}

export function getWhatsAppDisplayNumber() {
  if (displayPhoneDigits) return displayPhoneDigits;
  const env = process.env.WHATSAPP_DISPLAY_PHONE || process.env.WHATSAPP_BUSINESS_PHONE;
  return env ? String(env).replace(/\D/g, '') : null;
}

export async function fetchWhatsAppDisplayNumber() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.META_API_VERSION || 'v21.0';
  if (!token || !phoneId) return getWhatsAppDisplayNumber();

  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${phoneId}?fields=display_phone_number`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (res.ok && data.display_phone_number) {
      setWhatsAppDisplayNumber(data.display_phone_number);
    }
  } catch {
    /* offline */
  }
  return getWhatsAppDisplayNumber();
}
