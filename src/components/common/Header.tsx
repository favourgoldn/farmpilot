import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  CloudCheck,
  Database,
  FileSpreadsheet,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    activeSection,
    openModal,
    isDemoMode,
    setIsDemoMode,
    resetDemoData,
    clearToEmptyData,
    farms,
    selectedFarm,
    selectedFarmId,
    setSelectedFarmId,
    setActiveSection,
    firebaseUser,
    userProfile,
    organization,
    isDataLoading,
    resendVerification,
    logout,
  } = useFarm();

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);

  const sectionTitles: Record<string, string> = {
    dashboard: 'Executive Dashboard',
    farms: 'Farms & Field Blocks',
    crops: 'Crop Production Cycle',
    poultry: 'Poultry Operations & Flocks',
    expenses: 'Expenses & Inventory',
    harvests: 'Harvest Yields & Offtake Sales',
    reports: 'Profit Intelligence & Financial Audits',
    tasks: 'Operational Calendar & Tasks',
    team: 'Farm Management Team',
    settings: 'Farm Settings & Configuration',
  };

  const currentFarmName = selectedFarm?.name || organization?.name || farms[0]?.name || 'Commercial Farm';
  const currentFarmType = selectedFarm?.farmType || 'mixed';
  const displayName = userProfile?.displayName || firebaseUser?.displayName || 'Farm Manager';
  const email = firebaseUser?.email || userProfile?.email || 'manager@farm.ng';

  return (
    <>
      {/* Email Verification Alert Banner (if signed in and unverified) */}
      {firebaseUser && !firebaseUser.emailVerified && (
        <div className="bg-amber-500/15 border-b border-amber-500/25 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-950">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Your email (<strong>{email}</strong>) has not been verified yet. Check your inbox to
              confirm ownership.
            </span>
          </div>
          <button
            onClick={() => resendVerification()}
            className="font-semibold text-amber-900 underline hover:text-amber-950 shrink-0"
          >
            Resend Verification Email
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-[#fafaf7] border-b border-[#181a19]/10 px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Hamburger (mobile) + Breadcrumbs & Farm Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-1.5 sm:p-2 text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#181a19]/5 rounded-lg transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Farm Selector Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setIsFarmDropdownOpen(!isFarmDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#181a19] bg-white hover:bg-[#fafaf7] border border-[#181a19]/15 rounded-lg transition-all shadow-2xs max-w-[160px] sm:max-w-[240px] truncate"
                title="Switch active farm estate"
              >
                <span className="truncate">{currentFarmName}</span>
                <span className="text-[9px] px-1 py-0.2 rounded-xs bg-[#16422b]/10 text-[#16422b] font-mono capitalize shrink-0">
                  {currentFarmType}
                </span>
                <ChevronDown className="w-3 h-3 text-[#181a19]/40 shrink-0" />
              </button>

              {isFarmDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#181a19]/10 p-2 z-50 animate-in fade-in zoom-in-95"
                  onClick={() => setIsFarmDropdownOpen(false)}
                >
                  <div className="p-2 border-b border-[#181a19]/5 text-xs">
                    <p className="font-semibold text-[#181a19]">Active Farm Estate</p>
                    <p className="text-[#181a19]/60 text-[11px] mt-0.5">
                      Switch between your crop, poultry, and mixed operations.
                    </p>
                  </div>
                  <div className="p-1 max-h-48 overflow-y-auto space-y-1">
                    {farms.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFarmId(f.id)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          (selectedFarm?.id || farms[0]?.id) === f.id
                            ? 'bg-[#16422b]/10 text-[#16422b] font-medium'
                            : 'hover:bg-[#fafaf7] text-[#181a19]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-medium truncate">{f.name}</p>
                          <p className="text-[10px] text-[#181a19]/50 truncate">
                            {f.state} &bull; {f.totalArea} {f.unit}
                          </p>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#181a19]/5 text-[#181a19]/70 font-mono capitalize shrink-0">
                          {f.farmType || 'mixed'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="pt-1.5 mt-1 border-t border-[#181a19]/5">
                    <button
                      onClick={() => openModal('add_farm')}
                      className="w-full text-center py-1.5 text-xs font-semibold text-[#16422b] hover:bg-[#16422b]/5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register New Farm Estate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#181a19]/60 truncate">
              <span aria-hidden="true" className="text-[#181a19]/30">/</span>
              <span className="font-medium text-[#16422b] truncate">
                {sectionTitles[activeSection] || 'Overview'}
              </span>
              {isDataLoading && (
                <span className="flex items-center gap-1 text-[11px] text-[#16422b]/80 ml-2 font-mono">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="hidden sm:inline">Syncing Firestore...</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions, Demo Switch & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Demo Data Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  isDemoMode
                    ? 'bg-amber-50/80 border-amber-300/80 text-amber-900 hover:bg-amber-100/70'
                    : 'bg-emerald-50/80 border-emerald-300/80 text-emerald-900 hover:bg-emerald-100/70'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isDemoMode ? 'Demo Data (Oyo)' : 'Cloud Firestore Active'}
                </span>
                <span className="sm:hidden">{isDemoMode ? 'Demo' : 'Cloud DB'}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isDemoDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#181a19]/10 p-2 z-40 animate-in fade-in zoom-in-95"
                  onClick={() => setIsDemoDropdownOpen(false)}
                >
                  <div className="p-2 border-b border-[#181a19]/5 text-xs">
                    <p className="font-semibold text-[#181a19]">Persistence Environment</p>
                    <p className="text-[#181a19]/60 mt-0.5">
                      Toggle between live Cloud Firestore multi-tenant sync and demonstration records.
                    </p>
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      onClick={clearToEmptyData}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-start gap-2.5 transition-colors ${
                        !isDemoMode ? 'bg-[#16422b]/5 text-[#16422b] font-medium' : 'hover:bg-[#fafaf7]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-medium text-[#181a19]">Live Cloud Database</p>
                        <p className="text-[11px] text-[#181a19]/50">
                          Connected to real Cloud Firestore under your organization.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={resetDemoData}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-start gap-2.5 transition-colors ${
                        isDemoMode ? 'bg-[#16422b]/5 text-[#16422b] font-medium' : 'hover:bg-[#fafaf7]'
                      }`}
                    >
                      <RefreshCw className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-medium text-[#181a19]">Load Demo Dataset</p>
                        <p className="text-[11px] text-[#181a19]/50">
                          Simulated outgrower metrics for Oyo commercial farm.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Button & Menu */}
            <div className="relative">
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isActionsOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#181a19]/10 p-1.5 z-40 animate-in fade-in zoom-in-95"
                  onClick={() => setIsActionsOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-medium text-[#181a19]/40 uppercase tracking-wider">
                    Quick Actions (Firestore)
                  </div>
                  {(currentFarmType === 'poultry' || currentFarmType === 'mixed') && (
                    <div className="mb-1 pb-1 border-b border-[#181a19]/5">
                      <button
                        onClick={() => setActiveSection('poultry')}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#16422b] bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex items-center justify-between"
                      >
                        <span>Poultry Operations Hub</span>
                        <span className="text-[10px] text-emerald-700 font-semibold uppercase">Open</span>
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => openModal('add_expense')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors flex items-center justify-between"
                  >
                    <span>Record Expense</span>
                    <span className="text-[10px] text-[#181a19]/40 font-mono">₦ Outflow</span>
                  </button>
                  <button
                    onClick={() => openModal('record_sale')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors flex items-center justify-between"
                  >
                    <span>Record Crop Sale</span>
                    <span className="text-[10px] text-[#16422b] font-mono">₦ Revenue</span>
                  </button>
                  <button
                    onClick={() => openModal('record_harvest')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors flex items-center justify-between"
                  >
                    <span>Log Harvest Yield</span>
                    <span className="text-[10px] text-[#181a19]/40">Bags/Tons</span>
                  </button>
                  <button
                    onClick={() => openModal('add_crop')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors"
                  >
                    Register Planted Crop
                  </button>
                  <button
                    onClick={() => openModal('add_field')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors flex items-center justify-between"
                  >
                    <span>Delineate Field Block</span>
                    <span className="text-[10px] text-[#16422b]/60">Plot/Acre</span>
                  </button>
                  <button
                    onClick={() => openModal('add_farm')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors flex items-center justify-between"
                  >
                    <span>Register Farm Estate</span>
                    <span className="text-[10px] text-[#181a19]/40">Estate</span>
                  </button>
                  <button
                    onClick={() => openModal('add_season')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors flex items-center justify-between"
                  >
                    <span>Plan Crop Season</span>
                    <span className="text-[10px] text-amber-600">Season</span>
                  </button>
                  <button
                    onClick={() => openModal('add_purchase')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors flex items-center justify-between"
                  >
                    <span>Create Purchase Order</span>
                    <span className="text-[10px] text-[#16422b] font-mono">PO</span>
                  </button>
                  <button
                    onClick={() => openModal('add_supplier')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors flex items-center justify-between"
                  >
                    <span>Register Supplier</span>
                    <span className="text-[10px] text-[#181a19]/40">Vendor</span>
                  </button>
                  <button
                    onClick={() => openModal('add_stock_movement')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors flex items-center justify-between"
                  >
                    <span>Log Stock Movement</span>
                    <span className="text-[10px] text-blue-600">Stock</span>
                  </button>
                  <button
                    onClick={() => openModal('add_receipt')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors flex items-center justify-between"
                  >
                    <span>Store Receipt Voucher</span>
                    <span className="text-[10px] text-[#16422b]/60">Voucher</span>
                  </button>
                  <button
                    onClick={() => openModal('create_task')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#181a19] hover:bg-[#fafaf7] transition-colors"
                  >
                    Create Field Task
                  </button>
                </div>
              )}
            </div>

            {/* User Profile avatar & dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#181a19]/5 transition-colors"
                aria-label="User account menu"
              >
                <img
                  src={firebaseUser?.photoURL || '/src/assets/images/avatar_farm_manager_1792508337787.jpg'}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-[#16422b]/20"
                />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#181a19]/10 p-1.5 z-40 animate-in fade-in zoom-in-95"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <div className="px-3 py-2.5 border-b border-[#181a19]/5">
                    <p className="text-xs font-semibold text-[#181a19] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#181a19]/50 truncate">{email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#16422b] font-medium">
                        {userProfile?.role?.toUpperCase() || 'MANAGER'}
                      </span>
                      <span className="text-[10px] text-[#181a19]/40">·</span>
                      <span className="text-[10px] text-[#181a19]/60 font-mono">
                        {organization?.name || 'Commercial Farm'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
