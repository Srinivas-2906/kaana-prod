export function PlaceholderPage({ title, note }: { title: string; note?: string }) {
  return (
    <>
      <header className="topbar"><h1 style={{ margin: 0, fontSize: '1.125rem' }}>{title}</h1></header>
      <div className="page">
        <div className="card muted">{note || `${title} — migrating from PHP in Phase M1.`}</div>
      </div>
    </>
  );
}
