import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

/** Parse amount safely; rejects negative and non-numeric */
export function toDecimal(value) {
  if (value === null || value === undefined || value === '') {
    throw new Error('Amount required');
  }
  const d = new Decimal(value);
  if (!d.isFinite() || d.lte(0)) {
    throw new Error('Amount must be positive');
  }
  return d;
}

/** Round for display/persistence (INR 2 dp) */
export function roundMoney(d) {
  return new Decimal(d).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/** Convert Decimal to number for JSON (2 dp) */
export function toNumber(d) {
  return roundMoney(d).toNumber();
}

/** Convert Decimal to string for JSON (2 dp) */
export function toMoneyString(d) {
  return roundMoney(d).toFixed(2);
}
