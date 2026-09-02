import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../components/onboarding/OnboardingLayout';
import { ShareProjectContent } from '../components/ProjectShareDialog';
import {
  completeOnboarding,
  createProject,
  createTransaction,
  fetchMe,
  fetchProject,
  updateOnboardingProgress,
  updateProjectFinancialSettings,
} from '../lib/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#14b8a6'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

type OpeningEntry = {
  description: string;
  amount: string;
  ledger_type: 'expense' | 'income' | 'capital_contribution';
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');

  // Step 2 — project create
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [currency, setCurrency] = useState('INR');
  const [financialStartDate, setFinancialStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [creating, setCreating] = useState(false);

  // Step 3 — finance
  const [economicEnabled, setEconomicEnabled] = useState(true);
  const [capitalRate, setCapitalRate] = useState('10');
  const [savingFinance, setSavingFinance] = useState(false);

  // Step 5 — opening entries
  const [entries, setEntries] = useState<OpeningEntry[]>([
    { description: '', amount: '', ledger_type: 'expense' },
  ]);
  const [savingEntries, setSavingEntries] = useState(false);

  // Step 6 — complete
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchMe()
      .then((r) => {
        if (!r.user.needsOnboarding) {
          navigate('/', { replace: true });
          return;
        }
        if (r.user.onboardingProjectId) {
          setProjectId(r.user.onboardingProjectId);
          fetchProject(r.user.onboardingProjectId)
            .then((p) => setProjectName(p.project.name))
            .catch(() => {});
          setStep(3);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load profile');
        setLoading(false);
      });
  }, []);

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    if (creating || projectId) {
      setStep(3);
      return;
    }
    setError('');
    setCreating(true);
    try {
      const { project } = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      await updateProjectFinancialSettings(project.id, {
        currency,
        financial_start_date: financialStartDate,
      });
      await updateOnboardingProgress({ onboarding_project_id: project.id });
      setProjectId(project.id);
      setProjectName(project.name);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveFinance(advance = true) {
    if (!projectId) return;
    setError('');
    setSavingFinance(true);
    try {
      const rate = parseFloat(capitalRate) / 100;
      await updateProjectFinancialSettings(projectId, {
        economic_break_even_enabled: economicEnabled ? 1 : 0,
        capital_adjustment_rate: economicEnabled ? rate : null,
      });
      if (advance) setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save finance settings');
    } finally {
      setSavingFinance(false);
    }
  }

  async function handleSaveEntries(advance = true) {
    if (!projectId) return;
    setError('');
    setSavingEntries(true);
    try {
      const valid = entries.filter((en) => en.description.trim() && en.amount.trim());
      for (const en of valid) {
        await createTransaction({
          project_id: projectId,
          description: en.description.trim(),
          amount: parseFloat(en.amount),
          ledger_type: en.ledger_type,
          type: en.ledger_type === 'capital_contribution' ? 'capital_contribution' : en.ledger_type,
          transaction_date: financialStartDate,
          currency,
        });
      }
      if (advance) setStep(6);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entries');
    } finally {
      setSavingEntries(false);
    }
  }

  async function handleComplete() {
    if (!projectId) return;
    setError('');
    setCompleting(true);
    try {
      await completeOnboarding();
      navigate(`/projects/${projectId}/finance`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="onboarding-shell">
        <p className="muted" style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
      </div>
    );
  }

  // Redirect handled by fetchMe — if already complete, send to hub
  if (!projectId && step > 2 && step < 6) {
    // edge case: lost project id
  }

  if (step === 1) {
    return (
      <OnboardingLayout
        step={1}
        title="Welcome to Kaana Tracker"
        subtitle="Set up your first project with finance tracking built in. This takes about five minutes."
        footer={
          <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
            Get started
          </button>
        }
      >
        <ul className="onboarding-checklist">
          <li>Create your project and currency</li>
          <li>Configure economic break-even (optional)</li>
          <li>Invite partners (optional)</li>
          <li>Add opening balances (optional)</li>
        </ul>
      </OnboardingLayout>
    );
  }

  if (step === 2) {
    return (
      <OnboardingLayout
        step={2}
        title="Create your project"
        subtitle="Every workspace starts with one project. You can add more later."
        onBack={() => setStep(1)}
        footer={
          <button
            type="submit"
            form="onboarding-project-form"
            className="btn btn-primary"
            disabled={creating || !name.trim()}
          >
            {creating ? 'Creating…' : projectId ? 'Continue' : 'Create project'}
          </button>
        }
      >
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <form id="onboarding-project-form" onSubmit={handleCreateProject}>
          <label className="muted">Project name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Startup"
            disabled={Boolean(projectId)}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
          <label className="muted">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            disabled={Boolean(projectId)}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
          <label className="muted">Color</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                disabled={Boolean(projectId)}
                onClick={() => setColor(c)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: c,
                  border: color === c ? '2px solid #0f172a' : '2px solid transparent',
                  cursor: projectId ? 'default' : 'pointer',
                }}
              />
            ))}
          </div>
          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="muted">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={Boolean(projectId)}
                style={{ width: '100%' }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="muted">Financial start date</label>
              <input
                type="date"
                value={financialStartDate}
                onChange={(e) => setFinancialStartDate(e.target.value)}
                disabled={Boolean(projectId)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </form>
      </OnboardingLayout>
    );
  }

  if (step === 3) {
    return (
      <OnboardingLayout
        step={3}
        title="Financial setup"
        subtitle="Enable economic break-even to account for the cost of partner capital."
        onBack={() => setStep(2)}
        showSkip
        onSkip={() => setStep(4)}
        footer={
          <button
            type="button"
            className="btn btn-primary"
            disabled={savingFinance}
            onClick={() => handleSaveFinance(true)}
          >
            {savingFinance ? 'Saving…' : 'Continue'}
          </button>
        }
      >
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={economicEnabled}
            onChange={(e) => setEconomicEnabled(e.target.checked)}
          />
          Enable economic break-even
        </label>
        {economicEnabled && (
          <>
            <label className="muted">Capital adjustment rate (% per year)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={capitalRate}
              onChange={(e) => setCapitalRate(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <p className="muted" style={{ fontSize: '0.875rem' }}>
              Applied to partner capital contributions over time. Day 365 from your start date is used as the
              target horizon in summaries.
            </p>
          </>
        )}
      </OnboardingLayout>
    );
  }

  if (step === 4 && projectId) {
    return (
      <OnboardingLayout
        step={4}
        title="Invite partners"
        subtitle="Collaborators receive an email invite — like GitHub."
        onBack={() => setStep(3)}
        showSkip
        onSkip={() => setStep(5)}
        footer={
          <button type="button" className="btn btn-primary" onClick={() => setStep(5)}>
            Continue
          </button>
        }
      >
        <ShareProjectContent
          projectId={projectId}
          projectName={projectName || 'Your project'}
        />
      </OnboardingLayout>
    );
  }

  if (step === 5 && projectId) {
    return (
      <OnboardingLayout
        step={5}
        title="Opening entries"
        subtitle="Optional starting expenses, income, or capital contributions."
        onBack={() => setStep(4)}
        showSkip
        onSkip={() => setStep(6)}
        footer={
          <button
            type="button"
            className="btn btn-primary"
            disabled={savingEntries}
            onClick={() => handleSaveEntries(true)}
          >
            {savingEntries ? 'Saving…' : 'Continue'}
          </button>
        }
      >
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        {entries.map((en, idx) => (
          <div key={idx} className="form-row" style={{ marginBottom: '0.75rem' }}>
            <select
              value={en.ledger_type}
              onChange={(e) => {
                const next = [...entries];
                next[idx] = { ...en, ledger_type: e.target.value as OpeningEntry['ledger_type'] };
                setEntries(next);
              }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="capital_contribution">Capital contribution</option>
            </select>
            <input
              placeholder="Description"
              value={en.description}
              onChange={(e) => {
                const next = [...entries];
                next[idx] = { ...en, description: e.target.value };
                setEntries(next);
              }}
              style={{ flex: 2 }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={en.amount}
              onChange={(e) => {
                const next = [...entries];
                next[idx] = { ...en, amount: e.target.value };
                setEntries(next);
              }}
              style={{ flex: 1 }}
            />
          </div>
        ))}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setEntries([...entries, { description: '', amount: '', ledger_type: 'expense' }])}
        >
          + Add row
        </button>
      </OnboardingLayout>
    );
  }

  if (step === 6 && projectId) {
    return (
      <OnboardingLayout
        step={6}
        title="You're all set"
        subtitle="Your project is ready. Explore the finance dashboard or run what-if scenarios."
        onBack={() => setStep(5)}
        footer={
          <button
            type="button"
            className="btn btn-primary"
            disabled={completing}
            onClick={handleComplete}
          >
            {completing ? 'Finishing…' : 'Open project finance'}
          </button>
        }
      >
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <p>
          <Link to={`/calculator?projectId=${projectId}`} className="btn btn-ghost">
            Try break-even calculator with this project
          </Link>
        </p>
      </OnboardingLayout>
    );
  }

  return <Navigate to="/onboarding" replace />;
}
