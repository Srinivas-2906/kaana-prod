import { Link } from 'react-router-dom';
import { PublicShell } from '../components/PublicShell';

function FinanceMockup() {
  return (
    <div className="landing-mockup card">
      <div className="landing-mockup-header">
        <span className="landing-mockup-dot" style={{ background: '#ef4444' }} />
        <span className="landing-mockup-dot" style={{ background: '#eab308' }} />
        <span className="landing-mockup-dot" style={{ background: '#22c55e' }} />
        <span className="muted" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>Project finance</span>
      </div>
      <div className="landing-mockup-grid">
        <div className="landing-mockup-stat">
          <div className="muted">Accounting break-even</div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>Day 142</div>
        </div>
        <div className="landing-mockup-stat">
          <div className="muted">Economic break-even</div>
          <div className="stat-value" style={{ fontSize: '1.25rem', color: '#2563eb' }}>Day 198</div>
        </div>
        <div className="landing-mockup-stat">
          <div className="muted">Partner exposure</div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>₹4.2L</div>
        </div>
        <div className="landing-mockup-stat">
          <div className="muted">Month net</div>
          <div className="stat-value" style={{ fontSize: '1.25rem', color: '#16a34a' }}>+₹86K</div>
        </div>
      </div>
      <div className="landing-mockup-chart">
        <div className="landing-mockup-bar" style={{ height: '40%' }} />
        <div className="landing-mockup-bar" style={{ height: '55%' }} />
        <div className="landing-mockup-bar" style={{ height: '48%' }} />
        <div className="landing-mockup-bar accent" style={{ height: '72%' }} />
        <div className="landing-mockup-bar" style={{ height: '65%' }} />
        <div className="landing-mockup-bar" style={{ height: '80%' }} />
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <PublicShell>
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">For founders &amp; small teams</p>
          <h1>Track projects, finances, and partner equity in one place</h1>
          <p className="landing-lead">
            Kaana Tracker combines work management with a canonical financial engine — accounting break-even,
            economic break-even with capital adjustment, and transparent partner funding.
          </p>
          <div className="landing-hero-cta">
            <Link to="/sign-up" className="btn btn-primary btn-lg">Start tracking</Link>
            <Link to="/login" className="btn btn-ghost btn-lg">Sign in</Link>
          </div>
        </div>
        <FinanceMockup />
      </section>

      <section className="landing-section">
        <h2>The problem</h2>
        <p className="landing-section-lead">
          Spreadsheets split work from money. Generic trackers ignore how founders actually fund projects —
          personal cards, uneven contributions, and the real cost of capital.
        </p>
        <div className="landing-problem-grid">
          <div className="card">
            <h3>Scattered context</h3>
            <p className="muted">Tasks in one tool, expenses in another, partner IOUs in a chat thread.</p>
          </div>
          <div className="card">
            <h3>False break-even</h3>
            <p className="muted">Revenue minus expenses ignores the time value of money partners put in.</p>
          </div>
          <div className="card">
            <h3>No shared truth</h3>
            <p className="muted">Everyone sees different numbers because funding sources aren&apos;t tracked.</p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-alt">
        <h2>What you get</h2>
        <div className="landing-capabilities">
          <div className="card">
            <h3>Project workspace</h3>
            <p className="muted">Board, plan, discussions, whiteboards — everything tied to a project.</p>
          </div>
          <div className="card">
            <h3>Canonical ledger</h3>
            <p className="muted">Income, expenses, capital contributions, reimbursements — one engine.</p>
          </div>
          <div className="card">
            <h3>Financial dashboard</h3>
            <p className="muted">Accounting and economic break-even, trajectory, and partner exposure per project.</p>
          </div>
          <div className="card">
            <h3>Team invites</h3>
            <p className="muted">GitHub-style email invites with roles — viewers, contributors, managers.</p>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>Two kinds of break-even</h2>
        <div className="landing-breakeven-grid">
          <div className="card">
            <h3>Accounting break-even</h3>
            <p className="muted">
              When cumulative revenue covers cumulative expenses — the classic P&amp;L view.
            </p>
          </div>
          <div className="card landing-highlight">
            <h3>Economic break-even</h3>
            <p className="muted">
              Adjusts for capital contributed by partners using your chosen rate. Shows when the project
              truly pays back the cost of money — not just the ledger.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-alt">
        <h2>Partner transparency</h2>
        <p className="landing-section-lead">
          Tag who paid — company account or partner personal funds. The engine tracks exposure and
          reimbursements so everyone sees the same picture.
        </p>
      </section>

      <section className="landing-section landing-calculator-cta">
        <div className="card landing-calculator-card">
          <h2>Try the break-even calculator</h2>
          <p className="muted">
            Model accounting vs economic break-even with your own assumptions. Sign in to run simulations
            with the same engine that powers project dashboards.
          </p>
          <Link to="/login?redirect_url=/calculator" className="btn btn-primary">Open calculator</Link>
        </div>
      </section>

      <section className="landing-final-cta">
        <h2>Ready to track what matters?</h2>
        <p className="muted">Create your first project in minutes — finance setup is built in.</p>
        <Link to="/sign-up" className="btn btn-primary btn-lg">Get started free</Link>
      </section>
    </PublicShell>
  );
}
