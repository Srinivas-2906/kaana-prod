import { PlanView } from '../components/PlanView';

export function PlanPage() {
  return (
    <>
      <header className="topbar">
        <h1 style={{ margin: 0, fontSize: '1.125rem' }}>Plan</h1>
      </header>
      <div className="page">
        <PlanView showProjectFilter showIdeaPool />
      </div>
    </>
  );
}
