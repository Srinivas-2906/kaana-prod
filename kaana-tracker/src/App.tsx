import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { isAuthenticated } from './lib/auth';
import { AppShell } from './components/AppShell';
import { LoginPage } from './pages/LoginPage';
import { HubPage } from './pages/HubPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectPage } from './pages/ProjectPage';
import { MyWorkPage } from './pages/MyWorkPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

function RequireAuth() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<HubPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id/:tab" element={<ProjectPage />} />
          <Route path="projects/:id" element={<Navigate to="overview" replace />} />
          <Route path="my-work" element={<MyWorkPage />} />
          <Route path="daybook" element={<PlaceholderPage title="Daybook" note="Cross-project daily diary — Phase M1." />} />
          <Route path="plan" element={<PlaceholderPage title="Plan" />} />
          <Route path="whiteboards" element={<PlaceholderPage title="Whiteboards" />} />
          <Route path="discussions" element={<PlaceholderPage title="Discussions" />} />
          <Route path="transactions" element={<PlaceholderPage title="Transactions" />} />
        </Route>
      </Route>
    </Routes>
  );
}
