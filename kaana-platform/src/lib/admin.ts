/** WhatsApp deep link for Indian numbers. */
export function whatsappHref(phone: string, text?: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) digits = `91${digits}`;
  if (!digits.startsWith('91') && digits.length > 10) {
    /* keep as-is for other formats */
  }
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'signed_up', 'lost'] as const;

export function leadStatusLabel(status: string) {
  const labels: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    signed_up: 'Signed up',
    lost: 'Lost',
  };
  return labels[status] || status;
}

export function stageBadgeClass(stage: string) {
  if (stage === 'ready_to_activate') return 'admin-badge-warn';
  if (stage === 'paying') return 'admin-badge-ok';
  if (stage === 'whatsapp_pending') return 'admin-badge-warn';
  return 'admin-badge-neutral';
}
