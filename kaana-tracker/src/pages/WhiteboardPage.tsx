import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createWhiteboardNote, deleteWhiteboardNote, fetchWhiteboard, promoteNoteToWork,
  scheduleWhiteboardNote, updateWhiteboardNote,
} from '../lib/api';
import { todayISO } from '../lib/dates';
import type { Whiteboard, WhiteboardNote } from '../types';
import { NOTE_COLORS } from '../types';

export function WhiteboardPage() {
  const { id } = useParams<{ id: string }>();
  const boardId = Number(id);
  const navigate = useNavigate();
  const [whiteboard, setWhiteboard] = useState<Whiteboard | null>(null);
  const [notes, setNotes] = useState<WhiteboardNote[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  function load() {
    if (!boardId) return;
    fetchWhiteboard(boardId).then((r) => {
      setWhiteboard(r.whiteboard);
      setNotes(r.notes);
    }).catch(console.error);
  }

  useEffect(() => { load(); }, [boardId]);

  async function addNote() {
    const note = await createWhiteboardNote(boardId, {
      content: 'New idea',
      color: NOTE_COLORS[notes.length % NOTE_COLORS.length],
      pos_x: 40 + (notes.length % 4) * 220,
      pos_y: 40 + Math.floor(notes.length / 4) * 160,
    });
    setNotes((prev) => [...prev, note.note]);
  }

  async function saveNote(note: WhiteboardNote) {
    const updated = await updateWhiteboardNote(note.id, { content: draft });
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated.note : n)));
    setEditing(null);
  }

  async function setSchedule(note: WhiteboardNote, date: string) {
    const updated = await scheduleWhiteboardNote(note.id, date || null);
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated.note : n)));
  }

  async function promote(note: WhiteboardNote) {
    const date = note.scheduled_date || todayISO();
    const result = await promoteNoteToWork(note.id, { due_date: date, start_date: date });
    if (result.item) navigate(`/work/${result.item.id}`);
  }

  async function removeNote(noteId: number) {
    await deleteWhiteboardNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  if (!boardId) return null;

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/whiteboards" className="btn btn-ghost">← Boards</Link>
          <h1 style={{ margin: 0, fontSize: '1.125rem' }}>{whiteboard?.title || 'Whiteboard'}</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={addNote}>Add note</button>
      </header>
      <div className="whiteboard-canvas">
        {notes.map((note) => (
          <div
            key={note.id}
            className="sticky-note"
            style={{
              left: note.pos_x,
              top: note.pos_y,
              width: note.width,
              minHeight: note.height,
              background: note.color,
            }}
          >
            {editing === note.id ? (
              <form onSubmit={(e: FormEvent) => { e.preventDefault(); saveNote(note); }}>
                <textarea
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={4}
                  style={{ width: '100%', border: 'none', background: 'transparent', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Save</button>
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => { setEditing(note.id); setDraft(note.content); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(note.id); setDraft(note.content); } }}
                  style={{ whiteSpace: 'pre-wrap', cursor: 'text' }}
                >
                  {note.content}
                </div>
                <div className="note-schedule" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="date"
                    value={note.scheduled_date || ''}
                    onChange={(e) => setSchedule(note, e.target.value)}
                    title="Schedule on calendar"
                  />
                  {note.scheduled_date && (
                    <Link to={`/plan?date=${note.scheduled_date}`} className="note-plan-link">Plan</Link>
                  )}
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.125rem 0.375rem', fontSize: '0.6875rem' }} onClick={() => promote(note)}>→ Task</button>
                </div>
                <button type="button" className="note-delete" onClick={() => removeNote(note.id)}>×</button>
              </>
            )}
          </div>
        ))}
        {!notes.length && <p className="muted" style={{ padding: '1.5rem' }}>Click “Add note” to start brainstorming.</p>}
      </div>
    </>
  );
}
