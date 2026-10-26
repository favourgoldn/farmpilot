import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calculator,
  Calendar,
  CheckCircle2,
  Coins,
  CreditCard,
  DollarSign,
  Download,
  Egg,
  ExternalLink,
  Eye,
  Feather,
  FileSpreadsheet,
  FileText,
  Filter,
  Info,
  Layers,
  MapPin,
  PieChart,
  Printer,
  Receipt,
  RefreshCw,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Sprout,
  TrendingDown,
  TrendingUp,
  Warehouse,
  Wheat,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  CropProfitMetric,
  formatNaira,
  formatWeight,
  simulateProfitScenario,
} from '../../utils/finance';
import { CropProfitabilityChart } from '../charts/CropProfitabilityChart';
import { ExpenseBreakdownChart } from '../charts/ExpenseBreakdownChart';
import { RevenueExpensesChart } from '../charts/RevenueExpensesChart';
import { CropCostBreakdownModal } from './CropCostBreakdownModal';

export const ProfitReportsView: React.FC = () => {
  const {
    financialSummary,
    cropProfitability,
    fieldProfitability,
    flockProfitability,
    flocks,
    selectedFarm,
    expenses,
    sales,
    harvests,
    farms,
    fields,
    crops,
    seasons,
    isDemoMode,
    showToast,
  } = useFarm();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'statement' | 'crops' | 'poultry' | 'fields' | 'breakeven' | 'simulator'
  >(selectedFarm?.farmType === 'poultry' ? 'poultry' : 'statement');

  // Filter state
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('all');
  const [selectedCropId, setSelectedCropId] = useState<string>('all');

  // Cost modal state
  const [selectedCropForModal, setSelectedCropForModal] = useState<CropProfitMetric | null>(null);

  // Scenario Simulator interactive sliders
  const [simPriceChange, setSimPriceChange] = useState<number>(0);
  const [simYieldChange, setSimYieldChange] = useState<number>(0);
  const [simCostChange, setSimCostChange] = useState<number>(0);

  // Print audit
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    try {
      let headers: string[];
      let rows: any[][];

      if (activeTab === 'poultry') {
        headers = [
          'Flock Name',
          'Poultry Type',
          'Breed',
          'Initial Birds',
          'Current Birds',
          'Mortality Rate (%)',
          'Chick Acquisition Cost (NGN)',
          'Feed Consumed Cost (NGN)',
          'Vet & Meds Cost (NGN)',
          'Total Direct Cost (NGN)',
          'Sales Revenue (NGN)',
          'Gross Profit (NGN)',
          'Gross Margin (%)',
          'Cost Per Bird (NGN)',
          'Feed Conversion Ratio (FCR)',
        ];
        rows = flockProfitability.map((f) => [
          `"${f.flockName}"`,
          `"${f.poultryType}"`,
          `"${f.breed}"`,
          f.initialBirds,
          f.currentBirds,
          f.mortalityRatePercent.toFixed(1),
          f.chickAcquisitionCost,
          f.feedConsumedCost,
          f.vetMedicationCost,
          f.totalOperatingCosts,
          f.totalSalesRevenue,
          f.grossMarginNgn,
          f.netMarginPercent.toFixed(1),
          f.feedCostPerBird.toFixed(2),
          f.feedConsumedKg > 0 ? (f.feedConsumedKg / Math.max(1, f.currentBirds * 2.2)).toFixed(2) : '—',
        ]);
      } else {
        headers = [
          'Enterprise',
          'Variety',
          'Category',
          'Area (Ha)',
          'Harvested (Kg)',
          'Yield (MT/Ha)',
          'Target Yield (Kg)',
          'Yield Achieved (%)',
          'Recognized Revenue (NGN)',
          'Direct Cost (NGN)',
          'Gross Profit (NGN)',
          'Gross Margin (%)',
          'Cost Per Kg (NGN)',
          'Realized Price Per Kg (NGN)',
          'Breakeven Price Per Kg (NGN)',
          'Profit Per Ha (NGN)',
        ];

        rows = cropProfitability.map((c) => [
          `"${c.cropName}"`,
          `"${c.variety}"`,
          `"${c.category}"`,
          c.cultivatedAreaHa.toFixed(2),
          c.harvestedKg,
          c.yieldMTPerHa.toFixed(2),
          c.targetYieldKg,
          c.yieldAchievementPercent.toFixed(1),
          c.recognizedRevenue,
          c.directExpenses,
          c.grossProfit,
          c.grossMarginPercent.toFixed(1),
          c.costPerKgProduced.toFixed(2),
          c.averageSellingPricePerKg.toFixed(2),
          c.breakevenPricePerKg.toFixed(2),
          Math.round(c.profitPerHectare),
        ]);
      }

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `FarmPilot_Profit_Audit_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        type: 'success',
        title: 'Audit CSV Exported',
        message: 'Profit and unit economics ledger downloaded successfully.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: err.message || 'Could not generate CSV file.',
      });
    }
  };

  // Filtered crops
  const filteredCropMetrics = useMemo(() => {
    return cropProfitability.filter((c) => {
      if (selectedCropId !== 'all' && c.cropId !== selectedCropId) return false;
      return true;
    });
  }, [cropProfitability, selectedCropId]);

  // Scenario Simulation Result
  const simulationResult = useMemo(() => {
    return simulateProfitScenario(
      financialSummary,
      simPriceChange,
      simYieldChange,
      simCostChange
    );
  }, [financialSummary, simPriceChange, simYieldChange, simCostChange]);

  const resetSimulator = () => {
    setSimPriceChange(0);
    setSimYieldChange(0);
    setSimCostChange(0);
  };

  // Aggregated Yields
  const totalCultivatedAreaHa = fields.reduce((sum, f) => {
    return sum + (f.unit === 'acres' ? f.size / 2.47105 : f.size);
  }, 0);

  const overallYieldMTPerHa =
    totalCultivatedAreaHa > 0
      ? (financialSummary.totalHarvestedKg / 1000) / totalCultivatedAreaHa
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#181a19]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-[#181a19]">
              Profit Engine & Agribusiness Intelligence
            </h2>
          </div>
          <p className="text-xs text-[#181a19]/60 mt-0.5">
            Actual revenue realization, direct input costs, unit economics, yield benchmarks, and operating EBITDA
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/15 hover:bg-[#fafaf7] rounded-lg transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV Audit</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Financial Audit</span>
          </button>
        </div>
      </div>

      {/* Accounting Methodology Banner */}
      <div className="p-4 bg-[#fafaf7] border border-[#181a19]/10 rounded-xl text-xs flex items-start gap-3 shadow-2xs print:border-black/30">
        <Info className="w-4 h-4 text-[#16422b] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold text-[#181a19]">
            Strict Agricultural Accounting Standards Applied
          </p>
          <p className="text-[#181a19]/70 leading-relaxed text-[11px]">
            Recognized sales revenue reflects fulfilled produce off-take agreements ({formatWeight(financialSummary.totalSoldKg)} delivered).
            Unsold warehouse stock ({formatWeight(financialSummary.unsoldInventoryKg)} valued at ~{formatNaira(financialSummary.estimatedUnsoldValue)}) is recorded as retained biological inventory assets and is strictly excluded from recognized revenue until contractually settled.
            Customer debt receivables ({formatNaira(financialSummary.outstandingCustomerPayments)}) are segregated from settled cash in bank ({formatNaira(financialSummary.totalCashReceived)}).
          </p>
        </div>
      </div>

      {/* Top 6 Financial Engine KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Recognized Revenue */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Recognized Revenue</span>
            <ShoppingBag className="w-4 h-4 text-[#16422b]" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-[#181a19] tracking-tight">
            {formatNaira(financialSummary.totalSalesRevenue)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-[#181a19]/60">
            <span>From {formatWeight(financialSummary.totalSoldKg)}</span>
            <span className="font-mono text-[#16422b] font-medium">
              ~{formatNaira(financialSummary.averageSellingPricePerKg, true)}/kg
            </span>
          </div>
        </div>

        {/* Card 2: Cash Realized in Bank */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Cash Collected</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-700 tracking-tight">
            {formatNaira(financialSummary.totalCashReceived)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
            <span>{financialSummary.cashRealizationRate.toFixed(1)}% Realized</span>
            <span className="text-amber-800 font-normal">
              Owed: {formatNaira(financialSummary.outstandingCustomerPayments)}
            </span>
          </div>
        </div>

        {/* Card 3: Total Operating Costs */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Operating Costs</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-rose-600 tracking-tight">
            {formatNaira(financialSummary.totalOperatingExpenses)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-[#181a19]/60">
            <span>Cost-to-Income:</span>
            <span className="font-mono font-medium text-[#181a19]">
              {financialSummary.costToIncomeRatio.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Card 4: Net Operating EBITDA Result */}
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
          <div className="mt-1 flex items-center justify-between text-[11px] text-[#181a19]/60">
            <span>Margin:</span>
            <span className="font-mono font-bold text-[#16422b]">
              {financialSummary.operatingMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Card 5: Agronomic Harvest Yield */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Harvested Yield</span>
            <Scale className="w-4 h-4 text-[#16422b]" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-[#181a19] tracking-tight">
            {formatWeight(financialSummary.totalHarvestedKg)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-[#181a19]/60">
            <span>Avg Yield:</span>
            <span className="font-mono font-medium text-[#181a19]">
              {overallYieldMTPerHa.toFixed(2)} MT/ha
            </span>
          </div>
        </div>

        {/* Card 6: Breakeven Floor & ROI */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Breakeven Price</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-blue-900 tracking-tight">
            {formatNaira(financialSummary.breakevenPricePerKg, true)}
            <span className="text-xs font-normal text-[#181a19]/60">/kg</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-[#181a19]/60">
            <span>Safety Margin:</span>
            <span className="font-mono font-medium text-[#16422b]">
              {financialSummary.safetyMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-[#181a19]/10 rounded-xl w-fit print:hidden">
        <button
          onClick={() => setActiveTab('statement')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'statement'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Statement of Operations (P&L)</span>
        </button>

        <button
          onClick={() => setActiveTab('crops')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'crops'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>Crop Margins & Yields ({cropProfitability.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('poultry')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'poultry'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <Egg className="w-3.5 h-3.5" />
          <span>Poultry & Flock Margins ({flockProfitability.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fields')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'fields'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Field Block Matrix ({fieldProfitability.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('breakeven')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'breakeven'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Breakeven & Yield Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'simulator'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          <span>What-If Scenario Simulator</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: STATEMENT OF AGRICULTURAL OPERATIONS (P&L)         */}
      {/* ========================================================= */}
      {activeTab === 'statement' && (
        <div className="space-y-6">
          {/* Visual Charts Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 print:hidden">
            <RevenueExpensesChart expenses={expenses} sales={sales} />
            <ExpenseBreakdownChart expenses={expenses} />
          </div>

          {/* Primary Income Statement Sheet */}
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 sm:p-8 shadow-xs print:shadow-none print:border-none">
            <div className="border-b border-[#181a19]/10 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-[#16422b] tracking-wider">
                  Agribusiness Management Ledger
                </span>
                <h3 className="text-xl font-bold text-[#181a19]">
                  Statement of Agricultural Operations (P&L)
                </h3>
                <p className="text-xs text-[#181a19]/50 font-mono mt-0.5">
                  Estate: {farms[0]?.name || 'Alafia Commercial Farms'} · Active Season
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-[#181a19]/50 block">Reporting Currency</span>
                <span className="text-xs font-semibold font-mono text-[#16422b] block">
                  Nigerian Naira (NGN ₦)
                </span>
                <span className="text-[11px] text-[#181a19]/40">
                  Accrual Basis Accounting
                </span>
              </div>
            </div>

            {/* Income Statement Table Rows */}
            <div className="space-y-4 font-mono tabular-nums text-xs">
              {/* SECTION 1: REVENUE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2.5 border-b border-[#181a19]/10 bg-[#fafaf7] px-3 rounded-lg">
                  <span className="font-sans font-bold text-sm text-[#181a19]">
                    1. Gross Recognized Sales Revenue
                  </span>
                  <span className="text-sm font-bold text-[#16422b]">
                    {formatNaira(financialSummary.totalSalesRevenue)}
                  </span>
                </div>

                <div className="pl-4 sm:pl-6 space-y-2 text-[#181a19]/80 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#181a19]/5">
                    <span className="font-sans">
                      Settled Cash Received in Commercial Bank
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {formatNaira(financialSummary.totalCashReceived)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#181a19]/5">
                    <span className="font-sans">
                      Outstanding Customer Off-taker Receivables (Uncollected)
                    </span>
                    <span className="font-semibold text-amber-800">
                      {formatNaira(financialSummary.outstandingCustomerPayments)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#181a19]/5 text-[#181a19]/60 text-[11px]">
                    <span className="font-sans italic">
                      Dispatched produce volume
                    </span>
                    <span>{formatWeight(financialSummary.totalSoldKg)}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: COST OF GOODS SOLD / DIRECT OPERATING EXPENSES */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between py-2.5 border-b border-[#181a19]/10 bg-[#fafaf7] px-3 rounded-lg">
                  <span className="font-sans font-bold text-sm text-[#181a19]">
                    2. Direct Crop Enterprise Input Costs (COGS)
                  </span>
                  <span className="text-sm font-bold text-rose-600">
                    ({formatNaira(financialSummary.directInputCosts)})
                  </span>
                </div>

                <div className="pl-4 sm:pl-6 space-y-2 text-[#181a19]/80 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#181a19]/5">
                    <span className="font-sans">Certified Hybrid Seeds & Seedlings</span>
                    <span>
                      {formatNaira(
                        expenses
                          .filter((e) => e.category === 'seeds_seedlings')
                          .reduce((sum, e) => sum + e.amount, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#181a19]/5">
                    <span className="font-sans">
                      Fertilizer (NPK, Urea, Calcium Nitrate) & Agrochemicals
                    </span>
                    <span>
                      {formatNaira(
                        expenses
                          .filter((e) => e.category === 'fertilizer_chemicals')
                          .reduce((sum, e) => sum + e.amount, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#181a19]/5">
                    <span className="font-sans">
                      Mechanization, Tractor Tillage & Diesel Fuel
                    </span>
                    <span>
                      {formatNaira(
                        expenses
                          .filter((e) => e.category === 'mechanization_fuel')
                          .reduce((sum, e) => sum + e.amount, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#181a19]/5">
                    <span className="font-sans">
                      Field Labor Wages (Ridge Prep, Weeding, Spraying & Harvest Gang)
                    </span>
                    <span>
                      {formatNaira(
                        expenses
                          .filter((e) => e.category === 'labor')
                          .reduce((sum, e) => sum + e.amount, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#181a19]/5">
                    <span className="font-sans">
                      Logistics, Sacks (50kg), Crates & Produce Haulage
                    </span>
                    <span>
                      {formatNaira(
                        expenses
                          .filter((e) => e.category === 'logistics_packaging')
                          .reduce((sum, e) => sum + e.amount, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: GROSS PROFIT */}
              <div className="flex items-center justify-between py-3 border-y-2 border-[#181a19]/20 px-3 bg-[#fafaf7]/80 rounded-lg">
                <div>
                  <span className="font-sans font-bold text-sm text-[#181a19] block">
                    Gross Agricultural Profit
                  </span>
                  <span className="font-sans text-[11px] text-[#181a19]/50 block">
                    Recognized Revenue minus Direct Production Costs
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-base font-bold ${
                      financialSummary.grossProfit >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                    }`}
                  >
                    {financialSummary.grossProfit >= 0 ? '+' : ''}
                    {formatNaira(financialSummary.grossProfit)}
                  </span>
                  <span className="font-sans text-[11px] text-[#181a19]/60 block font-semibold">
                    Gross Margin: {financialSummary.grossMarginPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* SECTION 4: INDIRECT OVERHEAD & ESTATE EXPENSES */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between py-2.5 border-b border-[#181a19]/10 bg-[#fafaf7] px-3 rounded-lg">
                  <span className="font-sans font-bold text-sm text-[#181a19]">
                    3. Indirect Estate Overhead & Operating Maintenance
                  </span>
                  <span className="text-sm font-bold text-rose-600">
                    ({formatNaira(financialSummary.overheadCosts)})
                  </span>
                </div>

                <div className="pl-4 sm:pl-6 space-y-2 text-[#181a19]/80 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#181a19]/5">
                    <span className="font-sans">
                      Land Lease, Borehole Power & Solar/Water Utilities
                    </span>
                    <span>
                      {formatNaira(
                        expenses
                          .filter((e) => e.category === 'lease_utilities')
                          .reduce((sum, e) => sum + e.amount, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#181a19]/5">
                    <span className="font-sans">General Maintenance & Other Overhead</span>
                    <span>
                      {formatNaira(
                        expenses
                          .filter((e) => e.category === 'other')
                          .reduce((sum, e) => sum + e.amount, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 5: NET OPERATING RESULT (EBITDA) */}
              <div className="flex items-center justify-between py-4 border-t-3 border-[#16422b] bg-[#16422b]/5 px-4 rounded-xl mt-6">
                <div>
                  <span className="font-sans font-bold text-base text-[#181a19] block">
                    Net Operating Result (EBITDA)
                  </span>
                  <span className="font-sans text-xs text-[#181a19]/60 block mt-0.5">
                    Actual Net Profit before tax, financing, and depreciation
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xl font-bold ${
                      financialSummary.netOperatingResult >= 0
                        ? 'text-[#16422b]'
                        : 'text-rose-600'
                    }`}
                  >
                    {financialSummary.netOperatingResult >= 0 ? '+' : ''}
                    {formatNaira(financialSummary.netOperatingResult)}
                  </span>
                  <span className="font-sans text-xs text-[#181a19]/70 block font-semibold mt-0.5">
                    Operating Margin: {financialSummary.operatingMarginPercent.toFixed(1)}% · Return on Investment: {financialSummary.returnOnInvestment.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* BIOLOGICAL ASSET RECONCILIATION */}
              <div className="pt-4 border-t border-[#181a19]/10">
                <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-sans font-bold text-[#181a19] block">
                      Retained Unsold Biological Produce Asset
                    </span>
                    <span className="font-sans text-[#181a19]/60 text-[11px] block">
                      Current inventory stored in central warehouses ({formatWeight(financialSummary.unsoldInventoryKg)})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#16422b] font-mono text-sm block">
                      ~{formatNaira(financialSummary.estimatedUnsoldValue)}
                    </span>
                    <span className="font-sans text-[10px] text-[#181a19]/50 block">
                      Valued at benchmark market farm-gate rate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CROP ENTERPRISE MARGINS & YIELDS                  */}
      {/* ========================================================= */}
      {activeTab === 'crops' && (
        <div className="space-y-6">
          {/* Chart Header */}
          <div className="print:hidden">
            <CropProfitabilityChart metrics={cropProfitability} />
          </div>

          {/* Crop Economics Table */}
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#181a19]">
                  Crop Enterprise Unit Economics & Yield Performance
                </h3>
                <p className="text-xs text-[#181a19]/60">
                  Detailed cost of production per kg, yield per hectare, gross margins, and breakeven floors
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#181a19]/50" />
                <select
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#16422b]"
                >
                  <option value="all">All Crop Enterprises ({cropProfitability.length})</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.variety})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredCropMetrics.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#181a19]/50 bg-[#fafaf7] rounded-xl border border-dashed border-[#181a19]/15">
                No crops match the filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                      <th className="py-3 px-3">Crop Enterprise</th>
                      <th className="py-3 px-3 text-right">Acreage</th>
                      <th className="py-3 px-3 text-right">Harvest Yield</th>
                      <th className="py-3 px-3 text-right">Yield Rate</th>
                      <th className="py-3 px-3 text-right">Recognized Revenue</th>
                      <th className="py-3 px-3 text-right">Direct Cost</th>
                      <th className="py-3 px-3 text-right">Gross Profit</th>
                      <th className="py-3 px-3 text-right">Margin %</th>
                      <th className="py-3 px-3 text-right">Cost / kg</th>
                      <th className="py-3 px-3 text-right">Profit / Ha</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {filteredCropMetrics.map((crop) => (
                      <tr key={crop.cropId} className="hover:bg-[#fafaf7]/80 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-semibold text-[#181a19] block">{crop.cropName}</span>
                          <span className="text-[11px] text-[#181a19]/50 block">
                            {crop.variety} · {crop.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#181a19]">
                          {crop.cultivatedAreaHa.toFixed(1)} ha
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#181a19] font-medium">
                          {formatWeight(crop.harvestedKg)}
                          <span className="text-[10px] text-[#181a19]/50 block">
                            Target: {formatWeight(crop.targetYieldKg)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#181a19]">
                          <span className="font-semibold">{crop.yieldMTPerHa.toFixed(2)} MT/ha</span>
                          <span
                            className={`text-[10px] block ${
                              crop.yieldAchievementPercent >= 100
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {crop.yieldAchievementPercent.toFixed(0)}% target
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#181a19] font-medium">
                          {formatNaira(crop.recognizedRevenue)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-600">
                          {formatNaira(crop.directExpenses)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono tabular-nums font-bold ${
                            crop.grossProfit >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                          }`}
                        >
                          {crop.grossProfit >= 0 ? '+' : ''}
                          {formatNaira(crop.grossProfit)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                            crop.grossProfit >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                          }`}
                        >
                          {crop.grossMarginPercent.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#181a19]">
                          {crop.costPerKgProduced > 0
                            ? formatNaira(crop.costPerKgProduced, true)
                            : '—'}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                            crop.profitPerHectare >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                          }`}
                        >
                          {crop.profitPerHectare >= 0 ? '+' : ''}
                          {formatNaira(crop.profitPerHectare)}/ha
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedCropForModal(crop)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#16422b] bg-[#16422b]/10 hover:bg-[#16422b]/20 rounded-md transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Waterfall</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: POULTRY & FLOCK PROFITABILITY                       */}
      {/* ========================================================= */}
      {activeTab === 'poultry' && (
        <div className="space-y-6">
          {/* Top 4 Poultry Profit KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
                <span>Poultry Sales Revenue</span>
                <ShoppingBag className="w-4 h-4 text-[#16422b]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#16422b]">
                {formatNaira(
                  flockProfitability.reduce((sum, f) => sum + f.totalSalesRevenue, 0)
                )}
              </div>
              <p className="text-[11px] text-[#181a19]/50 mt-1">
                Off-take broilers, layer eggs & manure sales
              </p>
            </div>

            <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
                <span>Direct Flock Outflow</span>
                <Receipt className="w-4 h-4 text-[#d97706]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#181a19]">
                {formatNaira(
                  flockProfitability.reduce((sum, f) => sum + f.totalOperatingCosts, 0)
                )}
              </div>
              <p className="text-[11px] text-[#181a19]/50 mt-1">
                Day-old chicks, feed consumed & veterinary care
              </p>
            </div>

            <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
                <span>Net Flock Contribution</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold font-mono text-[#16422b]">
                {formatNaira(
                  flockProfitability.reduce((sum, f) => sum + f.grossMarginNgn, 0)
                )}
              </div>
              <p className="text-[11px] text-[#181a19]/50 mt-1">
                Gross enterprise profit before overhead allocations
              </p>
            </div>

            <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
                <span>Average Flock Margin</span>
                <Coins className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl font-bold font-mono text-[#181a19]">
                {flockProfitability.length > 0
                  ? (
                      flockProfitability.reduce((sum, f) => sum + f.netMarginPercent, 0) /
                      flockProfitability.length
                    ).toFixed(1)
                  : '0.0'}
                %
              </div>
              <p className="text-[11px] text-[#181a19]/50 mt-1">
                Weighted enterprise operating margin
              </p>
            </div>
          </div>

          {/* Poultry Costing & Accounting Note */}
          <div className="p-4 bg-[#fafaf7] border border-[#181a19]/10 rounded-xl text-xs flex items-start gap-3">
            <Info className="w-4 h-4 text-[#16422b] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-[#181a19]">
                Zero-Double-Counting Feed & Biological Costing Formula
              </p>
              <p className="text-[#181a19]/70 text-[11px] mt-0.5 leading-relaxed">
                Feed expenses are computed strictly against recorded feed consumption logs multiplied by batch purchase cost. Feed remaining in store is held as liquid inventory asset. Bird mortality is calculated as <code>(Total Movements [Deaths + Culls] / Initial Birds Acquired) * 100</code>.
              </p>
            </div>
          </div>

          {/* Flock Profitability Table */}
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#181a19]">
                  Flock Unit Economics & Margin Audit
                </h3>
                <p className="text-xs text-[#181a19]/60">
                  Individual flock revenue realization, feed conversion ratio (FCR), bird cost, and net return
                </p>
              </div>
            </div>

            {flockProfitability.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#181a19]/50 bg-[#fafaf7] rounded-xl border border-dashed border-[#181a19]/15">
                No active poultry flocks registered yet. Visit the Poultry Management hub to register your first flock.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                      <th className="py-3 px-3">Flock Reference</th>
                      <th className="py-3 px-3">Type / Breed</th>
                      <th className="py-3 px-3 text-right">Population</th>
                      <th className="py-3 px-3 text-right">Mortality</th>
                      <th className="py-3 px-3 text-right">Chick Cost</th>
                      <th className="py-3 px-3 text-right">Feed Consumed</th>
                      <th className="py-3 px-3 text-right">Vet & Health</th>
                      <th className="py-3 px-3 text-right">Total Direct Cost</th>
                      <th className="py-3 px-3 text-right">Recognized Revenue</th>
                      <th className="py-3 px-3 text-right">Gross Profit</th>
                      <th className="py-3 px-3 text-right">Margin %</th>
                      <th className="py-3 px-3 text-right">Cost / Bird</th>
                      <th className="py-3 px-3 text-right">FCR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {flockProfitability.map((f) => (
                      <tr key={f.flockId} className="hover:bg-[#fafaf7] transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#181a19]">
                          {f.flockName}
                        </td>
                        <td className="py-3 px-3 text-[#181a19]/70">
                          {f.poultryType} ({f.breed})
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#181a19]">
                          {f.currentBirds.toLocaleString()} / {f.initialBirds.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-rose-600 font-medium">
                          {f.mortalityRatePercent.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#181a19]/70">
                          {formatNaira(f.chickAcquisitionCost)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#181a19]/70">
                          {formatNaira(f.feedConsumedCost)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#181a19]/70">
                          {formatNaira(f.vetMedicationCost)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium text-[#181a19]">
                          {formatNaira(f.totalOperatingCosts)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#16422b]">
                          {formatNaira(f.totalSalesRevenue)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono font-bold ${
                            f.grossMarginNgn >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                          }`}
                        >
                          {f.grossMarginNgn >= 0 ? '+' : ''}
                          {formatNaira(f.grossMarginNgn)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono font-semibold ${
                            f.netMarginPercent >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                          }`}
                        >
                          {f.netMarginPercent.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#181a19]/80">
                          {formatNaira(f.feedCostPerBird)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#181a19]/80 font-medium">
                          {f.feedConsumedKg > 0 ? (f.feedConsumedKg / Math.max(1, f.currentBirds * 2.2)).toFixed(2) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: FIELD BLOCK PROFITABILITY & SOIL PRODUCTIVITY     */}
      {/* ========================================================= */}
      {activeTab === 'fields' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-5 shadow-xs">
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#181a19]">
                Field Plot Yield & Profitability Matrix
              </h3>
              <p className="text-xs text-[#181a19]/60">
                Evaluating agricultural returns by field plot to detect underperforming soil blocks and optimize irrigation assets
              </p>
            </div>

            {fieldProfitability.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#181a19]/50 bg-[#fafaf7] rounded-xl border border-dashed border-[#181a19]/15">
                No field plots registered.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fieldProfitability.map((f) => (
                  <div
                    key={f.fieldId}
                    className="p-5 rounded-2xl border border-[#181a19]/10 bg-white hover:border-[#16422b]/30 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#16422b]/10 text-[#16422b]">
                          {f.fieldCode}
                        </span>
                        <span className="text-xs font-mono font-medium text-[#181a19]/60">
                          {f.sizeHa.toFixed(1)} ha
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#181a19]">{f.fieldName}</h4>
                      <p className="text-xs text-[#181a19]/60 mt-0.5">
                        {f.cropsGrown.length > 0 ? f.cropsGrown.join(', ') : 'Fallow / Preparing'}
                      </p>

                      <div className="mt-4 pt-4 border-t border-[#181a19]/10 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[#181a19]/60">Harvest Output:</span>
                          <span className="font-mono font-semibold text-[#181a19]">
                            {formatWeight(f.totalHarvestKg)} ({f.yieldKgPerHa > 0 ? `${(f.yieldKgPerHa / 1000).toFixed(2)} MT/ha` : '0 MT/ha'})
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[#181a19]/60">Recognized Revenue:</span>
                          <span className="font-mono font-semibold text-[#16422b]">
                            {formatNaira(f.totalRevenue)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[#181a19]/60">Logged Direct Cost:</span>
                          <span className="font-mono font-semibold text-rose-600">
                            {formatNaira(f.totalCost)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-[#181a19]/5">
                          <span className="text-[#181a19]/80 font-semibold">Net Field Margin:</span>
                          <span
                            className={`font-mono font-bold ${
                              f.netOperatingProfit >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                            }`}
                          >
                            {f.netOperatingProfit >= 0 ? '+' : ''}
                            {formatNaira(f.netOperatingProfit)} ({f.marginPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#181a19]/10 flex items-center justify-between text-[11px] text-[#181a19]/60">
                      <span>Profit per Hectare:</span>
                      <span className="font-mono font-bold text-[#181a19]">
                        {formatNaira(f.profitPerHectare)}/ha
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: BREAKEVEN & YIELD ANALYTICS                       */}
      {/* ========================================================= */}
      {activeTab === 'breakeven' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Breakeven Floor Card */}
            <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-[#181a19]">
                  Commercial Price Floor Analysis
                </h3>
              </div>

              <p className="text-xs text-[#181a19]/70 leading-relaxed">
                The minimum price at which farm produce must be sold to cover direct cultivation and estate overhead expenditures.
              </p>

              <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10 space-y-3 font-mono tabular-nums text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-[#181a19]/70">Total Operating Expenditure:</span>
                  <span className="font-bold text-rose-600">
                    {formatNaira(financialSummary.totalOperatingExpenses)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-sans text-[#181a19]/70">Total Harvest Produced:</span>
                  <span className="font-bold text-[#181a19]">
                    {formatWeight(financialSummary.totalHarvestedKg)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#181a19]/10">
                  <span className="font-sans font-bold text-sm text-[#181a19]">
                    Estate Breakeven Floor Price:
                  </span>
                  <span className="font-bold text-base text-blue-900">
                    {formatNaira(financialSummary.breakevenPricePerKg, true)} / kg
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#181a19]/60">
                  <span className="font-sans">Current Average Selling Price:</span>
                  <span className="font-semibold text-emerald-700">
                    {formatNaira(financialSummary.averageSellingPricePerKg, true)} / kg
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <span>Commercial Safety Margin:</span>
                <span className="font-mono font-bold text-sm text-emerald-900">
                  +{financialSummary.safetyMarginPercent.toFixed(1)}% above floor
                </span>
              </div>
            </div>

            {/* Unsold Stock Valuation Card */}
            <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-[#16422b]" />
                <h3 className="text-base font-bold text-[#181a19]">
                  Stored Produce Valuation & Liquidity
                </h3>
              </div>

              <p className="text-xs text-[#181a19]/70 leading-relaxed">
                Conservative market valuation of unsold grain, tuber, and vegetable stock held in silos and warehouses.
              </p>

              <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10 space-y-3 font-mono tabular-nums text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-[#181a19]/70">Harvested Weight:</span>
                  <span className="font-bold text-[#181a19]">
                    {formatWeight(financialSummary.totalHarvestedKg)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-sans text-[#181a19]/70">Dispatched & Sold Weight:</span>
                  <span className="font-bold text-emerald-700">
                    {formatWeight(financialSummary.totalSoldKg)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#181a19]/10">
                  <span className="font-sans font-bold text-sm text-[#181a19]">
                    Retained Produce on Hand:
                  </span>
                  <span className="font-bold text-base text-[#16422b]">
                    {formatWeight(financialSummary.unsoldInventoryKg)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#181a19]/60">
                  <span className="font-sans">Conservative Unit Value:</span>
                  <span>~{formatNaira(financialSummary.averageSellingPricePerKg, true)} / kg</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#16422b]/10 border border-[#16422b]/20 text-xs text-[#16422b] flex items-center justify-between">
                <span>Estimated Market Value:</span>
                <span className="font-mono font-bold text-sm">
                  {formatNaira(financialSummary.estimatedUnsoldValue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: WHAT-IF SENSITIVITY & SCENARIO SIMULATOR           */}
      {/* ========================================================= */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#181a19]/10">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-bold text-[#181a19]">
                    Agribusiness Sensitivity & Scenario Simulator
                  </h3>
                </div>
                <p className="text-xs text-[#181a19]/60 mt-0.5">
                  Simulate market price shocks, harvest yield swings, or input cost inflation to test operational resiliency
                </p>
              </div>

              <button
                type="button"
                onClick={resetSimulator}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#181a19]/70 hover:text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/10 rounded-lg transition-colors w-fit"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Sliders</span>
              </button>
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Slider 1: Market Price Fluctuation */}
              <div className="p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#181a19]">Produce Market Price</span>
                  <span
                    className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                      simPriceChange > 0
                        ? 'bg-emerald-100 text-emerald-900'
                        : simPriceChange < 0
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-[#181a19]/10 text-[#181a19]'
                    }`}
                  >
                    {simPriceChange > 0 ? '+' : ''}
                    {simPriceChange}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  step="5"
                  value={simPriceChange}
                  onChange={(e) => setSimPriceChange(parseInt(e.target.value, 10))}
                  className="w-full accent-[#16422b] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#181a19]/50 font-mono">
                  <span>-30% Drop</span>
                  <span>Baseline (0%)</span>
                  <span>+50% Surge</span>
                </div>
              </div>

              {/* Slider 2: Yield Fluctuation */}
              <div className="p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#181a19]">Agronomic Yield Volume</span>
                  <span
                    className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                      simYieldChange > 0
                        ? 'bg-emerald-100 text-emerald-900'
                        : simYieldChange < 0
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-[#181a19]/10 text-[#181a19]'
                    }`}
                  >
                    {simYieldChange > 0 ? '+' : ''}
                    {simYieldChange}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="5"
                  value={simYieldChange}
                  onChange={(e) => setSimYieldChange(parseInt(e.target.value, 10))}
                  className="w-full accent-[#16422b] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#181a19]/50 font-mono">
                  <span>-40% Drought</span>
                  <span>Baseline (0%)</span>
                  <span>+40% Bumper</span>
                </div>
              </div>

              {/* Slider 3: Input Cost Shock */}
              <div className="p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#181a19]">Input Cost Inflation</span>
                  <span
                    className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                      simCostChange > 0
                        ? 'bg-rose-100 text-rose-900'
                        : simCostChange < 0
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-[#181a19]/10 text-[#181a19]'
                    }`}
                  >
                    {simCostChange > 0 ? '+' : ''}
                    {simCostChange}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="50"
                  step="5"
                  value={simCostChange}
                  onChange={(e) => setSimCostChange(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#181a19]/50 font-mono">
                  <span>-20% Cheaper</span>
                  <span>Baseline (0%)</span>
                  <span>+50% Inflation</span>
                </div>
              </div>
            </div>

            {/* Simulation Comparison Matrix */}
            <div className="border border-[#181a19]/10 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="bg-[#fafaf7] px-5 py-3 border-b border-[#181a19]/10 flex items-center justify-between">
                <span className="text-xs font-bold text-[#181a19] uppercase tracking-wider">
                  Projected Financial Pro-Forma Impact
                </span>
                <span className="text-xs font-mono font-medium text-[#181a19]/60">
                  Baseline vs. Simulated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#181a19]/10 p-4 font-mono tabular-nums text-xs">
                {/* Metric 1: Projected Revenue */}
                <div className="p-4 space-y-1">
                  <span className="font-sans text-[11px] text-[#181a19]/60 block uppercase">
                    Projected Revenue
                  </span>
                  <span className="text-lg font-bold text-[#16422b] block">
                    {formatNaira(simulationResult.projectedRevenue)}
                  </span>
                  <span className="font-sans text-[11px] text-[#181a19]/50 block">
                    Baseline: {formatNaira(financialSummary.totalSalesRevenue)}
                  </span>
                </div>

                {/* Metric 2: Projected Operating Costs */}
                <div className="p-4 space-y-1">
                  <span className="font-sans text-[11px] text-[#181a19]/60 block uppercase">
                    Projected Operating Costs
                  </span>
                  <span className="text-lg font-bold text-rose-600 block">
                    {formatNaira(simulationResult.projectedCosts)}
                  </span>
                  <span className="font-sans text-[11px] text-[#181a19]/50 block">
                    Baseline: {formatNaira(financialSummary.totalOperatingExpenses)}
                  </span>
                </div>

                {/* Metric 3: Projected Net Operating Result */}
                <div className="p-4 space-y-1">
                  <span className="font-sans text-[11px] text-[#181a19]/60 block uppercase">
                    Projected EBITDA
                  </span>
                  <span
                    className={`text-lg font-bold block ${
                      simulationResult.projectedNetProfit >= 0
                        ? 'text-[#16422b]'
                        : 'text-rose-600'
                    }`}
                  >
                    {simulationResult.projectedNetProfit >= 0 ? '+' : ''}
                    {formatNaira(simulationResult.projectedNetProfit)}
                  </span>
                  <span className="font-sans text-[11px] text-[#181a19]/60 block font-semibold">
                    Margin: {simulationResult.projectedMarginPercent.toFixed(1)}% (ROI: {simulationResult.projectedROI.toFixed(1)}%)
                  </span>
                </div>

                {/* Metric 4: Delta Impact on Profit */}
                <div className="p-4 space-y-1 bg-[#fafaf7]/50 rounded-xl">
                  <span className="font-sans text-[11px] text-[#181a19]/60 block uppercase">
                    Net Profit Variance (Δ)
                  </span>
                  <span
                    className={`text-lg font-bold block ${
                      simulationResult.deltaProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {simulationResult.deltaProfit >= 0 ? '+' : ''}
                    {formatNaira(simulationResult.deltaProfit)}
                  </span>
                  <span className="font-sans text-[11px] text-[#181a19]/70 block">
                    {simulationResult.deltaProfit >= 0
                      ? 'Net upside potential'
                      : 'Operating margin erosion'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crop Cost Waterfall & Breakdown */}
      {selectedCropForModal && (
        <CropCostBreakdownModal
          cropMetric={selectedCropForModal}
          onClose={() => setSelectedCropForModal(null)}
        />
      )}
    </div>
  );
};
