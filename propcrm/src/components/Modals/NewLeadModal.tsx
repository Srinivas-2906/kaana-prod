import { useEffect, useState } from 'react';
import type { Lead, Stage } from '../../types';
import { agentsList } from '../../data/mockData';
import { parseBudget } from '../../utils/format';

interface NewLeadModalProps {
  open: boolean;
  defaultStage?: Stage;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  nextId: number;
}

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  prop: '',
  budget: '',
  source: 'Walk-in',
  stage: 'new' as Stage,
  assignedAgent: 'Ravi Kapoor',
  note: '',
};

export function NewLeadModal({ open, defaultStage = 'new', onClose, onSave, nextId }: NewLeadModalProps) {
  const [form, setForm] = useState({ ...emptyForm, stage: defaultStage });

  useEffect(() => {
    if (open) setForm({ ...emptyForm, stage: defaultStage });
  }, [open, defaultStage]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const score = { new: 48, contacted: 58, site: 72, negotiation: 86 }[form.stage] + Math.floor(Math.random() * 8);
    const lead: Lead = {
      id: nextId,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      prop: form.prop.trim(),
      budget: form.budget.trim(),
      budgetNum: parseBudget(form.budget),
      stage: form.stage,
      score,
      scoreBreakdown: {
        engagement: Math.min(10, Math.round(score / 10)),
        budgetFit: Math.min(10, Math.round((score + 5) / 11)),
        timeline: Math.min(10, Math.round((score - 3) / 10)),
      },
      interest: 'Flat / apartment',
      source: form.source,
      followup: form.stage === 'new' ? 'Today' : 'Tomorrow',
      followupDate: new Date().toISOString().slice(0, 10),
      lastContacted: new Date().toISOString().slice(0, 10),
      daysInStage: 0,
      assignedAgent: form.assignedAgent,
      note: form.note.trim() || 'New lead added.',
      notes: [],
      documents: [],
      aiNextAction: form.stage === 'new' ? 'Schedule first callback within 2 hours' : 'Send property update email',
      stageEnteredAt: new Date().toISOString().slice(0, 10),
    };
    onSave(lead);
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h3>New lead</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prop">Property interest</label>
                <input id="prop" required value={form.prop} onChange={(e) => setForm({ ...form, prop: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="budget">Budget</label>
                <input id="budget" required value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="₹75L" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="source">Source</label>
                <select id="source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                  <option>Walk-in</option>
                  <option>99acres</option>
                  <option>MagicBricks</option>
                  <option>Housing.com</option>
                  <option>Referral</option>
                  <option>Instagram ad</option>
                  <option>LinkedIn</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="agent">Assigned agent</label>
                <select id="agent" value={form.assignedAgent} onChange={(e) => setForm({ ...form, assignedAgent: e.target.value })}>
                  {agentsList.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="stage">Stage</label>
              <select id="stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}>
                <option value="new">New enquiry</option>
                <option value="contacted">Contacted</option>
                <option value="site">Site visit</option>
                <option value="negotiation">Negotiation</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="note">Notes</label>
              <textarea id="note" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save lead</button>
          </div>
        </form>
      </div>
    </div>
  );
}
