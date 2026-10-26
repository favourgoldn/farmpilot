import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Egg,
  Feather,
  Layers,
  MapPin,
  Package,
  Plus,
  Receipt,
  Scale,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Sprout,
  Syringe,
  TrendingDown,
  TrendingUp,
  Wallet,
  Wheat,
} from 'lucide-react';
import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { formatNaira, formatWeight } from '../../utils/finance';
import { CropProfitabilityChart } from '../charts/CropProfitabilityChart';
import { ExpenseBreakdownChart } from '../charts/ExpenseBreakdownChart';
import { RevenueExpensesChart } from '../charts/RevenueExpensesChart';

export const DashboardView: React.FC = () => {
  const {
    farms,
    fields,
    crops,
    expenses,
    harvests,
    sales,
    tasks,
    financialSummary,
    cropProfitability,
    selectedFarm,
    flocks,
    flockMovements,
    poultryHouses,
    feedInventory,
    feedConsumption,
    flockHealthRecords,
    eggProductionRecords,
    poultrySales,
    flockProfitability,
    isDemoMode,
    openModal,
    setActiveSection,
    toggleTaskStatus,
  } = useFarm();

  const currentFarmType = selectedFarm?.farmType || 'mixed';
  const activeFieldsCount = fields.filter((f) => f.status === 'active').length;
  const totalFieldArea = fields.reduce((sum, f) => sum + f.size, 0);
  const activeCropsCount = crops.filter((c) => c.activeStatus).length;

  // Poultry Metrics Computations
  const activeFlocks = flocks.filter((flock) => flock.status === 'active');
  const totalBirdsInFlocks = activeFlocks.reduce(
    (sum, flock) => sum + (flock.currentBirdCount ?? flock.initialBirdCount),
    0
  );
  const totalAcquiredBirds = activeFlocks.reduce(
    (sum, flock) => sum + flock.initialBirdCount,
    0
  );
  const totalMortalityBirds = activeFlocks.reduce((sum, flock) => {
    const flockMoves = flockMovements.filter(
      (m) => m.flockId === flock.id && (m.type === 'mortality' || m.type === 'cull')
    );
    return sum + flockMoves.reduce((s, m) => s + m.quantity, 0);
  }, 0);
  const overallMortalityRatePct =
    totalAcquiredBirds > 0 ? (totalMortalityBirds / totalAcquiredBirds) * 100 : 0;

  // Housing capacity
  const totalHousingCapacity = poultryHouses.reduce((sum, h) => sum + h.capacity, 0);
  const housingOccupancyPct =
    totalHousingCapacity > 0
      ? Math.min(100, (totalBirdsInFlocks / totalHousingCapacity) * 100)
      : 0;

  // Feed stock and low stock alerts
  const totalFeedStockKg = feedInventory.reduce((sum, f) => sum + (f.totalWeightKg ?? f.quantityBags * f.bagWeightKg), 0);
  const totalFeedBags = feedInventory.reduce((sum, f) => sum + f.quantityBags, 0);
  const lowFeedItems = feedInventory.filter(
    (f) => f.quantityBags <= f.reorderLevelBags || f.totalWeightKg < 500
  );

  // Daily / Weekly feed cost
  const recentFeedConsumption = feedConsumption.slice(0, 14);
  const totalFeedConsumedKg = feedConsumption.reduce((sum, fc) => sum + fc.quantityKg, 0);
  const totalFeedExpenseNgn = feedConsumption.reduce((sum, fc) => sum + (fc.calculatedCost || 0), 0);

  // Egg production & Laying rate
  const totalSaleableEggs = eggProductionRecords.reduce((sum, e) => sum + e.saleableEggs, 0);
  const totalEggCrates = eggProductionRecords.reduce((sum, e) => sum + e.cratesCount, 0);
  const layerFlocks = activeFlocks.filter((f) => f.poultryType === 'Layers');
  const totalLayerBirds = layerFlocks.reduce(
    (sum, f) => sum + (f.currentBirdCount ?? f.initialBirdCount),
    0
  );
  const averageLayingRatePct =
    eggProductionRecords.length > 0
      ? eggProductionRecords.reduce((sum, e) => sum + e.layingRatePercent, 0) /
        eggProductionRecords.length
      : 0;

  // Poultry sales revenue
  const totalPoultryRevenue = poultrySales.reduce((sum, ps) => sum + ps.totalAmount, 0);

  // Upcoming Health Tasks
  const upcomingVaccinations = flockHealthRecords
    .filter((h) => h.nextFollowUpDate && new Date(h.nextFollowUpDate) >= new Date())
    .slice(0, 3);

  const urgentTasks = tasks
    .filter((t) => t.status !== 'completed')
    .slice(0, 4);

  const recentTransactions = [
    ...sales.map((s) => ({
      id: s.id,
      type: 'sale' as const,
      title: `Sale: ${crops.find((c) => c.id === s.cropId)?.name || 'Crop Produce'}`,
      party: s.buyerName,
      date: s.date,
      amount: s.totalAmount,
      status: s.paymentStatus,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      type: 'expense' as const,
      title: e.description,
      party: e.vendor,
      date: e.date,
      amount: -e.amount,
      status: e.paymentStatus,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const isBlankState =
    sales.length === 0 &&
    expenses.length === 0 &&
    fields.length === 0 &&
    crops.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Demo Data Disclaimer Banner (if active) */}
      {isDemoMode && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="font-semibold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-sm shrink-0">
              Demo Data
            </span>
            <span className="text-amber-900/80">
              Showing simulated outgrower metrics for a 45-hectare commercial crop estate in Oyo
              State. All numbers and crop returns are for demonstration.
            </span>
          </div>
          <button
            onClick={() => openModal('add_expense')}
            className="text-amber-950 font-medium hover:underline shrink-0"
          >
            Record Your Real Expense &rarr;
          </button>
        </div>
      )}

      {/* Empty State Guided Card (if in Live Mode with 0 data) */}
      {isBlankState && (
        <div className="p-6 sm:p-8 bg-white border border-[#181a19]/10 rounded-2xl shadow-xs text-center">
          <div className="w-12 h-12 rounded-xl bg-[#16422b]/10 text-[#16422b] flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#181a19] tracking-tight">
            Welcome to Your Farm Intelligence Hub
          </h2>
          <p className="text-xs text-[#181a19]/60 max-w-lg mx-auto mt-1 mb-6">
            FarmPilot is ready for your genuine records. Follow these three quick steps to begin
            unlocking real net operating margins and input efficiency.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6 text-left">
            <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10">
              <span className="text-xs font-semibold text-[#16422b] block mb-1">01. Add Field</span>
              <p className="text-xs text-[#181a19]/70">
                Define your first field plot acreage and irrigation type.
              </p>
              <button
                onClick={() => openModal('add_field')}
                className="mt-3 text-xs font-semibold text-[#16422b] hover:underline"
              >
                + Create Field
              </button>
            </div>

            <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10">
              <span className="text-xs font-semibold text-[#16422b] block mb-1">02. Register Crop</span>
              <p className="text-xs text-[#181a19]/70">
                Link maize, cassava, or vegetables to that field block.
              </p>
              <button
                onClick={() => openModal('add_crop')}
                className="mt-3 text-xs font-semibold text-[#16422b] hover:underline"
              >
                + Register Crop
              </button>
            </div>

            <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10">
              <span className="text-xs font-semibold text-[#16422b] block mb-1">03. Log Inputs</span>
              <p className="text-xs text-[#181a19]/70">
                Record seed, fertilizer, or mechanization costs in Naira.
              </p>
              <button
                onClick={() => openModal('add_expense')}
                className="mt-3 text-xs font-semibold text-[#16422b] hover:underline"
              >
                + Record Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Sales Revenue */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Sales Revenue</span>
            <ShoppingBag className="w-4 h-4 text-[#16422b]" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-[#181a19] tracking-tight">
            {formatNaira(financialSummary.totalSalesRevenue)}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#181a19]/60">
            <span>Cash in Hand:</span>
            <span className="font-mono tabular-nums font-medium text-[#16422b]">
              {formatNaira(financialSummary.totalCashReceived)}
            </span>
          </div>
        </div>

        {/* 2. Total Operating Expenses */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Operating Expenses</span>
            <Receipt className="w-4 h-4 text-[#d97706]" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-[#181a19] tracking-tight">
            {formatNaira(financialSummary.totalOperatingExpenses)}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#181a19]/60">
            <span>Total Logged:</span>
            <span className="font-mono tabular-nums font-medium text-[#181a19]">
              {expenses.length} invoices
            </span>
          </div>
        </div>

        {/* 3. Net Operating Result */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Net Operating Result</span>
            {financialSummary.netOperatingResult >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#16422b]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div
            className={`text-lg font-bold font-mono tabular-nums tracking-tight ${
              financialSummary.netOperatingResult >= 0 ? 'text-[#16422b]' : 'text-rose-600'
            }`}
          >
            {financialSummary.netOperatingResult >= 0 ? '+' : ''}
            {formatNaira(financialSummary.netOperatingResult)}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#181a19]/60">
            <span>Operating Margin:</span>
            <span className="font-mono tabular-nums font-semibold text-[#181a19]">
              {financialSummary.operatingMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 4. Active Fields or Poultry Population */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>
              {currentFarmType === 'poultry'
                ? 'Flock Population'
                : currentFarmType === 'mixed'
                ? 'Cultivated & Birds'
                : 'Active Field Plots'}
            </span>
            {currentFarmType === 'poultry' ? (
              <Feather className="w-4 h-4 text-[#16422b]" />
            ) : (
              <MapPin className="w-4 h-4 text-[#16422b]" />
            )}
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-[#181a19] tracking-tight">
            {currentFarmType === 'poultry' ? (
              `${totalBirdsInFlocks.toLocaleString()} birds`
            ) : currentFarmType === 'mixed' ? (
              `${activeFieldsCount} plots · ${totalBirdsInFlocks.toLocaleString()} birds`
            ) : (
              `${activeFieldsCount} blocks`
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#181a19]/60">
            {currentFarmType === 'poultry' ? (
              <span>Pen Occupancy: <strong className="font-mono text-[#16422b]">{housingOccupancyPct.toFixed(0)}%</strong> ({totalHousingCapacity.toLocaleString()} cap)</span>
            ) : (
              <span>Cultivated Area: <strong className="font-mono text-[#181a19]">{totalFieldArea} ha</strong></span>
            )}
          </div>
        </div>

        {/* 5. Harvested Quantity or Egg Production */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>{currentFarmType === 'poultry' ? 'Egg Production' : 'Harvest Yield'}</span>
            {currentFarmType === 'poultry' ? (
              <Egg className="w-4 h-4 text-amber-600" />
            ) : (
              <Scale className="w-4 h-4 text-[#16422b]" />
            )}
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-[#181a19] tracking-tight">
            {currentFarmType === 'poultry' ? (
              `${totalEggCrates.toLocaleString()} crates`
            ) : (
              formatWeight(financialSummary.totalHarvestedKg)
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#181a19]/60">
            {currentFarmType === 'poultry' ? (
              <span>Laying Rate: <strong className="font-mono text-[#16422b]">{averageLayingRatePct.toFixed(1)}%</strong></span>
            ) : (
              <span>Unsold Stock: <strong className="font-mono text-[#181a19]">{formatWeight(financialSummary.unsoldInventoryKg)}</strong></span>
            )}
          </div>
        </div>

        {/* 6. Outstanding Customer Receivables */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Unpaid Invoices</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-amber-800 tracking-tight">
            {formatNaira(financialSummary.outstandingCustomerPayments)}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#181a19]/60">
            <span>Uncollected Debt</span>
          </div>
        </div>
      </div>

      {/* Quick Action Trigger Strip */}
      <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs">
          <span className="font-semibold text-[#181a19]">Quick Action Shortcuts</span>
          <span className="text-[#181a19]/50 ml-2 hidden md:inline">
            Fast entry shortcuts for daily ledger and livestock operations
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openModal('add_expense')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Add Expense</span>
          </button>

          {(currentFarmType === 'crop' || currentFarmType === 'mixed') && (
            <>
              <button
                onClick={() => openModal('add_crop')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-[#16422b]" />
                <span>Add Crop</span>
              </button>

              <button
                onClick={() => openModal('record_harvest')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-[#16422b]" />
                <span>Record Harvest</span>
              </button>
            </>
          )}

          {(currentFarmType === 'poultry' || currentFarmType === 'mixed' || flocks.length > 0) && (
            <button
              onClick={() => setActiveSection('poultry')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#16422b] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Egg className="w-3.5 h-3.5" />
              <span>Poultry Operations Hub</span>
            </button>
          )}

          <button
            onClick={() => openModal('record_sale')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Sale</span>
          </button>

          <button
            onClick={() => openModal('create_task')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#181a19]/70" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Poultry Enterprise Section for Poultry & Mixed Farms */}
      {(currentFarmType === 'poultry' || currentFarmType === 'mixed' || flocks.length > 0) && (
        <div className="bg-white border border-[#181a19]/10 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#181a19]/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-[#16422b] border border-emerald-200 rounded-md uppercase tracking-wider">
                  Poultry Enterprise Intelligence
                </span>
                <span className="text-xs text-[#181a19]/40">•</span>
                <span className="text-xs text-[#181a19]/60 font-medium">
                  {activeFlocks.length} Active {activeFlocks.length === 1 ? 'Flock' : 'Flocks'}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#181a19] tracking-tight">
                Flock Population, Feed Rations & Productivity
              </h3>
            </div>
            <button
              onClick={() => setActiveSection('poultry')}
              className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Manage Flocks & Pens</span>
              <ArrowDownRight className="w-3.5 h-3.5 -rotate-90" />
            </button>
          </div>

          {/* Low Feed Stock Warnings */}
          {lowFeedItems.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Feed Inventory Reorder Warning</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {lowFeedItems.map((f) => `${f.feedName} (${f.totalWeightKg} kg / ${f.quantityBags.toFixed(1)} bags left)`).join(', ')}. Order replenishment to avoid feed disruption.
                </p>
              </div>
            </div>
          )}

          {/* 4-Card Poultry Operational Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Live Bird Count */}
            <div className="p-3.5 rounded-xl bg-[#fafaf7] border border-[#181a19]/10">
              <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
                <span>Active Flock Size</span>
                <Feather className="w-4 h-4 text-[#16422b]" />
              </div>
              <div className="text-lg font-bold font-mono text-[#181a19]">
                {totalBirdsInFlocks.toLocaleString()} <span className="text-xs font-normal text-[#181a19]/60">birds</span>
              </div>
              <div className="text-[11px] text-[#181a19]/60 mt-1 flex justify-between">
                <span>Acquired: {totalAcquiredBirds.toLocaleString()}</span>
                <span>Mortality: <strong className="text-rose-600">{overallMortalityRatePct.toFixed(1)}%</strong></span>
              </div>
            </div>

            {/* 2. Feed Inventory & Run Rate */}
            <div className="p-3.5 rounded-xl bg-[#fafaf7] border border-[#181a19]/10">
              <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
                <span>Feed Inventory Reserve</span>
                <Wheat className="w-4 h-4 text-[#d97706]" />
              </div>
              <div className="text-lg font-bold font-mono text-[#181a19]">
                {totalFeedStockKg.toLocaleString()} <span className="text-xs font-normal text-[#181a19]/60">kg</span>
              </div>
              <div className="text-[11px] text-[#181a19]/60 mt-1 flex justify-between">
                <span>Total: {totalFeedBags.toFixed(1)} bags</span>
                <span>Consumed: {totalFeedConsumedKg.toLocaleString()} kg</span>
              </div>
            </div>

            {/* 3. Egg Production & Laying Rate */}
            <div className="p-3.5 rounded-xl bg-[#fafaf7] border border-[#181a19]/10">
              <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
                <span>Egg Production</span>
                <Egg className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-lg font-bold font-mono text-[#181a19]">
                {totalEggCrates.toLocaleString()} <span className="text-xs font-normal text-[#181a19]/60">crates</span>
              </div>
              <div className="text-[11px] text-[#181a19]/60 mt-1 flex justify-between">
                <span>Pieces: {totalSaleableEggs.toLocaleString()}</span>
                <span>Laying Rate: <strong className="text-[#16422b]">{averageLayingRatePct.toFixed(1)}%</strong></span>
              </div>
            </div>

            {/* 4. Poultry Financial Return */}
            <div className="p-3.5 rounded-xl bg-[#fafaf7] border border-[#181a19]/10">
              <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
                <span>Poultry Revenue</span>
                <ShoppingBag className="w-4 h-4 text-[#16422b]" />
              </div>
              <div className="text-lg font-bold font-mono text-[#16422b]">
                {formatNaira(totalPoultryRevenue)}
              </div>
              <div className="text-[11px] text-[#181a19]/60 mt-1 flex justify-between">
                <span>Feed Outflow: {formatNaira(totalFeedExpenseNgn)}</span>
              </div>
            </div>
          </div>

          {/* Active Flocks Mini Table & Upcoming Health Follow-ups */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            <div className="lg:col-span-2 border border-[#181a19]/10 rounded-xl overflow-hidden">
              <div className="bg-[#fafaf7] px-3.5 py-2.5 border-b border-[#181a19]/10 flex items-center justify-between text-xs font-semibold text-[#181a19]">
                <span>Registered Poultry Flocks</span>
                <button
                  onClick={() => setActiveSection('poultry')}
                  className="text-[11px] text-[#16422b] hover:underline"
                >
                  View Details &rarr;
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fafaf7]/50 text-[#181a19]/60 text-[11px]">
                    <tr>
                      <th className="px-3.5 py-2">Flock</th>
                      <th className="px-3.5 py-2">Type / Breed</th>
                      <th className="px-3.5 py-2">Housing Pen</th>
                      <th className="px-3.5 py-2 text-right">Population</th>
                      <th className="px-3.5 py-2 text-right">Mortality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {activeFlocks.slice(0, 4).map((f) => {
                      const house = poultryHouses.find((h) => h.id === f.houseId);
                      const currentCount = f.currentBirdCount ?? f.initialBirdCount;
                      const mortalityRate = f.initialBirdCount > 0
                        ? (((f.initialBirdCount - currentCount) / f.initialBirdCount) * 100)
                        : 0;

                      return (
                        <tr key={f.id} className="hover:bg-[#fafaf7]">
                          <td className="px-3.5 py-2 font-medium text-[#181a19]">{f.name}</td>
                          <td className="px-3.5 py-2 text-[#181a19]/70">{f.poultryType} ({f.breed})</td>
                          <td className="px-3.5 py-2 text-[#181a19]/70">{house?.name || 'Unassigned'}</td>
                          <td className="px-3.5 py-2 font-mono text-right font-medium text-[#181a19]">
                            {currentCount.toLocaleString()} / {f.initialBirdCount.toLocaleString()}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right text-rose-600">
                            {mortalityRate.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Vaccinations & Health Schedule */}
            <div className="border border-[#181a19]/10 rounded-xl p-3.5 bg-[#fafaf7]/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#181a19] mb-2">
                  <Syringe className="w-3.5 h-3.5 text-[#16422b]" />
                  <span>Vaccination & Health Schedule</span>
                </div>
                {upcomingVaccinations.length === 0 ? (
                  <p className="text-xs text-[#181a19]/50 mt-2">
                    No urgent vaccine schedules due this week. Routine biosecurity active.
                  </p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {upcomingVaccinations.map((vh) => (
                      <div key={vh.id} className="p-2 rounded-lg bg-white border border-[#181a19]/10 text-xs">
                        <div className="flex items-center justify-between font-medium text-[#181a19]">
                          <span>{vh.medicationOrVaccineName || vh.diseaseOrPurpose}</span>
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                            {vh.nextFollowUpDate}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#181a19]/60 mt-0.5">
                          {vh.administeredBy} &bull; Route: {vh.route}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-[#181a19]/10">
                <button
                  onClick={() => setActiveSection('poultry')}
                  className="w-full text-center py-1.5 text-xs font-semibold text-[#16422b] hover:underline"
                >
                  Log Vaccine / Health Visit &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RevenueExpensesChart expenses={expenses} sales={sales} />
        <ExpenseBreakdownChart expenses={expenses} />
      </div>

      {/* Crop Profitability Comparison Section */}
      <CropProfitabilityChart metrics={cropProfitability} />

      {/* Bottom Grid: Upcoming Tasks & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Upcoming Tasks & Overdue Alerts */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#181a19] tracking-tight">
                Upcoming Tasks & Alerts
              </h3>
              <p className="text-xs text-[#181a19]/60">Critical field actions and input schedule</p>
            </div>
            <button
              onClick={() => setActiveSection('tasks')}
              className="text-xs font-semibold text-[#16422b] hover:underline"
            >
              View Calendar &rarr;
            </button>
          </div>

          {urgentTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#181a19]/60 bg-[#fafaf7] rounded-lg border border-dashed border-[#181a19]/10">
              No pending tasks. Create a task to schedule agronomist scouting or fertilizer delivery.
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-[#181a19]/10 hover:border-[#16422b]/30 bg-[#fafaf7]/50 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="mt-0.5 text-[#181a19]/30 hover:text-[#16422b] transition-colors shrink-0"
                      aria-label="Toggle task completed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#181a19] truncate">{task.title}</p>
                      <p className="text-[11px] text-[#181a19]/60 line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#181a19]/50">
                        <span>Due: {task.dueDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>Assignee: {task.assignedTo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-sm ${
                        task.priority === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Recent Transactions Ledger */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#181a19] tracking-tight">
                Recent Transactions
              </h3>
              <p className="text-xs text-[#181a19]/60">Latest cash inflows and operational disbursements</p>
            </div>
            <button
              onClick={() => setActiveSection('expenses')}
              className="text-xs font-semibold text-[#16422b] hover:underline"
            >
              Full Ledger &rarr;
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#181a19]/60 bg-[#fafaf7] rounded-lg border border-dashed border-[#181a19]/10">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-lg border border-[#181a19]/5 hover:bg-[#fafaf7] transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'sale'
                          ? 'bg-emerald-100 text-[#16422b]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tx.type === 'sale' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-[#181a19] truncate">{tx.title}</p>
                      <p className="text-[11px] text-[#181a19]/50 truncate">
                        {tx.party} · {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono tabular-nums">
                    <p
                      className={`font-semibold ${
                        tx.amount > 0 ? 'text-[#16422b]' : 'text-[#181a19]'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}
                      {formatNaira(tx.amount)}
                    </p>
                    <span className="text-[10px] text-[#181a19]/50 capitalize">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
