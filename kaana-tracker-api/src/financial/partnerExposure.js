import { Decimal, toNumber } from './money.js';
import { resolveLedgerType, isActive } from './ledgerClassification.js';

const LEGACY_PARTNER_KEY = '__legacy_unassigned__';

export function partnerKey(row) {
  if (row.partner_user_id) return String(row.partner_user_id);
  return LEGACY_PARTNER_KEY;
}

function emptyPartner(id, name) {
  return {
    partnerUserId: id === LEGACY_PARTNER_KEY ? null : Number(id),
    partnerName: name,
    personalExpensesPaid: 0,
    capitalContributed: 0,
    reimbursementsReceived: 0,
    withdrawalsAndDistributions: 0,
    netCapitalExposure: 0,
  };
}

/**
 * netExposure = personalExpensesPaid + capitalContributed
 *               - reimbursementsReceived - withdrawalsAndDistributions
 */
export function computePartnerExposure(transactions, partnerNames = {}) {
  const buckets = new Map();

  function getBucket(key) {
    if (!buckets.has(key)) {
      const name = key === LEGACY_PARTNER_KEY
        ? 'Unassigned (legacy)'
        : (partnerNames[key] || `Partner ${key}`);
      buckets.set(key, emptyPartner(key, name));
    }
    return buckets.get(key);
  }

  let totalCapitalContributions = new Decimal(0);

  for (const tx of transactions) {
    if (!isActive(tx)) continue;
    const lt = resolveLedgerType(tx);
    const amt = new Decimal(tx.amount);
    const key = partnerKey(tx);
    const bucket = getBucket(key);

    switch (lt) {
      case 'expense':
        if (tx.funding_source === 'partner_personal' || tx.funding_source === 'legacy_unknown') {
          bucket.personalExpensesPaid = toNumber(
            new Decimal(bucket.personalExpensesPaid).plus(amt),
          );
        }
        break;
      case 'capital_contribution':
        bucket.capitalContributed = toNumber(
          new Decimal(bucket.capitalContributed).plus(amt),
        );
        totalCapitalContributions = totalCapitalContributions.plus(amt);
        break;
      case 'reimbursement':
        bucket.reimbursementsReceived = toNumber(
          new Decimal(bucket.reimbursementsReceived).plus(amt),
        );
        break;
      case 'withdrawal':
      case 'distribution':
        bucket.withdrawalsAndDistributions = toNumber(
          new Decimal(bucket.withdrawalsAndDistributions).plus(amt),
        );
        break;
      default:
        break;
    }
  }

  const partners = [...buckets.values()].map((p) => {
    const exposure = new Decimal(p.personalExpensesPaid)
      .plus(p.capitalContributed)
      .minus(p.reimbursementsReceived)
      .minus(p.withdrawalsAndDistributions);
    return { ...p, netCapitalExposure: toNumber(exposure) };
  });

  partners.sort((a, b) => (b.netCapitalExposure - a.netCapitalExposure));

  return {
    totalCapitalContributions: toNumber(totalCapitalContributions),
    partners,
  };
}

export { LEGACY_PARTNER_KEY };
