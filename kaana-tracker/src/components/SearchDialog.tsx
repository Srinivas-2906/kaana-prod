import { FormEvent, useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Search } from 'lucide-react';

import { globalSearch } from '../lib/api';

import type { SearchResult } from '../types';

import { WORK_STATUSES, statusLabel } from '../types';



const KIND_LABELS: Record<string, string> = {

  work_item: 'Work item',

  project: 'Project',

  topic: 'Update',

  attachment: 'File',

  whiteboard: 'Board',

};



export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {

  const [q, setQ] = useState('');

  const [kind, setKind] = useState('');

  const [status, setStatus] = useState('');

  const [results, setResults] = useState<SearchResult[]>([]);

  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();



  useEffect(() => {

    if (!open) return undefined;

    inputRef.current?.focus();

    function onKey(e: KeyboardEvent) {

      if (e.key === 'Escape') onClose();

    }

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);

  }, [open, onClose]);



  useEffect(() => {

    if (!open) {

      setQ('');

      setKind('');

      setStatus('');

      setResults([]);

      return undefined;

    }

    const term = q.trim();

    const issueKey = /^[A-Za-z0-9]+-\d+$/.test(term);

    if (term.length < 2 && !issueKey) {

      setResults([]);

      return undefined;

    }

    const timer = window.setTimeout(() => {

      setLoading(true);

      globalSearch(term, {

        kind: kind || undefined,

        status: status || undefined,

      })

        .then((r) => setResults(r.results))

        .catch(() => setResults([]))

        .finally(() => setLoading(false));

    }, 250);

    return () => window.clearTimeout(timer);

  }, [q, kind, status, open]);



  if (!open) return null;



  function go(link: string) {

    onClose();

    navigate(link);

  }



  function onSubmit(e: FormEvent) {

    e.preventDefault();

    if (results[0]) go(results[0].link);

  }



  return (

    <div className="search-dialog-backdrop" onClick={onClose} role="presentation">

      <div className="search-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Search">

        <form onSubmit={onSubmit} className="search-dialog-input-row">

          <Search size={18} />

          <input

            ref={inputRef}

            value={q}

            onChange={(e) => setQ(e.target.value)}

            placeholder="Search work, projects, files… or PROJ-123"

            aria-label="Search"

          />

          <kbd className="search-kbd">Esc</kbd>

        </form>

        <div className="search-dialog-filters">

          <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Result type">

            <option value="">All types</option>

            <option value="work_item">Work items</option>

            <option value="project">Projects</option>

            <option value="topic">Updates</option>

            <option value="attachment">Files</option>

            <option value="whiteboard">Boards</option>

          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">

            <option value="">Any status</option>

            {WORK_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}

          </select>

        </div>

        <div className="search-dialog-results">

          {loading && <p className="muted">Searching…</p>}

          {!loading && q.trim().length >= 2 && !results.length && (

            <p className="muted">No results for “{q.trim()}”.</p>

          )}

          {!loading && q.trim().length < 2 && !/^[A-Za-z0-9]+-\d+$/.test(q.trim()) && (

            <p className="muted">Type at least 2 characters or an issue key like PROJ-12.</p>

          )}

          <ul className="search-result-list">

            {results.map((r) => (

              <li key={`${r.kind}-${r.id}`}>

                <button type="button" className="search-result-item" onClick={() => go(r.link)}>

                  <span className="search-result-kind">{KIND_LABELS[r.kind] || r.kind}</span>

                  <strong>{r.title}</strong>

                  {r.subtitle && <span className="muted">{r.subtitle}</span>}

                </button>

              </li>

            ))}

          </ul>

        </div>

      </div>

    </div>

  );

}


