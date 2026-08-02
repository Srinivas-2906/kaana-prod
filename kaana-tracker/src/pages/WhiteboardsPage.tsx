import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createWhiteboard, fetchWhiteboards } from '../lib/api';
import type { Whiteboard } from '../types';

export function WhiteboardsPage() {
  const [boards, setBoards] = useState<Whiteboard[]>([]);
  const [title, setTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  function load() {
    fetchWhiteboards().then((r) => setBoards(r.whiteboards)).catch(console.error);
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createWhiteboard({ title: title.trim() });
    setTitle('');
    setShowForm(false);
    load();
  }

  return (
    <>
      <header className="topbar">
        <h1 style={{ margin: 0, fontSize: '1.125rem' }}>Whiteboards</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New board'}
        </button>
      </header>
      <div className="page">
        {showForm && (
          <form className="card" style={{ marginBottom: '1rem' }} onSubmit={onSubmit}>
            <label>
              Title
              <input required value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} />
            </label>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>Create</button>
          </form>
        )}
        <div className="grid-2">
          {boards.map((b) => (
            <Link key={b.id} to={`/whiteboards/${b.id}`} className="card board-link">
              <strong>{b.title}</strong>
              <p className="muted">{b.note_count ?? 0} notes · {b.created_by_name}</p>
            </Link>
          ))}
          {!boards.length && <p className="muted">No whiteboards yet.</p>}
        </div>
      </div>
    </>
  );
}
