import { Navigate, Outlet, Route, Routes, useSearchParams } from 'react-router-dom';
import { isAuthenticated } from './lib/auth';
import { AppShell } from './components/AppShell';
import { PostAuthGate } from './components/PostAuthGate';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HubPage } from './pages/HubPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectPage } from './pages/ProjectPage';
import { MyWorkPage } from './pages/MyWorkPage';
import { PlanPage } from './pages/PlanPage';
import { WhiteboardsPage } from './pages/WhiteboardsPage';
import { WhiteboardPage } from './pages/WhiteboardPage';
import { DiscussionsPage } from './pages/DiscussionsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { FinancialCalculatorPage } from './pages/FinancialCalculatorPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { WorkItemPage } from './pages/WorkItemPage';
import { ProjectDefaultRedirect } from './components/ProjectDefaultRedirect';

function RequireAuth() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RootEntry() {
  if (!isAuthenticated()) return <LandingPage />;
  return (
    <PostAuthGate>
      <AppShell>
        <HubPage />
      </AppShell>
    </PostAuthGate>
  );
}

function PlanProjectRedirect() {
  const [params] = useSearchParams();
  const projectId = params.get('projectId') || params.get('cluster_id');
  if (projectId) {
    const rest = new URLSearchParams(params);
    rest.delete('projectId');
    rest.delete('cluster_id');
    const qs = rest.toString();
    return <Navigate to={`/projects/${projectId}/plan${qs ? `?${qs}` : ''}`} replace />;
  }
  return <PlanPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootEntry />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/invite/:token" element={<AcceptInvitePage />} />
      <Route element={<RequireAuth />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<PostAuthGate />}>
          <Route element={<AppShell />}>
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id/:tab" element={<ProjectPage />} />
            <Route path="projects/:id" element={<ProjectDefaultRedirect />} />
            <Route path="my-work" element={<MyWorkPage />} />
            <Route path="work/:id" element={<WorkItemPage />} />
            <Route path="daybook" element={<Navigate to="/plan" replace />} />
            <Route path="plan" element={<PlanProjectRedirect />} />
            <Route path="whiteboards" element={<WhiteboardsPage />} />
            <Route path="whiteboards/:id" element={<WhiteboardPage />} />
            <Route path="discussions" element={<DiscussionsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="calculator" element={<FinancialCalculatorPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
