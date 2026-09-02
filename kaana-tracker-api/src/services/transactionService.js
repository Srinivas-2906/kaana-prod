import { getPool } from '../db/index.js';
import { CATEGORIES, PAYMENT_METHODS, PAID_BY_OPTIONS } from '../constants.js';
import { ensureFinanceSchema } from './schemaService.js';
import { logActivity } from './activityService.js';
import { assertProjectAccess, listAccessibleProjectIds } from './authorizationService.js';
import {
  LEDGER_TYPES,
  FUNDING_SOURCES,
  legacyTypeForLedger,
  legacyPaidByForFunding,
} from '../financial/constants.js';
import { computeLegacyFinanceSummary } from '../financial/financialEngine.js';

const ALL_CATEGORIES = [...new Set([...CATEGORIES, 'Other Income', 'Capital', 'Reimbursement', 'Withdrawal', 'Distribution'])];

function normalizeLedgerType(data) {
  if (data.ledger_type && LEDGER_TYPES.includes(data.ledger_type)) return data.ledger_type;
  if (data.type === 'income') return 'income';
  if (data.type === 'expense') return 'expense';
  return null;
}

function normalizeFundingSource(data, ledgerType) {
  if (data.funding_source && FUNDING_SOURCES.includes(data.funding_source)) {
    return data.funding_source;
  }
  if (data.paid_by === 'Company') return 'company_account';
  if (data.paid_by === 'Kaana' || data.paid_by === 'Partner') return 'partner_personal';
  if (ledgerType === 'expense' && data.partner_user_id) return 'partner_personal';
  return 'company_account';
}

function validateTransaction(data, isUpdate = false) {
  const errors = [];
  const ledgerType = normalizeLedgerType(data);
  if (!ledgerType) errors.push('Invalid transaction type');
  if (!isUpdate || data.amount !== undefined) {
    if (!data.amount || Number(data.amount) <= 0) errors.push('Invalid amount');
  }
  if (!isUpdate || data.category !== undefined) {
    const cat = data.category || defaultCategory(ledgerType);
    if (!ALL_CATEGORIES.includes(cat)) errors.push('Invalid category');
  }
  if (!isUpdate || data.transaction_date !== undefined) {
    if (!data.transaction_date) errors.push('Date required');
  }
  if (data.payment_method && !PAYMENT_METHODS.includes(data.payment_method)) {
    errors.push('Invalid payment method');
  }
  if (data.paid_by && !PAID_BY_OPTIONS.includes(data.paid_by)) {
    errors.push('Invalid paid_by');
  }
  if (data.annualCapitalAdjustmentRate !== undefined && Number(data.annualCapitalAdjustmentRate) < 0) {
    errors.push('Invalid adjustment rate');
  }
  return errors;
}

function defaultCategory(ledgerType) {
  switch (ledgerType) {
    case 'income': return 'Client Payment';
    case 'capital_contribution': return 'Capital';
    case 'reimbursement': return 'Reimbursement';
    case 'withdrawal': return 'Withdrawal';
    case 'distribution': return 'Distribution';
    default: return 'Miscellaneous';
  }
}

function financeWhere(filters = {}) {
  const where = ['t.status = ?'];
  const params = ['active'];
  if (filters.type) {
    where.push('(t.type = ? OR t.ledger_type = ?)');
    params.push(filters.type, filters.type);
  }
  if (filters.ledgerType) {
    where.push('t.ledger_type = ?');
    params.push(filters.ledgerType);
  }
  if (filters.month) {
    where.push('DATE_FORMAT(t.transaction_date, "%Y-%m") = ?');
    params.push(filters.month);
  }
  if (filters.date) {
    where.push('t.transaction_date = ?');
    params.push(filters.date);
  }
  if (filters.projectId) {
    where.push('t.project_id = ?');
    params.push(filters.projectId);
  }
  if (filters.accessibleProjectIds) {
    const ids = filters.accessibleProjectIds;
    if (ids.length === 0) {
      where.push('(t.project_id IS NULL AND t.created_by = ?)');
      params.push(filters.userId);
    } else {
      const ph = ids.map(() => '?').join(',');
      where.push(`(t.project_id IN (${ph}) OR (t.project_id IS NULL AND t.created_by = ?))`);
      params.push(...ids, filters.userId);
    }
  }
  return { where, params };
}

function mapTransactionRow(row) {
  if (!row) return null;
  return {
    ...row,
    ledger_type: row.ledger_type || row.type,
    amount: Number(row.amount),
    reimbursable: Boolean(row.reimbursable),
    partner_user_id: row.partner_user_id ? Number(row.partner_user_id) : null,
    linked_transaction_id: row.linked_transaction_id ? Number(row.linked_transaction_id) : null,
  };
}

export async function assertTransactionAccess(transaction, userId, level = 'view') {
  if (!transaction) return { error: 'Transaction not found', status: 404 };
  if (transaction.project_id) {
    return assertProjectAccess(transaction.project_id, userId, level);
  }
  if (Number(transaction.created_by) !== Number(userId)) {
    return { error: 'You do not have access to this transaction', status: 403 };
  }
  return { role: 'owner' };
}

export async function listTransactions(filters = {}, userId = null) {
  await ensureFinanceSchema();
  const pool = getPool();
  const f = { ...filters };
  if (userId) {
    f.accessibleProjectIds = await listAccessibleProjectIds(userId);
    f.userId = userId;
  }
  const { where, params } = financeWhere(f);
  const whereClause = `WHERE ${where.join(' AND ')}`;
  const [rows] = await pool.query(`
    SELECT t.*, u.name AS created_by_name,
      pu.name AS partner_name
    FROM transactions t
    JOIN users u ON t.created_by = u.id
    LEFT JOIN users pu ON t.partner_user_id = pu.id
    ${whereClause}
    ORDER BY t.transaction_date DESC, t.created_at DESC
    LIMIT 500
  `, params);
  return rows.map(mapTransactionRow);
}

export async function getTransactionById(id) {
  await ensureFinanceSchema();
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT t.*, u.name AS created_by_name, pu.name AS partner_name
    FROM transactions t
    JOIN users u ON t.created_by = u.id
    LEFT JOIN users pu ON t.partner_user_id = pu.id
    WHERE t.id = ?
  `, [id]);
  return mapTransactionRow(rows[0] || null);
}

export async function listProjectTransactions(projectId) {
  await ensureFinanceSchema();
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT t.*, u.name AS created_by_name, pu.name AS partner_name
    FROM transactions t
    JOIN users u ON t.created_by = u.id
    LEFT JOIN users pu ON t.partner_user_id = pu.id
    WHERE t.project_id = ? AND t.status = 'active'
    ORDER BY t.transaction_date ASC, t.id ASC
  `, [projectId]);
  return rows.map(mapTransactionRow);
}

export async function createTransaction(data, userId) {
  const ledgerType = normalizeLedgerType(data);
  const errors = validateTransaction({ ...data, ledger_type: ledgerType });
  if (errors.length) return { errors };

  if (data.project_id) {
    const access = await assertProjectAccess(data.project_id, userId, 'edit');
    if (access.error) return { error: access.error, status: access.status };
  }

  await ensureFinanceSchema();
  const pool = getPool();
  const fundingSource = normalizeFundingSource(data, ledgerType);
  const legacyType = legacyTypeForLedger(ledgerType);
  const legacyPaidBy = data.paid_by || legacyPaidByForFunding(fundingSource, ledgerType);
  const category = data.category || defaultCategory(ledgerType);

  const [result] = await pool.query(`
    INSERT INTO transactions (
      type, ledger_type, amount, category, description, transaction_date,
      payment_method, paid_by, partner_user_id, funding_source, linked_transaction_id,
      status, currency, reimbursable, project_id, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
  `, [
    legacyType, ledgerType, data.amount, category, data.description || null,
    data.transaction_date, data.payment_method || 'UPI', legacyPaidBy,
    data.partner_user_id || null, fundingSource, data.linked_transaction_id || null,
    data.currency || 'INR', data.reimbursable ? 1 : 0,
    data.project_id || null, userId,
  ]);

  const transaction = await getTransactionById(result.insertId);
  const sign = ['income', 'capital_contribution'].includes(ledgerType) ? '+' : '-';
  await logActivity({
    eventType: 'transaction_created',
    entityType: 'transaction',
    entityId: transaction.id,
    projectId: transaction.project_id,
    actorId: userId,
    summary: `${sign}₹${Number(transaction.amount).toLocaleString('en-IN')} ${category}`,
    payload: { ledger_type: ledgerType, amount: transaction.amount, category },
  });

  return { transaction };
}

export async function updateTransaction(id, data, userId) {
  const existing = await getTransactionById(id);
  if (!existing) return { error: 'Transaction not found', status: 404 };
  if (existing.status === 'void') return { error: 'Cannot edit voided transaction', status: 400 };

  const access = await assertTransactionAccess(existing, userId, 'edit');
  if (access.error) return { error: access.error, status: access.status };

  const ledgerType = normalizeLedgerType({ ...existing, ...data }) || existing.ledger_type;
  const errors = validateTransaction({ ...existing, ...data, ledger_type: ledgerType }, true);
  if (errors.length) return { errors };

  const pool = getPool();
  const fundingSource = data.funding_source
    ? data.funding_source
    : (data.paid_by ? normalizeFundingSource(data, ledgerType) : existing.funding_source);
  const legacyType = legacyTypeForLedger(ledgerType);
  const legacyPaidBy = data.paid_by || legacyPaidByForFunding(fundingSource, ledgerType);

  await pool.query(`
    UPDATE transactions SET
      type = ?, ledger_type = ?, amount = ?, category = ?, description = ?,
      transaction_date = ?, payment_method = ?, paid_by = ?,
      partner_user_id = ?, funding_source = ?, linked_transaction_id = ?,
      currency = ?, reimbursable = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    legacyType, ledgerType,
    data.amount ?? existing.amount,
    data.category ?? existing.category,
    data.description !== undefined ? data.description : existing.description,
    data.transaction_date ?? existing.transaction_date,
    data.payment_method ?? existing.payment_method,
    legacyPaidBy,
    data.partner_user_id !== undefined ? data.partner_user_id : existing.partner_user_id,
    fundingSource,
    data.linked_transaction_id !== undefined ? data.linked_transaction_id : existing.linked_transaction_id,
    data.currency ?? existing.currency ?? 'INR',
    data.reimbursable !== undefined ? (data.reimbursable ? 1 : 0) : existing.reimbursable,
    id,
  ]);

  return { transaction: await getTransactionById(id) };
}

export async function voidTransaction(id, userId) {
  const existing = await getTransactionById(id);
  if (!existing) return { error: 'Transaction not found', status: 404 };
  if (existing.status === 'void') return { transaction: existing };

  const access = await assertTransactionAccess(existing, userId, 'edit');
  if (access.error) return { error: access.error, status: access.status };

  const pool = getPool();
  await pool.query(`UPDATE transactions SET status = 'void', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
  return { transaction: await getTransactionById(id) };
}

export async function getFinanceSummary(month = null, projectId = null, userId = null) {
  let transactions;
  if (projectId) {
    if (userId) {
      const access = await assertProjectAccess(projectId, userId, 'view');
      if (access.error) return { error: access.error, status: access.status };
    }
    transactions = await listProjectTransactions(projectId);
  } else {
    transactions = await listTransactions({}, userId);
  }
  return computeLegacyFinanceSummary(transactions, month);
}

export function getTransactionMeta() {
  return {
    categories: ALL_CATEGORIES,
    paymentMethods: PAYMENT_METHODS,
    paidByOptions: PAID_BY_OPTIONS,
    ledgerTypes: LEDGER_TYPES,
    fundingSources: FUNDING_SOURCES,
  };
}
