import { CSSProperties, FormEvent, useState } from 'react';
import { createLabel, setWorkItemLabels } from '../lib/api';
import type { Label } from '../types';

export function LabelPicker({
  projectId,
  labels,
  selectedIds,
  workItemId,
  onChange,
  onLabelCreated,
  readOnly = false,
}: {
  projectId: number;
  labels: Label[];
  selectedIds: number[];
  workItemId: number;
  onChange: (labels: Label[]) => void;
  onLabelCreated?: (label: Label) => void;
  readOnly?: boolean;
}) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  async function toggleLabel(labelId: number) {
    if (readOnly) return;
    const next = selectedIds.includes(labelId)
      ? selectedIds.filter((id) => id !== labelId)
      : [...selectedIds, labelId];
    const result = await setWorkItemLabels(workItemId, next);
    onChange(result.labels);
  }

  async function onAddLabel(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = await createLabel(projectId, { name: newName.trim() });
    setNewName('');
    setAdding(false);
    onLabelCreated?.(created.label);
    const next = [...selectedIds, created.label.id];
    const updated = await setWorkItemLabels(workItemId, next);
    onChange(updated.labels);
  }

  return (
    <div className="label-picker">
      <div className="label-picker-chips">
        {labels.map((label) => {
          const active = selectedIds.includes(label.id);
          return (
            <button
              key={label.id}
              type="button"
              className={`label-chip${active ? ' label-chip-active' : ''}`}
              style={{ '--label-color': label.color } as CSSProperties}
              disabled={readOnly}
              onClick={() => toggleLabel(label.id)}
            >
              {label.name}
            </button>
          );
        })}
        {!readOnly && !adding && (
          <button type="button" className="label-chip label-chip-add" onClick={() => setAdding(true)}>
            + label
          </button>
        )}
      </div>
      {!readOnly && adding && (
        <form className="label-add-row" onSubmit={onAddLabel}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New label…" required />
          <button type="submit" className="btn btn-primary">Add</button>
          <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}
