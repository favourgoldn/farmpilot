import {
  BarChart3,
  CalendarCheck,
  ChevronDown,
  Database,
  Egg,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  Plus,
  Receipt,
  Settings,
  ShoppingBag,
  Sprout,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { AppSection, useFarm } from '../../context/FarmContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: AppSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeSection,
    setActiveSection,
    fields,
    crops,
    tasks,
    flocks,
    isDemoMode,
    farms,
    selectedFarm,
    selectedFarmId,
    setSelectedFarmId,
    openModal,
    setCurrentView,
  } = useFarm();

  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);

  const activeTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const currentFarmType = selectedFarm?.farmType || 'mixed';

  // Build navigation items based on current farm type
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'farms',
      label: currentFarmType === 'poultry' ? 'Farms & Housing' : 'Farms & Fields',
      icon: MapPin,
      badgeCount: currentFarmType === 'poultry' ? undefined : fields.length,
    },
  ];

  // Include Crop Management for crop and mixed farms
  if (currentFarmType === 'crop' || currentFarmType === 'mixed') {
    navItems.push({
      id: 'crops',
      label: 'Crop Management',
      icon: Sprout,
      badgeCount: crops.length,
    });
  }

  // Include Poultry Management for poultry and mixed farms (or if flocks exist)
  if (currentFarmType === 'poultry' || currentFarmType === 'mixed' || flocks.length > 0) {
    navItems.push({
      id: 'poultry',
      label: 'Poultry Management',
      icon: Egg,
      badgeCount: flocks.length,
    });
  }

  // Shared operational sections
  navItems.push(
    { id: 'expenses', label: 'Expenses & Inventory', icon: Receipt },
    {
      id: 'harvests',
      label: currentFarmType === 'poultry' ? 'Offtake & Produce Sales' : 'Harvest & Sales',
      icon: ShoppingBag,
    },
    { id: 'reports', label: 'Profit & Reports', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks & Calendar', icon: CalendarCheck, badgeCount: activeTasksCount },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  );

  const handleSelect = (section: AppSection) => {
    setActiveSection(section);
    onCloseMobile();
  };

  const handleSelectFarm = (farmId: string) => {
    setSelectedFarmId(farmId);
    setIsFarmDropdownOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#143826] text-white">
      {/* Brand Zone */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2.5 text-left group"
          title="Return to marketing homepage"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap block leading-tight">
              FarmPilot
            </span>
            <span className="text-[10px] text-white/50 block font-normal tracking-wide">
              Smart Farm Intelligence
            </span>
          </div>
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-white/40 uppercase tracking-wider flex items-center justify-between">
          <span>Workspace Navigation</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-emerald-300 font-mono capitalize">
            {currentFarmType} farm
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-white font-semibold shadow-xs border border-emerald-400/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-400' : 'text-white/50'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-xs ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Farm Switcher & Environment Marker */}
      <div className="p-3.5 border-t border-white/10 bg-black/15 relative">
        <div className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Active Farm Estate</span>
          <button
            onClick={() => {
              openModal('add_farm');
              onCloseMobile();
            }}
            className="text-[10px] text-emerald-300 hover:text-emerald-200 flex items-center gap-0.5"
            title="Register new farm"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>

        {/* Farm Selector Button */}
        <div className="relative">
          <button
            onClick={() => setIsFarmDropdownOpen(!isFarmDropdownOpen)}
            className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {selectedFarm?.name || farms[0]?.name || 'Commercial Farm'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-white/50">
                  {selectedFarm?.state || farms[0]?.state || 'Nigeria'}
                </span>
                <span className="text-[9px] px-1 rounded-sm bg-emerald-500/20 text-emerald-300 font-mono capitalize">
                  {selectedFarm?.farmType || 'mixed'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0" />
          </button>

          {/* Dropdown Menu for Switching Farms */}
          {isFarmDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#1a4731] border border-white/15 rounded-xl shadow-xl p-1.5 z-50 text-xs">
              <div className="px-2 py-1 text-[10px] text-white/50 font-semibold uppercase">
                Switch Farm
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {farms.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFarm(f.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                      (selectedFarm?.id || farms[0]?.id) === f.id
                        ? 'bg-emerald-500/30 text-white font-medium border border-emerald-400/30'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{f.name}</p>
                      <p className="text-[10px] text-white/50 truncate">
                        {f.state} &bull; {f.totalArea} {f.unit}
                      </p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-white/10 text-emerald-300 shrink-0 ml-1.5 capitalize font-mono">
                      {f.farmType || 'mixed'}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setIsFarmDropdownOpen(false);
                  openModal('add_farm');
                  onCloseMobile();
                }}
                className="w-full mt-1 pt-1 border-t border-white/10 text-center py-1.5 text-[11px] text-emerald-300 hover:text-white font-medium flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+ Register New Farm</span>
              </button>
            </div>
          )}
        </div>

        {isDemoMode && (
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              <span>Demo Mode</span>
            </span>
            <span className="text-[10px] text-amber-200/80">Oyo Demo Data</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-40 border-r border-[#181a19]/10 shadow-sm">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#181a19]/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
