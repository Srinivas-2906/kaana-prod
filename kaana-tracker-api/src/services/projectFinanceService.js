import { getPool } from '../db/index.js';
import { ensureFinanceSchema } from './schemaService.js';
import { assertProjectAccess } from './authorizationService.js';
import { listProjectTransactions } from './transactionService.js';
import { listMembers } from './membershipService.js';
import { buildFinancialSummary } from '../financial/financialEngine.js';

export async function getProjectFinancialSettings(projectId) {
  await ensureFinanceSchema();
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT id, name, currency, financial_start_date, economic_break_even_enabled,
      capital_adjustment_rate, revenue_target, created_at
    FROM clusters WHERE id = ?
  `, [projectId]);
  const row = rows[0];
  if (!row) return null;

  const startDate = row.financial_start_date
    ? String(row.financial_start_date).slice(0, 10)
    : String(row.created_at).slice(0, 10);

  return {
    projectId: row.id,
    name: row.name,
    currency: row.currency || 'INR',
    financialStartDate: startDate,
    economicBreakEvenEnabled: Boolean(row.economic_break_even_enabled),
    capitalAdjustmentRate: row.capital_adjustment_rate != null
      ? Number(row.capital_adjustment_rate)
      : null,
    revenueTarget: row.revenue_target != null ? Number(row.revenue_target) : null,
  };
}

export async function updateProjectFinancialSettings(projectId, data, userId) {
  const access = await assertProjectAccess(projectId, userId, 'edit');
  if (access.error) return { error: access.error, status: access.status };

  await ensureFinanceSchema();
  const pool = getPool();
  const updates = [];
  const params = [];

  if (data.financial_start_date !== undefined) {
    updates.push('financial_start_date = ?');
    params.push(data.financial_start_date || null);
  }
  if (data.economic_break_even_enabled !== undefined) {
    updates.push('economic_break_even_enabled = ?');
    params.push(data.economic_break_even_enabled ? 1 : 0);
  }
  if (data.capital_adjustment_rate !== undefined) {
    const rate = Number(data.capital_adjustment_rate);
    if (rate < 0) return { error: 'Capital adjustment rate cannot be negative', status: 400 };
    updates.push('capital_adjustment_rate = ?');
    params.push(rate);
  }
  if (data.revenue_target !== undefined) {
    updates.push('revenue_target = ?');
    params.push(data.revenue_target === null || data.revenue_target === ''
      ? null
      : Number(data.revenue_target));
  }
  if (data.currency !== undefined) {
    updates.push('currency = ?');
    params.push(data.currency);
  }

  if (!updates.length) return { error: 'No fields to update', status: 400 };

  params.push(projectId);
  await pool.query(`UPDATE clusters SET ${updates.join(', ')} WHERE id = ?`, params);
  return { settings: await getProjectFinancialSettings(projectId) };
}

export async function getProjectFinanceSummary(projectId, userId, options = {}) {
  const access = await assertProjectAccess(projectId, userId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const settings = await getProjectFinancialSettings(projectId);
  if (!settings) return { error: 'Project not found', status: 404 };

  const transactions = await listProjectTransactions(projectId);
  const { members: memberRows } = await listMembers(projectId);
  const partnerNames = {};
  for (const m of memberRows) {
    partnerNames[String(m.user_id)] = m.name;
  }

  const rateOverride = options.capitalAdjustmentRate != null
    ? Number(options.capitalAdjustmentRate)
    : null;

  const summary = buildFinancialSummary({
    transactions,
    currency: settings.currency,
    projectStartDate: settings.financialStartDate,
    economicBreakEvenEnabled: settings.economicBreakEvenEnabled,
    capitalAdjustmentRate: rateOverride ?? settings.capitalAdjustmentRate,
    targetDate: options.targetDate || null,
    revenueTarget: settings.revenueTarget,
    partnerNames,
    includeTrajectory: options.includeTrajectory !== false,
    month: options.month || null,
  });

  return { summary, settings };
}
