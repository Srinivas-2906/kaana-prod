import { useState } from 'react';
import { FileText, GripVertical, Lightbulb, Plus, Trash2 } from 'lucide-react';
import type { WorkItemContentSection } from '../lib/workSections';
import { createCustomSection } from '../lib/workSections';

function sectionIcon(section: WorkItemContentSection) {
  if (section.builtin === 'description') return <FileText size={16} />;
  if (section.builtin === 'implementation_notes') return <Lightbulb size={16} />;
  return <FileText size={16} />;
}

export function WorkItemSections({
  sections,
  onChange,
  onSave,
}: {
  sections: WorkItemContentSection[];
  onChange: (sections: WorkItemContentSection[]) => void;
  onSave: (sections: WorkItemContentSection[]) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);

  function patchSection(id: string, patch: Partial<WorkItemContentSection>) {
    const next = sections.map((s) => (s.id === id ? { ...s, ...patch } : s));
    onChange(next);
    return next;
  }

  function reorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    const fromIdx = sections.findIndex((s) => s.id === fromId);
    const toIdx = sections.findIndex((s) => s.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...sections];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
    onSave(next);
  }

  function addSection() {
    const next = [...sections, createCustomSection(sections.length)];
    onChange(next);
    onSave(next);
  }

  function removeSection(id: string) {
    const section = sections.find((s) => s.id === id);
    if (!section || section.builtin) return;
    const next = sections.filter((s) => s.id !== id);
    onChange(next);
    onSave(next);
  }

  return (
    <div className="wi-sections-stack">
      {sections.map((section) => {
        const isDragging = dragId === section.id;
        const isDropTarget = dropId === section.id && dragId !== section.id;

        return (
          <section
            key={section.id}
            className={`wi-section wi-section-${section.accent}${isDragging ? ' wi-section-dragging' : ''}${isDropTarget ? ' wi-section-drop-target' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDropId(section.id);
            }}
            onDragLeave={() => {
              if (dropId === section.id) setDropId(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) reorder(dragId, section.id);
              setDragId(null);
              setDropId(null);
            }}
          >
            <div className="wi-section-toolbar">
              <button
                type="button"
                className="wi-section-drag"
                draggable
                aria-label="Drag to reorder"
                onDragStart={() => setDragId(section.id)}
                onDragEnd={() => {
                  setDragId(null);
                  setDropId(null);
                }}
              >
                <GripVertical size={16} />
              </button>

              <div className="wi-section-heading">
                <h3 className="wi-section-title">
                  {sectionIcon(section)}
                  <input
                    className="wi-section-title-input"
                    value={section.title}
                    onChange={(e) => patchSection(section.id, { title: e.target.value })}
                    onBlur={(e) => {
                      const title = e.target.value.trim() || section.title;
                      onSave(patchSection(section.id, { title }));
                    }}
                    aria-label="Section title"
                  />
                </h3>
                <p className="wi-section-hint">{section.hint}</p>
              </div>

              {!section.builtin && (
                <button
                  type="button"
                  className="wi-section-remove"
                  onClick={() => removeSection(section.id)}
                  aria-label="Remove section"
                  title="Remove section"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            <textarea
              className="wi-section-editor"
              rows={section.builtin === 'description' ? 5 : 4}
              placeholder={
                section.builtin === 'description'
                  ? 'Describe the idea, goal, or outcome you\'re going for…'
                  : section.builtin === 'implementation_notes'
                    ? 'Jot down the plan, links, or things to remember…'
                    : 'Start writing…'
              }
              value={section.content}
              onChange={(e) => patchSection(section.id, { content: e.target.value })}
              onBlur={(e) => {
                onSave(patchSection(section.id, { content: e.target.value }));
              }}
            />
          </section>
        );
      })}

      <button type="button" className="wi-add-section-btn" onClick={addSection}>
        <Plus size={16} />
        Add section
      </button>
    </div>
  );
}
