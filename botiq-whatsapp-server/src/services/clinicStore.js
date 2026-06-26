import { nanoid } from 'nanoid';
import { getDb } from '../db/index.js';
import { scheduleAppointmentReminders, scheduleRecallReminder } from './clinicReminders.js';

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
    tags: JSON.parse(row.tags || '[]'),
    notes: JSON.parse(row.notes || '[]'),
    lastVisit: row.last_visit,
    source: row.source || 'WhatsApp',
    conversationId: row.conversation_id,
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
    reminderSent: !!row.reminder_sent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const DEFAULT_HOURS = { start: 10, end: 19, slotMin: 30 };

export function getClinicHours(tenantId) {
  const row = getDb().prepare('SELECT settings FROM tenants WHERE id = ?').get(tenantId);
  if (!row) return DEFAULT_HOURS;
  try {
    const s = JSON.parse(row.settings || '{}');
    return {
      start: s.clinicHours?.start ?? DEFAULT_HOURS.start,
      end: s.clinicHours?.end ?? DEFAULT_HOURS.end,
      slotMin: s.clinicHours?.slotMin ?? DEFAULT_HOURS.slotMin,
    };
  } catch {
    return DEFAULT_HOURS;
  }
}

export function getOrCreatePatient({ phone, name, tenantId, source = 'WhatsApp', chiefComplaint, age, conversationId }) {
  const db = getDb();
  const digits = phoneDigits(phone);
  let row = db.prepare('SELECT * FROM patients WHERE tenant_id = ? AND phone_digits = ?').get(tenantId, digits);
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
      db.prepare(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
      row = db.prepare('SELECT * FROM patients WHERE id = ?').get(row.id);
    }
    return rowToPatient(row);
  }

  const id = nanoid(12);
  db.prepare(`
    INSERT INTO patients (id, tenant_id, name, phone, phone_digits, chief_complaint, age, source, conversation_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    tenantId,
    name || 'New Patient',
    formatPhone(phone),
    digits,
    chiefComplaint || '',
    age ?? null,
    source,
    conversationId || null,
  );
  row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  return rowToPatient(row);
}

export function createPatient(tenantId, data) {
  const digits = phoneDigits(data.phone);
  if (!digits) throw new Error('Phone required');
  const existing = getDb().prepare('SELECT id FROM patients WHERE tenant_id = ? AND phone_digits = ?').get(tenantId, digits);
  if (existing) return updatePatient(existing.id, tenantId, data);

  const id = nanoid(12);
  getDb().prepare(`
    INSERT INTO patients (id, tenant_id, name, phone, phone_digits, email, age, gender, chief_complaint, is_returning, tags, notes, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    tenantId,
    data.name || 'Patient',
    formatPhone(data.phone),
    digits,
    data.email || '',
    data.age ?? null,
    data.gender || '',
    data.chiefComplaint || '',
    data.isReturning ? 1 : 0,
    JSON.stringify(data.tags || []),
    JSON.stringify(data.notes || []),
    data.source || 'Walk-in',
  );
  return rowToPatient(getDb().prepare('SELECT * FROM patients WHERE id = ?').get(id));
}

export function updatePatient(id, tenantId, patch) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM patients WHERE id = ? AND tenant_id = ?').get(id, tenantId);
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
  };
  for (const [k, col] of Object.entries(map)) {
    if (patch[k] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(k === 'isReturning' ? (patch[k] ? 1 : 0) : patch[k]);
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
    const notes = JSON.parse(row.notes || '[]');
    notes.unshift({ text: patch.note, at: new Date().toISOString(), by: patch.by || 'Staff' });
    fields.push('notes = ?');
    values.push(JSON.stringify(notes.slice(0, 50)));
  }

  if (fields.length) {
    fields.push("updated_at = datetime('now')");
    values.push(id, tenantId);
    db.prepare(`UPDATE patients SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`).run(...values);
  }
  return rowToPatient(db.prepare('SELECT * FROM patients WHERE id = ?').get(id));
}

export function getPatients(tenantId, { search, limit = 100 } = {}) {
  let sql = 'SELECT * FROM patients WHERE tenant_id = ?';
  const params = [tenantId];
  if (search) {
    sql += ' AND (name LIKE ? OR phone LIKE ? OR chief_complaint LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q);
  }
  sql += ' ORDER BY updated_at DESC LIMIT ?';
  params.push(limit);
  return getDb().prepare(sql).all(...params).map(rowToPatient);
}

export function getPatientById(id, tenantId) {
  const row = getDb().prepare('SELECT * FROM patients WHERE id = ? AND tenant_id = ?').get(id, tenantId);
  return rowToPatient(row);
}

export function getPatientByPhone(phone, tenantId) {
  const digits = phoneDigits(phone);
  const row = getDb().prepare('SELECT * FROM patients WHERE tenant_id = ? AND phone_digits = ?').get(tenantId, digits);
  return rowToPatient(row);
}

export function createAppointment(tenantId, data) {
  const db = getDb();
  let patient = data.patientId
    ? getPatientById(data.patientId, tenantId)
    : data.phone
      ? getOrCreatePatient({ phone: data.phone, name: data.patientName, tenantId, source: data.source || 'WhatsApp', chiefComplaint: data.service })
      : null;

  if (!patient && data.patientName) {
    patient = createPatient(tenantId, { name: data.patientName, phone: data.phone || '', source: data.source || 'Walk-in' });
  }
  if (!patient) throw new Error('Patient required');

  const id = nanoid(12);
  const status = data.status || 'requested';
  db.prepare(`
    INSERT INTO appointments (id, tenant_id, patient_id, service, service_id, scheduled_at, duration_min, status, assigned_doctor, notes, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  );

  db.prepare("UPDATE patients SET updated_at = datetime('now') WHERE id = ?").run(patient.id);
  const appt = getAppointmentById(id, tenantId);
  scheduleAppointmentReminders(tenantId, id);
  return appt;
}

export function getAppointmentById(id, tenantId) {
  const row = getDb().prepare(`
    SELECT a.*, p.name AS patient_name, p.phone AS patient_phone
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE a.id = ? AND a.tenant_id = ?
  `).get(id, tenantId);
  return rowToAppointment(row);
}

export function updateAppointment(id, tenantId, patch) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ? AND tenant_id = ?').get(id, tenantId);
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
      values.push(k === 'reminderSent' ? (patch[k] ? 1 : 0) : patch[k]);
    }
  }

  if (fields.length) {
    fields.push("updated_at = datetime('now')");
    values.push(id, tenantId);
    db.prepare(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`).run(...values);
  }

  if (patch.status === 'visited') {
    db.prepare("UPDATE patients SET last_visit = datetime('now'), is_returning = 1, updated_at = datetime('now') WHERE id = ?").run(existing.patient_id);
    const patient = db.prepare('SELECT name FROM patients WHERE id = ?').get(existing.patient_id);
    scheduleRecallReminder(tenantId, existing.patient_id, patient?.name || 'Patient');
  }

  if (patch.status === 'confirmed' || patch.scheduledAt) {
    scheduleAppointmentReminders(tenantId, id);
  }

  return getAppointmentById(id, tenantId);
}

export function getAppointments(tenantId, { date, status, patientId, limit = 200 } = {}) {
  let sql = `
    SELECT a.*, p.name AS patient_name, p.phone AS patient_phone
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE a.tenant_id = ?
  `;
  const params = [tenantId];
  if (date) {
    sql += ' AND date(a.scheduled_at) = date(?)';
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
  return getDb().prepare(sql).all(...params).map(rowToAppointment);
}

export function getTodayStats(tenantId) {
  const today = new Date().toISOString().slice(0, 10);
  const db = getDb();
  const appointments = getAppointments(tenantId, { date: today });
  const unconfirmed = appointments.filter((a) => a.status === 'requested').length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const arrived = appointments.filter((a) => ['arrived', 'visited'].includes(a.status)).length;
  const totalPatients = db.prepare('SELECT COUNT(*) AS c FROM patients WHERE tenant_id = ?').get(tenantId)?.c ?? 0;
  return {
    date: today,
    total: appointments.length,
    unconfirmed,
    confirmed,
    arrived,
    totalPatients,
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

export function getAvailableSlots(tenantId, dateStr) {
  const hours = getClinicHours(tenantId);
  const booked = getDb().prepare(`
    SELECT scheduled_at, duration_min FROM appointments
    WHERE tenant_id = ? AND date(scheduled_at) = date(?)
    AND status NOT IN ('cancelled', 'no_show')
  `).all(tenantId, dateStr);

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

export function getPatientTimeline(patientId, tenantId) {
  const patient = getPatientById(patientId, tenantId);
  if (!patient) return null;
  const appointments = getAppointments(tenantId, { patientId });
  return { patient, appointments };
}
