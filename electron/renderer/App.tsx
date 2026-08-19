/**
 * Root application component — layout shell with header and page routing.
 * On the web build (outside Electron) the app boots to the marketing landing page;
 * on the Electron desktop app it boots straight to the audit dashboard.
 */

import { useState } from 'react';
import { Header } from './components/Header.js';
import { LandingPage } from './pages/LandingPage.js';
import { AuditPage } from './pages/AuditPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { useAuditStore } from './stores/audit-store.js';
import { getAPI } from './lib/ipc-client.js';

type View = 'landing' | 'audit' | 'history';

export function App() {
  const isDesktop = typeof window !== 'undefined' && Boolean(window.electronAPI);
  const [activeView, setActiveView] = useState<View>(isDesktop ? 'audit' : 'landing');
  const { url, result } = useAuditStore();

  const startAudit = (target: string) => {
    const store = useAuditStore.getState();
    store.startAudit(target);
    getAPI().runAudit({ url: target, options: {} });
    setActiveView('audit');
  };

  if (activeView === 'landing') {
    return <LandingPage onStart={startAudit} onOpenApp={() => setActiveView('audit')} />;
  }

  return (
    <div>
      <Header
        url={url}
        crawledPages={result?.crawledPages}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      {activeView === 'audit' ? <AuditPage /> : <HistoryPage onNavigateToAudit={() => setActiveView('audit')} />}
    </div>
  );
}