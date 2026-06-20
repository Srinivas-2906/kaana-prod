import { useCallback, useState } from 'react';
import { AboutModal } from './components/AboutModal';
import { LoginGate } from './components/LoginGate';
import { MainTopbar } from './components/MainTopbar';
import { LivePreview } from './components/preview/LivePreview';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { AnalyticsView } from './components/views/AnalyticsView';
import { BotBuilderView } from './components/views/BotBuilderView';
import { ConversationsView } from './components/views/ConversationsView';
import { OverviewView } from './components/views/OverviewView';
import { SettingsView } from './components/views/SettingsView';
import type { ViewId } from './types';
import './App.css';
import './pro.css';

declare global {
  interface Window {
    sendPrompt?: (prompt: string) => void;
  }
}

export default function App() {
  const [view, setView] = useState<ViewId>('conversations');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: 'Chat assigned to you' });

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800);
  }, []);

  const handleTakeOver = useCallback(() => {
    showToast('Chat assigned to you');
  }, [showToast]);

  const handleViewCRM = useCallback(() => {
    const prompt = 'Show me how BotIQ connects to PropCRM for real estate lead management';
    if (typeof window.sendPrompt === 'function') {
      window.sendPrompt(prompt);
    } else {
      window.open('http://localhost:5173', '_blank');
    }
  }, []);

  const navigate = (id: string) => setView(id as ViewId);

  return (
    <LoginGate>
    <div className="app">
      <Sidebar active={view} onNavigate={navigate} onAbout={() => setAboutOpen(true)} />

      <main className="main-panel">
        {view !== 'conversations' && <MainTopbar view={view} />}
        <div className={`main-content view-${view}`}>
          {view === 'overview' && <OverviewView onNavigate={() => setView('conversations')} />}
          {view === 'conversations' && (
            <ConversationsView
              onTakeOver={handleTakeOver}
              onViewCRM={handleViewCRM}
              onNotify={showToast}
            />
          )}
          {view === 'builder' && <BotBuilderView />}
          {view === 'analytics' && <AnalyticsView />}
          {view === 'settings' && <SettingsView />}
        </div>
      </main>

      <LivePreview />

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
    </LoginGate>
  );
}
