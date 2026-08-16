import { useState, useEffect } from 'react';
import { DataProvider, useData } from '@/context/DataContext';
import { AppShell } from '@/components/layout/AppShell';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { DashboardPage } from '@/pages/DashboardPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { MoneyPage } from '@/pages/MoneyPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { Page } from '@/types';

function AppContent() {
  const { loading, profile } = useData();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center animate-pulse">
            <span className="text-white font-display font-bold text-lg">D</span>
          </div>
          <p className="text-sm text-neutral-400">Loading your savings...</p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.onboarding_completed) {
    return <Onboarding />;
  }

  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage} profileName={profile.name}>
      {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
      {currentPage === 'goals' && <GoalsPage />}
      {currentPage === 'money' && <MoneyPage />}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'settings' && <SettingsPage />}
    </AppShell>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;
