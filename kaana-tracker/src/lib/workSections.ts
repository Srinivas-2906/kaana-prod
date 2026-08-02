import type { WorkItem, WorkItemContentSection } from '../types';

export type { WorkItemContentSection };

export const SECTION_ACCENTS: WorkItemContentSection['accent'][] = [
  'custom', 'purple', 'green', 'pink', 'teal',
];

export function parseContentSections(raw: unknown): WorkItemContentSection[] | null {
  if (!raw) return null;
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(parsed) || !parsed.length) return null;
  return parsed.filter((s) => s && typeof s.id === 'string' && typeof s.title === 'string');
}

export function defaultSectionsFromItem(item: WorkItem): WorkItemContentSection[] {
  const stored = parseContentSections(item.content_sections);
  if (stored) return stored;

  return [
    {
      id: 'description',
      title: 'The idea',
      hint: 'What is this about? Why does it matter?',
      content: item.description || '',
      accent: 'overview',
      builtin: 'description',
    },
    {
      id: 'implementation_notes',
      title: 'How to approach it',
      hint: 'Steps, tips, or resources to get there',
      content: item.implementation_notes || '',
      accent: 'notes',
      builtin: 'implementation_notes',
    },
  ];
}

export function sectionsToWorkItemPatch(sections: WorkItemContentSection[]) {
  const description = sections.find((s) => s.builtin === 'description')?.content ?? '';
  const implementation_notes = sections.find((s) => s.builtin === 'implementation_notes')?.content ?? '';
  return {
    content_sections: sections,
    description,
    implementation_notes,
  };
}

export function createCustomSection(index: number): WorkItemContentSection {
  return {
    id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: 'New section',
    hint: 'Capture notes, links, or anything useful here…',
    content: '',
    accent: SECTION_ACCENTS[index % SECTION_ACCENTS.length],
  };
}
