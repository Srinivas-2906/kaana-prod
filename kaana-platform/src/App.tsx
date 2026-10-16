import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { IndustryProvider } from './context/IndustryContext';
import { UltimateBackground } from './components/UltimateBackground';
import { ScrollToHash } from './components/ScrollToHash';
import { TrackPageViews } from './components/TrackPageViews';
import { Analytics } from './components/Analytics';
import { Navbar } from './components/Navbar';
import { ProductNavbar } from './components/ProductNavbar';
import { Footer } from './components/Footer';
import { isProductShellPath } from './lib/appShell';
import { HomePage } from './pages/HomePage';
import { PricingPage } from './pages/PricingPage';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { IndustriesPage } from './pages/IndustriesPage';
import { PlatformPage } from './pages/PlatformPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AdminPage } from './pages/AdminPage';
import { AdminTenantPage } from './pages/AdminTenantPage';
import { OnboardingPage } from './pages/OnboardingPage';

function AppShell() {
  const location = useLocation();
  const productShell = isProductShellPath(location.pathname);
  const authRoute = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    document.documentElement.setAttribute('data-product', 'botiq');
  }, []);

  const siteClass = ['site', productShell && 'site--product', authRoute && 'auth-route'].filter(Boolean).join(' ');

  return (
    <>
      <ScrollToHash />
      <TrackPageViews />
      <Analytics />
      <UltimateBackground />
      <div className={siteClass}>
        {productShell ? <ProductNavbar /> : <Navbar />}
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/tenants/:id" element={<AdminTenantPage />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/industries" element={<IndustriesPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
        {!productShell && <Footer />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <IndustryProvider>
        <AppShell />
      </IndustryProvider>
    </ThemeProvider>
  );
}
