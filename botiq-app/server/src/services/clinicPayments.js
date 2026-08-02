import { nanoid } from 'nanoid';
import { getOne, getAll, run } from '../db/query.js';

function rowToPayment(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    appointmentId: row.appointment_id,
    amount: row.amount,
    method: row.method,
    reference: row.reference || '',
    notes: row.notes || '',
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function createPayment(tenantId, data) {
  const id = nanoid(12);
  await run(`
    INSERT INTO patient_payments (id, tenant_id, patient_id, appointment_id, amount, method, reference, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    tenantId,
    data.patientId,
    data.appointmentId || null,
    data.amount,
    data.method || 'cash',
    data.reference || '',
    data.notes || '',
    data.status || 'paid',
  ]);
  return getPaymentById(id, tenantId);
}

export async function getPaymentById(id, tenantId) {
  const row = await getOne(`
    SELECT pp.*, p.name AS patient_name
    FROM patient_payments pp
    JOIN patients p ON p.id = pp.patient_id
    WHERE pp.id = ? AND pp.tenant_id = ?
  `, [id, tenantId]);
  return row ? rowToPayment(row) : null;
}

export async function getPayments(tenantId, { patientId, limit = 100 } = {}) {
  let sql = `
    SELECT pp.*, p.name AS patient_name
    FROM patient_payments pp
    JOIN patients p ON p.id = pp.patient_id
    WHERE pp.tenant_id = ?
  `;
  const params = [tenantId];
  if (patientId) {
    sql += ' AND pp.patient_id = ?';
    params.push(patientId);
  }
  sql += ' ORDER BY pp.created_at DESC LIMIT ?';
  params.push(limit);
  const rows = await getAll(sql, params);
  return rows.map(rowToPayment);
}

export async function getPaymentsRange(tenantId, { from, to, patientId, limit = 5000 } = {}) {
  let sql = `
    SELECT pp.*, p.name AS patient_name
    FROM patient_payments pp
    JOIN patients p ON p.id = pp.patient_id
    WHERE pp.tenant_id = ?
  `;
  const params = [tenantId];
  if (patientId) {
    sql += ' AND pp.patient_id = ?';
    params.push(patientId);
  }
  if (from) {
    sql += ' AND pp.created_at::date >= ?::date';
    params.push(from);
  }
  if (to) {
    sql += ' AND pp.created_at::date <= ?::date';
    params.push(to);
  }
  sql += ' ORDER BY pp.created_at DESC LIMIT ?';
  params.push(limit);
  const rows = await getAll(sql, params);
  return rows.map(rowToPayment);
}

export async function getPaymentSummary(tenantId) {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + '01';
  const todayRow = await getOne(`
    SELECT COALESCE(SUM(amount), 0) AS total FROM patient_payments
    WHERE tenant_id = ? AND created_at::date = ?::date
  `, [tenantId, today]);
  const monthRow = await getOne(`
    SELECT COALESCE(SUM(amount), 0) AS total FROM patient_payments
    WHERE tenant_id = ? AND created_at::date >= ?::date
  `, [tenantId, monthStart]);
  const dueRow = await getOne(`
    SELECT COUNT(*)::int AS c FROM patient_payments WHERE tenant_id = ? AND status = 'due'
  `, [tenantId]);
  return {
    todayTotal: todayRow?.total ?? 0,
    monthTotal: monthRow?.total ?? 0,
    dueCount: dueRow?.c ?? 0,
  };
}
