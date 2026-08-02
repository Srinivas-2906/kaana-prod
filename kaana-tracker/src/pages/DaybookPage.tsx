import { Link } from 'react-router-dom';
import { usePlanParams } from '../hooks/usePlanParams';
import { addDays, todayISO } from '../lib/dates';
import { DayDetailPanel } from '../components/DayDetailPanel';

export function DaybookPage() {
  const { date, projectId, setDate, planQuery } = usePlanParams();

  return (
    <>
      <header className="topbar">
        <h1 style={{ margin: 0, fontSize: '1.125rem' }}>Daybook</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setDate(addDays(date, -1))}>←</button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="button" className="btn btn-ghost" onClick={() => setDate(addDays(date, 1))}>→</button>
          <button type="button" className="btn btn-ghost" onClick={() => setDate(todayISO())}>Today</button>
          <Link to={planQuery()} className="btn btn-ghost">Plan</Link>
        </div>
      </header>
      <div className="page">
        <div className="card">
          <DayDetailPanel date={date} projectId={projectId} />
        </div>
      </div>
    </>
  );
}
