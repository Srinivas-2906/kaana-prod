import { nanoid } from 'nanoid';
import { getDb } from '../db/index.js';
import { getAppointmentById } from './clinicStore.js';
import { getTenantById, runWithTenantAsync } from '../tenantContext.js';
import { sendText } from '../messaging.js';

const REMINDER_WINDOWS = [
  { type: 'appointment_24h', hoursBefore: 24 },
  { type: 'appointment_2h', hoursBefore: 2 },
];

const RECALL_MONTHS = 6;

function reminderMessage(type, appt, patientName) {
  const when = new Date(appt.scheduledAt).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  });
  if (type === 'appointment_24h') {
    return `🦷 Reminder from your dental clinic\n\nHi ${patientName}! Your appointment is *tomorrow*:\n📅 ${when}\n💊 ${appt.service || 'Consultation'}\n\nReply *hi* to reschedule or confirm.`;
  }
  if (type === 'appointment_2h') {
    return `🦷 See you soon!\n\nHi ${patientName}, your appointment is in about *2 hours* (${when}).\n\nPlease arrive 10 minutes early. Reply *hi* if you need to reschedule.`;
  }
  if (type === 'recall_cleaning') {
    return `🦷 Time for your dental check-up!\n\nHi ${patientName}, it's been 6 months since your last visit. Book a cleaning slot — reply *hi* and tap *Book appointment*.`;
  }
  return `Reminder: appointment on ${when}`;
}

export function clearAppointmentReminders(appointmentId) {
  getDb().prepare(`
    DELETE FROM reminders WHERE appointment_id = ? AND status = 'pending'
  `).run(appointmentId);
}

export function scheduleAppointmentReminders(tenantId, appointmentId) {
  const appt = getAppointmentById(appointmentId, tenantId);
  if (!appt || ['cancelled', 'no_show', 'visited'].includes(appt.status)) return;

  clearAppointmentReminders(appointmentId);
  const scheduled = new Date(appt.scheduledAt).getTime();
  const now = Date.now();
  const db = getDb();

  for (const { type, hoursBefore } of REMINDER_WINDOWS) {
    const remindAt = new Date(scheduled - hoursBefore * 3600000);
    if (remindAt.getTime() <= now) continue;
    db.prepare(`
      INSERT INTO reminders (id, tenant_id, lead_id, appointment_id, reminder_type, message, remind_at, status)
      VALUES (?, ?, NULL, ?, ?, ?, ?, 'pending')
    `).run(
      nanoid(12),
      tenantId,
      appointmentId,
      type,
      reminderMessage(type, appt, appt.patientName || 'there'),
      remindAt.toISOString(),
    );
  }
}

export function scheduleRecallReminder(tenantId, patientId, patientName) {
  const recallAt = new Date();
  recallAt.setMonth(recallAt.getMonth() + RECALL_MONTHS);
  const existing = getDb().prepare(`
    SELECT id FROM reminders WHERE tenant_id = ? AND patient_id = ? AND reminder_type = 'recall_cleaning' AND status = 'pending'
  `).get(tenantId, patientId);
  if (existing) return;

  getDb().prepare(`
    INSERT INTO reminders (id, tenant_id, patient_id, reminder_type, message, remind_at, status)
    VALUES (?, ?, ?, 'recall_cleaning', ?, ?, 'pending')
  `).run(
    nanoid(12),
    tenantId,
    patientId,
    reminderMessage('recall_cleaning', { scheduledAt: recallAt.toISOString(), service: 'Cleaning' }, patientName),
    recallAt.toISOString(),
  );
}

export async function processDueReminders() {
  const db = getDb();
  const due = db.prepare(`
    SELECT r.*, t.whatsapp_token,
      COALESCE(rp.phone_digits, ap.phone_digits) AS phone_digits
    FROM reminders r
    JOIN tenants t ON t.id = r.tenant_id
    LEFT JOIN patients rp ON rp.id = r.patient_id
    LEFT JOIN appointments a ON a.id = r.appointment_id
    LEFT JOIN patients ap ON ap.id = a.patient_id
    WHERE r.status = 'pending' AND r.remind_at <= datetime('now')
    LIMIT 20
  `).all();

  for (const row of due) {
    const tenant = getTenantById(row.tenant_id);
    if (!tenant) continue;

    const phone = row.phone_digits;

    const message = row.message || 'Appointment reminder';

    try {
      await runWithTenantAsync(row.tenant_id, async () => {
        if (phone && tenant.whatsapp_token) {
          await sendText(phone, message);
        } else {
          console.log(`📋 [reminder] tenant=${row.tenant_id} phone=${phone || '?'}: ${message.slice(0, 80)}…`);
        }
      });
      db.prepare(`UPDATE reminders SET status = 'sent' WHERE id = ?`).run(row.id);

      if (row.appointment_id && row.reminder_type?.startsWith('appointment_')) {
        db.prepare(`UPDATE appointments SET reminder_sent = 1 WHERE id = ?`).run(row.appointment_id);
      }
    } catch (err) {
      console.error('Reminder send failed:', row.id, err.message);
    }
  }
}

export function startReminderScheduler(intervalMs = 60000) {
  void processDueReminders();
  setInterval(() => void processDueReminders(), intervalMs);
  console.log(`   Reminders:  scheduler every ${intervalMs / 1000}s`);
}
