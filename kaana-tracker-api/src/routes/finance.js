import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getProjectFinanceSummary,
  getProjectFinancialSettings,
  updateProjectFinancialSettings,
} from '../services/projectFinanceService.js';
import { listProjectTransactions } from '../services/transactionService.js';
import { assertProjectAccess } from '../services/authorizationService.js';
import { simulateFinancialSummary } from '../financial/financialEngine.js';
import { getProjectFinancialSettings as loadSettings } from '../services/projectFinanceService.js';

const router = Router();
router.use(authMiddleware);

router.get('/projects/:projectId/finance/summary', async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const result = await getProjectFinanceSummary(projectId, req.user.sub, {
      targetDate: req.query.targetDate || null,
      capitalAdjustmentRate: req.query.capitalAdjustmentRate != null
        ? Number(req.query.capitalAdjustmentRate)
        : null,
      month: req.query.month || null,
      includeTrajectory: req.query.includeTrajectory !== 'false',
    });
    if (result.error) return res.status(result.status || 400).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load finance summary' });
  }
});

router.get('/projects/:projectId/finance/settings', async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const access = await assertProjectAccess(projectId, req.user.sub, 'view');
    if (access.error) return res.status(access.status).json({ error: access.error });
    const settings = await getProjectFinancialSettings(projectId);
    if (!settings) return res.status(404).json({ error: 'Project not found' });
    res.json({ settings });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load finance settings' });
  }
});

router.patch('/projects/:projectId/finance/settings', async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const result = await updateProjectFinancialSettings(projectId, req.body, req.user.sub);
    if (result.error) return res.status(result.status || 400).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update finance settings' });
  }
});

router.post('/finance/simulate', async (req, res) => {
  try {
    const body = req.body || {};
    let cashFlows = body.cashFlows || [];

    if (body.projectId) {
      const projectId = Number(body.projectId);
      const access = await assertProjectAccess(projectId, req.user.sub, 'view');
      if (access.error) return res.status(access.status).json({ error: access.error });

      const settings = await loadSettings(projectId);
      const transactions = await listProjectTransactions(projectId);
      cashFlows = transactions.map((t) => ({
        amount: t.amount,
        date: String(t.transaction_date).slice(0, 10),
        ledger_type: t.ledger_type,
        type: t.ledger_type,
        funding_source: t.funding_source,
        partner_user_id: t.partner_user_id,
      }));

      if (body.additionalCashFlows?.length) {
        cashFlows = [...cashFlows, ...body.additionalCashFlows];
      }

      body.projectStartDate = body.projectStartDate || settings?.financialStartDate;
      body.currency = body.currency || settings?.currency || 'INR';
      if (body.capitalAdjustmentRate == null && body.annualCapitalAdjustmentRate == null) {
        body.annualCapitalAdjustmentRate = settings?.capitalAdjustmentRate;
      }
    }

    if (!body.projectStartDate) {
      return res.status(400).json({ error: 'projectStartDate is required' });
    }
    if (!body.targetDate) {
      return res.status(400).json({ error: 'targetDate is required' });
    }

    const rate = body.annualCapitalAdjustmentRate ?? body.capitalAdjustmentRate;
    if (rate != null && Number(rate) < 0) {
      return res.status(400).json({ error: 'Capital adjustment rate cannot be negative' });
    }

    const summary = simulateFinancialSummary({
      cashFlows,
      projectStartDate: body.projectStartDate,
      targetDate: body.targetDate,
      annualCapitalAdjustmentRate: rate,
      currency: body.currency || 'INR',
      includeTrajectory: body.includeTrajectory !== false,
    });

    res.json({ summary });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Simulation failed' });
  }
});

export default router;
