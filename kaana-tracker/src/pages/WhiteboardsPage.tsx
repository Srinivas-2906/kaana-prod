import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, StickyNote } from 'lucide-react';
import { createWhiteboard, fetchWhiteboards } from '../lib/api';
import type { Whiteboard } from '../types';

export function WhiteboardsPage() {
  const [boards, setBoards] = useState<Whiteboard[]>([]);
  const [title, setTitle] = useState('');
  const [boardType, setBoardType] = useState<'sticky' | 'diagram'>('sticky');
  const [showForm, setShowForm] = useState(false);

  function load() {
    fetchWhiteboards().then((r) => setBoards(r.whiteboards)).catch(console.error);
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createWhiteboard({ title: title.trim(), board_type: boardType });
    setTitle('');
    setBoardType('sticky');
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
            <div className="board-type-picker" style={{ marginTop: '0.75rem' }}>
              <label className={`board-type-option${boardType === 'sticky' ? ' active' : ''}`}>
                <input type="radio" name="boardType" value="sticky" checked={boardType === 'sticky'} onChange={() => setBoardType('sticky')} />
                <StickyNote size={18} />
                Sticky notes
              </label>
              <label className={`board-type-option${boardType === 'diagram' ? ' active' : ''}`}>
                <input type="radio" name="boardType" value="diagram" checked={boardType === 'diagram'} onChange={() => setBoardType('diagram')} />
                <GitBranch size={18} />
                Flow diagram
              </label>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>Create</button>
          </form>
        )}
        <div className="grid-2">
          {boards.map((b) => (
            <Link key={b.id} to={`/whiteboards/${b.id}`} className="card board-link">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {b.board_type === 'diagram' ? <GitBranch size={16} /> : <StickyNote size={16} />}
                <strong>{b.title}</strong>
              </div>
              <p className="muted">
                {b.board_type === 'diagram' ? 'Flow diagram' : `${b.note_count ?? 0} notes`}
                {' · '}{b.created_by_name}
              </p>
            </Link>
          ))}
          {!boards.length && <p className="muted">No whiteboards yet.</p>}
        </div>
      </div>
    </>
  );
}
