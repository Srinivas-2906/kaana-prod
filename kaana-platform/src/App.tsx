import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { IndustryProvider } from './context/IndustryContext';
import { UltimateBackground } from './components/UltimateBackground';
import { ScrollToHash } from './components/ScrollToHash';
import { TrackPageViews } from './components/TrackPageViews';
import { Analytics } from './components/Analytics';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PricingPage } from './pages/PricingPage';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IndustriesPage } from './pages/IndustriesPage';
import { PlatformPage } from './pages/PlatformPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AdminPage } from './pages/AdminPage';
import { AdminTenantPage } from './pages/AdminTenantPage';
import { OnboardingPage } from './pages/OnboardingPage';

export default function App() {
  return (
    <ThemeProvider>
      <IndustryProvider>
        <ScrollToHash />
        <TrackPageViews />
        <Analytics />
        <UltimateBackground />
        <div className="site">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/tenants/:id" element={<AdminTenantPage />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/industries" element={<IndustriesPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
          <Footer />
        </div>
      </IndustryProvider>
    </ThemeProvider>
  );
}
