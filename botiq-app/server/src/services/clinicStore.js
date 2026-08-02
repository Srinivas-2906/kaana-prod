import { nanoid } from 'nanoid';
import { getOne, getAll, run } from '../db/query.js';
import { parseSettings } from '../db/index.js';
import { scheduleAppointmentReminders, scheduleRecallReminder } from './clinicReminders.js';

function parseJson(raw, fallback) {
  if (raw == null) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function formatPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone ? `+${digits}` : '';
}

function phoneDigits(phone) {
  return String(phone).replace(/\D/g, '');
}

function rowToPatient(row) {
  if (!row) return null;
  const recordUrls = parseJson(row.record_urls, []);
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    phone: row.phone,
    phoneDigits: row.phone_digits,
    email: row.email || '',
    age: row.age,
    gender: row.gender || '',
    chiefComplaint: row.chief_complaint || '',
    isReturning: !!row.is_returning,
    tags: parseJson(row.tags, []),
    notes: parseJson(row.notes, []),
    lastVisit: row.last_visit,
    source: row.source || 'WhatsApp',
    conversationId: row.conversation_id,
    photoUrl: row.photo_url || '',
    prescriptionUrl: row.prescription_url || '',
    recordUrls: Array.isArray(recordUrls) ? recordUrls.filter(Boolean) : [],
    totalPaid: row.total_paid != null ? Number(row.total_paid) : 0,
    lastPaymentAmount: row.last_payment_amount != null ? Number(row.last_payment_amount) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToAppointment(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    service: row.service || '',
    serviceId: row.service_id,
    scheduledAt: row.scheduled_at,
    durationMin: row.duration_min ?? 30,
    status: row.status,
    assignedDoctor: row.assigned_doctor || '',
    notes: row.notes || '',
    source: row.source || 'WhatsApp',
    paymentAmount: row.payment_amount != null ? Number(row.payment_amount) : null,
    paymentMethod: row.payment_method || '',
    reminderSent: !!row.reminder_sent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const DEFAULT_HOURS = { start: 10, end: 19, slotMin: 30 };

export async function getClinicHours(tenantId) {
  const row = await getOne('SELECT settings FROM tenants WHERE id = ?', [tenantId]);
  if (!row) return DEFAULT_HOURS;
  const s = parseSettings(row.settings);
  return {
    start: s.clinicHours?.start ?? DEFAULT_HOURS.start,
    end: s.clinicHours?.end ?? DEFAULT_HOURS.end,
    slotMin: s.clinicHours?.slotMin ?? DEFAULT_HOURS.slotMin,
  };
}

export async function getOrCreatePatient({ phone, name, tenantId, source = 'WhatsApp', chiefComplaint, age, conversationId }) {
  const digits = phoneDigits(phone);
  let row = await getOne('SELECT * FROM patients WHERE tenant_id = ? AND phone_digits = ?', [tenantId, digits]);
  if (row) {
    const updates = [];
    const vals = [];
    if (name && name !== 'WhatsApp User' && name !== 'WhatsApp Lead') {
      updates.push('name = ?');
      vals.push(name);
    }
    if (chiefComplaint) {
      updates.push('chief_complaint = ?');
      vals.push(chiefComplaint);
    }
    if (age != null) {
      updates.push('age = ?');
      vals.push(age);
    }
    if (conversationId) {
      updates.push('conversation_id = ?');
      vals.push(conversationId);
    }
    if (updates.length) {
      updates.push("updated_at = datetime('now')");
      vals.push(row.id);
      await run(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`, vals);
      row = await getOne('SELECT * FROM patients WHERE id = ?', [row.id]);
    }
    return rowToPatient(row);
  }

  const id = nanoid(12);
  await run(`
    INSERT INTO patients (id, tenant_id, name, phone, phone_digits, chief_complaint, age, source, conversation_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    tenantId,
    name || 'New Patient',
    formatPhone(phone),
    digits,
    chiefComplaint || '',
    age ?? null,
    source,
    conversationId || null,
  ]);
  row = await getOne('SELECT * FROM patients WHERE id = ?', [id]);
  return rowToPatient(row);
}

export async function createPatient(tenantId, data) {
  const digits = phoneDigits(data.phone);
  if (!digits) throw new Error('Phone required');
  const existing = await getOne('SELECT id FROM patients WHERE tenant_id = ? AND phone_digits = ?', [tenantId, digits]);
  if (existing) return updatePatient(existing.id, tenantId, data);

  const id = nanoid(12);
  await run(`
    INSERT INTO patients (id, tenant_id, name, phone, phone_digits, email, age, gender, chief_complaint, is_returning, tags, notes, source, photo_url, prescription_url, record_urls)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    tenantId,
    data.name || 'Patient',
    formatPhone(data.phone),
    digits,
    data.email || '',
    data.age ?? null,
    data.gender || '',
    data.chiefComplaint || '',
    data.isReturning ? true : false,
    JSON.stringify(data.tags || []),
    JSON.stringify(data.notes || []),
    data.source || 'Walk-in',
    data.photoUrl || '',
    data.prescriptionUrl || '',
    JSON.stringify(Array.isArray(data.recordUrls) ? data.recordUrls : []),
  ]);
  const row = await getOne('SELECT * FROM patients WHERE id = ?', [id]);
  return rowToPatient(row);
}

export async function updatePatient(id, tenantId, patch) {
  const row = await getOne('SELECT * FROM patients WHERE id = ? AND tenant_id = ?', [id, tenantId]);
  if (!row) return null;

  const fields = [];
  const values = [];
  const map = {
    name: 'name',
    email: 'email',
    age: 'age',
    gender: 'gender',
    chiefComplaint: 'chief_complaint',
    isReturning: 'is_returning',
    lastVisit: 'last_visit',
    source: 'source',
    photoUrl: 'photo_url',
    prescriptionUrl: 'prescription_url',
    recordUrls: 'record_urls',
  };
  for (const [k, col] of Object.entries(map)) {
    if (patch[k] !== undefined) {
      fields.push(`${col} = ?`);
      if (k === 'isReturning') values.push(!!patch[k]);
      else if (k === 'recordUrls') values.push(JSON.stringify(Array.isArray(patch[k]) ? patch[k] : []));
      else values.push(patch[k]);
    }
  }
  if (patch.phone) {
    fields.push('phone = ?', 'phone_digits = ?');
    values.push(formatPhone(patch.phone), phoneDigits(patch.phone));
  }
  if (patch.tags) {
    fields.push('tags = ?');
    values.push(JSON.stringify(patch.tags));
  }
  if (patch.notes) {
    fields.push('notes = ?');
    values.push(JSON.stringify(patch.notes));
  }
  if (patch.note) {
    const notes = parseJson(row.notes, []);
    notes.unshift({ text: patch.note, at: new Date().toISOString(), by: patch.by || 'Staff' });
    fields.push('notes = ?');
    values.push(JSON.stringify(notes.slice(0, 50)));
  }

  if (fields.length) {
    fields.push("updated_at = datetime('now')");
    values.push(id, tenantId);
    await run(`UPDATE patients SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  }
  const updated = await getOne('SELECT * FROM patients WHERE id = ?', [id]);
  return rowToPatient(updated);
}

export async function getPatients(tenantId, { search, limit = 100 } = {}) {
  let sql = `
    SELECT p.*,
      (SELECT COALESCE(SUM(pp.amount), 0) FROM patient_payments pp
        WHERE pp.patient_id = p.id AND pp.tenant_id = p.tenant_id AND pp.status = 'paid') AS total_paid,
      (SELECT pp.amount FROM patient_payments pp
        WHERE pp.patient_id = p.id AND pp.tenant_id = p.tenant_id
        ORDER BY pp.created_at DESC LIMIT 1) AS last_payment_amount
    FROM patients p
    WHERE p.tenant_id = ?
  `;
  const params = [tenantId];
  if (search) {
    const q = `%${search.trim()}%`;
    sql += ` AND (
      p.name ILIKE ? OR p.phone ILIKE ? OR p.phone_digits ILIKE ?
      OR p.email ILIKE ? OR p.chief_complaint ILIKE ? OR p.gender ILIKE ?
      OR p.source ILIKE ? OR p.tags::text ILIKE ? OR p.notes::text ILIKE ?
      OR CAST(p.age AS TEXT) ILIKE ?
    )`;
    params.push(q, q, q, q, q, q, q, q, q, q);
  }
  sql += ' ORDER BY p.updated_at DESC LIMIT ?';
  params.push(limit);
  const rows = await getAll(sql, params);
  return rows.map(rowToPatient);
}

export async function getPatientById(id, tenantId) {
  const row = await getOne(`
    SELECT p.*,
      (SELECT COALESCE(SUM(pp.amount), 0) FROM patient_payments pp
        WHERE pp.patient_id = p.id AND pp.tenant_id = p.tenant_id AND pp.status = 'paid') AS total_paid,
      (SELECT pp.amount FROM patient_payments pp
        WHERE pp.patient_id = p.id AND pp.tenant_id = p.tenant_id
        ORDER BY pp.created_at DESC LIMIT 1) AS last_payment_amount
    FROM patients p
    WHERE p.id = ? AND p.tenant_id = ?
  `, [id, tenantId]);
  return rowToPatient(row);
}

export async function getPatientByPhone(phone, tenantId) {
  const digits = phoneDigits(phone);
  const row = await getOne('SELECT * FROM patients WHERE tenant_id = ? AND phone_digits = ?', [tenantId, digits]);
  return rowToPatient(row);
}

export async function createAppointment(tenantId, data) {
  let patient = data.patientId
    ? await getPatientById(data.patientId, tenantId)
    : data.phone
      ? await getOrCreatePatient({ phone: data.phone, name: data.patientName, tenantId, source: data.source || 'WhatsApp', chiefComplaint: data.service })
      : null;

  if (!patient && data.patientName) {
    patient = await createPatient(tenantId, { name: data.patientName, phone: data.phone || '', source: data.source || 'Walk-in' });
  }
  if (!patient) throw new Error('Patient required');

  const id = nanoid(12);
  const status = data.status || 'requested';
  await run(`
    INSERT INTO appointments (id, tenant_id, patient_id, service, service_id, scheduled_at, duration_min, status, assigned_doctor, notes, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    tenantId,
    patient.id,
    data.service || '',
    data.serviceId || null,
    data.scheduledAt,
    data.durationMin ?? 30,
    status,
    data.assignedDoctor || '',
    data.notes || '',
    data.source || 'WhatsApp',
  ]);

  await run("UPDATE patients SET updated_at = datetime('now') WHERE id = ?", [patient.id]);
  const appt = await getAppointmentById(id, tenantId);
  await scheduleAppointmentReminders(tenantId, id);
  return appt;
}

export async function getAppointmentById(id, tenantId) {
  const row = await getOne(`
    SELECT a.*, p.name AS patient_name, p.phone AS patient_phone
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE a.id = ? AND a.tenant_id = ?
  `, [id, tenantId]);
  return rowToAppointment(row);
}

export async function updateAppointment(id, tenantId, patch) {
  const existing = await getOne('SELECT * FROM appointments WHERE id = ? AND tenant_id = ?', [id, tenantId]);
  if (!existing) return null;

  const fields = [];
  const values = [];
  const map = {
    scheduledAt: 'scheduled_at',
    status: 'status',
    service: 'service',
    assignedDoctor: 'assigned_doctor',
    notes: 'notes',
    durationMin: 'duration_min',
    reminderSent: 'reminder_sent',
  };
  for (const [k, col] of Object.entries(map)) {
    if (patch[k] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(k === 'reminderSent' ? !!patch[k] : patch[k]);
    }
  }

  if (fields.length) {
    fields.push("updated_at = datetime('now')");
    values.push(id, tenantId);
    await run(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  }

  if (patch.status === 'visited') {
    await run("UPDATE patients SET last_visit = datetime('now'), is_returning = true, updated_at = datetime('now') WHERE id = ?", [existing.patient_id]);
    const patient = await getOne('SELECT name FROM patients WHERE id = ?', [existing.patient_id]);
    await scheduleRecallReminder(tenantId, existing.patient_id, patient?.name || 'Patient');
  }

  if (patch.status === 'confirmed' || patch.scheduledAt) {
    await scheduleAppointmentReminders(tenantId, id);
  }

  return getAppointmentById(id, tenantId);
}

export async function getAppointments(tenantId, { date, status, patientId, limit = 200 } = {}) {
  let sql = `
    SELECT a.*, p.name AS patient_name, p.phone AS patient_phone,
      (SELECT pp.amount FROM patient_payments pp
        WHERE pp.appointment_id = a.id AND pp.tenant_id = a.tenant_id
        ORDER BY pp.created_at DESC LIMIT 1) AS payment_amount,
      (SELECT pp.method FROM patient_payments pp
        WHERE pp.appointment_id = a.id AND pp.tenant_id = a.tenant_id
        ORDER BY pp.created_at DESC LIMIT 1) AS payment_method
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE a.tenant_id = ?
  `;
  const params = [tenantId];
  if (date) {
    sql += ' AND a.scheduled_at::date = ?::date';
    params.push(date);
  }
  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }
  if (patientId) {
    sql += ' AND a.patient_id = ?';
    params.push(patientId);
  }
  sql += ' ORDER BY a.scheduled_at ASC LIMIT ?';
  params.push(limit);
  const rows = await getAll(sql, params);
  return rows.map(rowToAppointment);
}

export async function getAppointmentsRange(tenantId, { from, to, status, patientId, limit = 1500 } = {}) {
  let sql = `
    SELECT a.*, p.name AS patient_name, p.phone AS patient_phone,
      (SELECT pp.amount FROM patient_payments pp
        WHERE pp.appointment_id = a.id AND pp.tenant_id = a.tenant_id
        ORDER BY pp.created_at DESC LIMIT 1) AS payment_amount,
      (SELECT pp.method FROM patient_payments pp
        WHERE pp.appointment_id = a.id AND pp.tenant_id = a.tenant_id
        ORDER BY pp.created_at DESC LIMIT 1) AS payment_method
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE a.tenant_id = ?
  `;
  const params = [tenantId];
  if (from) {
    sql += ' AND a.scheduled_at::date >= ?::date';
    params.push(from);
  }
  if (to) {
    sql += ' AND a.scheduled_at::date <= ?::date';
    params.push(to);
  }
  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }
  if (patientId) {
    sql += ' AND a.patient_id = ?';
    params.push(patientId);
  }
  sql += ' ORDER BY a.scheduled_at ASC LIMIT ?';
  params.push(limit);
  const rows = await getAll(sql, params);
  return rows.map(rowToAppointment);
}

export async function getTodayStats(tenantId) {
  const today = new Date().toISOString().slice(0, 10);
  const appointments = await getAppointments(tenantId, { date: today });
  const unconfirmed = appointments.filter((a) => a.status === 'requested').length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const arrived = appointments.filter((a) => ['arrived', 'visited'].includes(a.status)).length;
  const countRow = await getOne('SELECT COUNT(*)::int AS c FROM patients WHERE tenant_id = ?', [tenantId]);
  return {
    date: today,
    total: appointments.length,
    unconfirmed,
    confirmed,
    arrived,
    totalPatients: countRow?.c ?? 0,
    appointments,
  };
}

function parseDateLabel(label) {
  const now = new Date();
  const d = new Date(now);
  if (/today/i.test(label)) return d.toISOString().slice(0, 10);
  if (/tomorrow/i.test(label)) {
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  if (/weekend|saturday/i.test(label)) {
    const day = d.getDay();
    const add = day === 6 ? 0 : 6 - day;
    d.setDate(d.getDate() + add);
    return d.toISOString().slice(0, 10);
  }
  if (/flexible/i.test(label)) {
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

function timeLabelToISO(dateStr, timeLabel) {
  const map = {
    '10:00 AM': '10:00',
    '11:00 AM': '11:00',
    '12:00 PM': '12:00',
    '2:00 PM': '14:00',
    '4:00 PM': '16:00',
    '6:00 PM': '18:00',
    Evening: '17:00',
    Morning: '10:00',
  };
  const time = map[timeLabel] || '10:00';
  return `${dateStr}T${time}:00`;
}

export function resolveScheduledAt(dateLabel, timeLabel) {
  const dateStr = parseDateLabel(dateLabel);
  return timeLabelToISO(dateStr, timeLabel);
}

export async function getAvailableSlots(tenantId, dateStr) {
  const hours = await getClinicHours(tenantId);
  const booked = await getAll(`
    SELECT scheduled_at, duration_min FROM appointments
    WHERE tenant_id = ? AND scheduled_at::date = ?::date
    AND status NOT IN ('cancelled', 'no_show')
  `, [tenantId, dateStr]);

  const bookedTimes = new Set(booked.map((b) => {
    const d = new Date(b.scheduled_at);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }));

  const slots = [];
  for (let h = hours.start; h < hours.end; h++) {
    for (let m = 0; m < 60; m += hours.slotMin) {
      const label = formatSlotLabel(h, m);
      const key = `${h}:${String(m).padStart(2, '0')}`;
      if (!bookedTimes.has(key)) slots.push(label);
    }
  }
  return slots.slice(0, 8);
}

function formatSlotLabel(h, m) {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const min = m ? `:${String(m).padStart(2, '0')}` : '';
  return `${h12}${min} ${period}`;
}

export async function getPatientTimeline(patientId, tenantId) {
  const patient = await getPatientById(patientId, tenantId);
  if (!patient) return null;
  const appointments = await getAppointments(tenantId, { patientId });
  return { patient, appointments };
}
