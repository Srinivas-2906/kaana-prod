import { FormEvent, useState } from 'react';
import { createJournalEntry } from '../lib/api';

export function JournalForm({
  date,
  projectId,
  onSaved,
}: {
  date: string;
  projectId?: number;
  onSaved: () => void;
}) {
  const [content, setContent] = useState('');
  const [blockers, setBlockers] = useState('');
  const [learnings, setLearnings] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createJournalEntry({
        entry_date: date,
        project_id: projectId || null,
        content,
        blockers: blockers || null,
        learnings: learnings || null,
        next_steps: nextSteps || null,
      });
      setContent('');
      setBlockers('');
      setLearnings('');
      setNextSteps('');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <form className="card journal-form" onSubmit={onSubmit}>
      <h3 style={{ marginTop: 0 }}>End-of-day reflection</h3>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <label>
        What moved today?
        <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={3} style={{ width: '100%' }} />
      </label>
      <div className="form-row" style={{ marginTop: '0.75rem' }}>
        <label style={{ flex: 1 }}>
          Blockers
          <input value={blockers} onChange={(e) => setBlockers(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label style={{ flex: 1 }}>
          Learnings
          <input value={learnings} onChange={(e) => setLearnings(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label style={{ flex: 1 }}>
          Next steps
          <input value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>
      <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>Save journal</button>
    </form>
  );
}
