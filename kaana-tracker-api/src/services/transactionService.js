import { getPool } from '../db/index.js';
import { CATEGORIES, PAYMENT_METHODS, PAID_BY_OPTIONS } from '../constants.js';
import { ensureM3Schema } from './schemaService.js';
import { logActivity } from './activityService.js';

function validateTransaction(data) {
  const errors = [];
  if (!['income', 'expense'].includes(data.type)) errors.push('Invalid type');
  if (!data.amount || Number(data.amount) <= 0) errors.push('Invalid amount');
  if (!CATEGORIES.includes(data.category)) errors.push('Invalid category');
  if (!data.transaction_date) errors.push('Date required');
  if (!PAYMENT_METHODS.includes(data.payment_method)) errors.push('Invalid payment method');
  if (!PAID_BY_OPTIONS.includes(data.paid_by)) errors.push('Invalid paid_by');
  return errors;
}

function financeWhere(filters = {}) {
  const where = [];
  const params = [];
  if (filters.type) { where.push('t.type = ?'); params.push(filters.type); }
  if (filters.month) { where.push('DATE_FORMAT(t.transaction_date, "%Y-%m") = ?'); params.push(filters.month); }
  if (filters.date) { where.push('t.transaction_date = ?'); params.push(filters.date); }
  if (filters.projectId) { where.push('t.project_id = ?'); params.push(filters.projectId); }
  return { where, params };
}

export async function listTransactions(filters = {}) {
  await ensureM3Schema();
  const pool = getPool();
  const { where, params } = financeWhere(filters);
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`
    SELECT t.*, u.name AS created_by_name
    FROM transactions t
    JOIN users u ON t.created_by = u.id
    ${whereClause}
    ORDER BY t.transaction_date DESC, t.created_at DESC
    LIMIT 500
  `, params);
  return rows;
}

export async function getTransactionById(id) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT t.*, u.name AS created_by_name FROM transactions t
    JOIN users u ON t.created_by = u.id WHERE t.id = ?
  `, [id]);
  return rows[0] || null;
}

export async function createTransaction(data, userId) {
  const errors = validateTransaction(data);
  if (errors.length) return { errors };

  await ensureM3Schema();
  const pool = getPool();
  const [result] = await pool.query(`
    INSERT INTO transactions (type, amount, category, description, transaction_date, payment_method, paid_by, project_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.type, data.amount, data.category, data.description || null,
    data.transaction_date, data.payment_method, data.paid_by,
    data.project_id || null, userId,
  ]);

  const transaction = await getTransactionById(result.insertId);
  const sign = transaction.type === 'income' ? '+' : '-';
  await logActivity({
    eventType: 'transaction_created',
    entityType: 'transaction',
    entityId: transaction.id,
    projectId: transaction.project_id,
    actorId: userId,
    summary: `${sign}₹${Number(transaction.amount).toLocaleString('en-IN')} ${transaction.category}`,
    payload: { type: transaction.type, amount: transaction.amount, category: transaction.category },
  });

  return { transaction };
}

export async function getFinanceSummary(month = null, projectId = null) {
  await ensureM3Schema();
  const pool = getPool();
  const where = [];
  const params = [];
  if (month) { where.push('DATE_FORMAT(transaction_date, "%Y-%m") = ?'); params.push(month); }
  if (projectId) { where.push('project_id = ?'); params.push(projectId); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
    FROM transactions ${whereClause}
  `, params);
  const row = rows[0] || { total_income: 0, total_expense: 0 };

  const balWhere = projectId ? 'WHERE project_id = ?' : '';
  const balParams = projectId ? [projectId] : [];
  const [bal] = await pool.query(`
    SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
    FROM transactions ${balWhere}
  `, balParams);

  return {
    total_income: Number(row.total_income),
    total_expense: Number(row.total_expense),
    net: Number(row.total_income) - Number(row.total_expense),
    balance: Number(bal[0]?.balance || 0),
  };
}
