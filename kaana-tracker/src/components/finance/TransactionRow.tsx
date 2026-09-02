import { formatINR, ledgerTypeLabel, txAmountColor, isIncomeLike } from '../../lib/financeFormat';
import type { Transaction } from '../../types';

type Props = {
  tx: Transaction;
  onVoid?: (id: number) => void;
  canEdit?: boolean;
};

export function TransactionRow({ tx, onVoid, canEdit }: Props) {
  const lt = tx.ledger_type || tx.type;
  const sign = isIncomeLike(tx) ? '+' : '-';

  return (
    <div className="tx-row">
      <div>
        <strong>{tx.category}</strong>
        <span className="muted"> · {ledgerTypeLabel(lt)}</span>
        {tx.description && <span className="muted"> — {tx.description}</span>}
        <div className="muted">
          {tx.transaction_date}
          {tx.payment_method && ` · ${tx.payment_method}`}
          {tx.partner_name && ` · ${tx.partner_name}`}
          {tx.created_by_name && ` · entered by ${tx.created_by_name}`}
        </div>
      </div>
      <div className="tx-row-actions">
        <strong style={{ color: txAmountColor(tx) }}>
          {sign}{formatINR(Number(tx.amount))}
        </strong>
        {canEdit && onVoid && tx.status !== 'void' && (
          <button type="button" className="btn btn-ghost btn-compact" onClick={() => onVoid(tx.id)}>
            Void
          </button>
        )}
      </div>
    </div>
  );
}
