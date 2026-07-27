/** Keep only digits, max 10 — for Indian mobile numbers. */
export function sanitizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10);
}

/** Keep only digits for age field. */
export function sanitizeAge(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 3);
}

export function isValidPhone10(phone: string): boolean {
  return sanitizePhoneDigits(phone).length === 10;
}

export function isValidAge(age: string): boolean {
  if (!age.trim()) return false;
  const n = Number(age);
  return Number.isInteger(n) && n >= 1 && n <= 120;
}

export function isValidPatientName(name: string): boolean {
  return name.trim().length >= 2;
}

export function formatPhone10(phone: string): string {
  return sanitizePhoneDigits(phone);
}
