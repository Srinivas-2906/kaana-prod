import { useEffect, useState } from 'react';
import { fetchWorkItems } from '../lib/api';
import type { WorkItem } from '../types';

export function MyWorkPage() {
  const [items, setItems] = useState<WorkItem[]>([]);

  useEffect(() => {
    fetchWorkItems({ mine: true }).then((r) => setItems(r.items)).catch(console.error);
  }, []);

  return (
    <>
      <header className="topbar"><h1 style={{ margin: 0, fontSize: '1.125rem' }}>My work</h1></header>
      <div className="page">
        {items.map((item) => (
          <div key={item.id} className="card" style={{ marginBottom: '0.5rem', borderLeft: item.cluster_color ? `4px solid ${item.cluster_color}` : undefined }}>
            <strong>{item.title}</strong>
            <p className="muted">{item.cluster_name || 'No project'} · {item.status}</p>
          </div>
        ))}
        {!items.length && <p className="muted">No open work assigned to you.</p>}
      </div>
    </>
  );
}
