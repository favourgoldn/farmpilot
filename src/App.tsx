import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import React, { useState } from 'react';
import { AuthScreens } from './components/auth/AuthScreens';
import { Header } from './components/common/Header';
import { QuickActionModal } from './components/common/QuickActionModal';
import { Sidebar } from './components/common/Sidebar';
import { CropManagementView } from './components/crops/CropManagementView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ExpensesInventoryView } from './components/expenses/ExpensesInventoryView';
import { FarmsFieldsView } from './components/farms/FarmsFieldsView';
import { HarvestSalesView } from './components/harvest/HarvestSalesView';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { PoultryManagementView } from './components/poultry/PoultryManagementView';
import { ProfitReportsView } from './components/profit/ProfitReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { TasksCalendarView } from './components/tasks/TasksCalendarView';
import { TeamView } from './components/team/TeamView';
import { FarmProvider, useFarm } from './context/FarmContext';

const AppContent: React.FC = () => {
  const { currentView, activeSection, toasts, dismissToast } = useFarm();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Routing Views
  if (currentView === 'landing') {
    return <LandingPage />;
  }

  if (currentView === 'signin') {
    return <AuthScreens mode="signin" />;
  }

  if (currentView === 'signup') {
    return <AuthScreens mode="signup" />;
  }

  if (currentView === 'onboarding') {
    return <OnboardingFlow />;
  }

  // Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col lg:flex-row text-[#181a19] antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeSection === 'dashboard' && <DashboardView />}
          {activeSection === 'farms' && <FarmsFieldsView />}
          {activeSection === 'crops' && <CropManagementView />}
          {activeSection === 'poultry' && <PoultryManagementView />}
          {activeSection === 'expenses' && <ExpensesInventoryView />}
          {activeSection === 'harvests' && <HarvestSalesView />}
          {activeSection === 'reports' && <ProfitReportsView />}
          {activeSection === 'tasks' && <TasksCalendarView />}
          {activeSection === 'team' && <TeamView />}
          {activeSection === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Reusable Action Modals */}
      <QuickActionModal />

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#181a19] text-white p-3.5 rounded-xl shadow-lg border border-white/10 flex items-start gap-3 text-xs animate-in slide-in-from-bottom duration-200"
          >
            {toast.type === 'success' && (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            {(toast.type === 'info' || toast.type === 'warning') && (
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white/95">{toast.title}</p>
              {toast.message && <p className="text-white/70 text-[11px] mt-0.5">{toast.message}</p>}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-white/40 hover:text-white p-0.5 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FarmProvider>
      <AppContent />
    </FarmProvider>
  );
}
