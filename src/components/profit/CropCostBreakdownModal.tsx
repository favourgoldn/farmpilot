import {
  Calendar,
  DollarSign,
  Layers,
  MapPin,
  PieChart,
  Scale,
  ShoppingBag,
  TrendingUp,
  X,
} from 'lucide-react';
import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { CropProfitMetric, formatNaira, formatWeight } from '../../utils/finance';

interface CropCostBreakdownModalProps {
  cropMetric: CropProfitMetric | null;
  onClose: () => void;
}

export const CropCostBreakdownModal: React.FC<CropCostBreakdownModalProps> = ({
  cropMetric,
  onClose,
}) => {
  const { expenses, sales, harvests, fields } = useFarm();

  if (!cropMetric) return null;

  const cropExpenses = expenses.filter((e) => e.cropId === cropMetric.cropId);
  const cropSales = sales.filter((s) => s.cropId === cropMetric.cropId);
  const cropHarvests = harvests.filter((h) => h.cropId === cropMetric.cropId);
  const linkedField = fields.find((f) => f.currentCropId === cropMetric.cropId);

  const totalCost = cropMetric.directExpenses;

  const costItems = [
    {
      category: 'Certified Seeds & Seedlings',
      amount: cropMetric.costBreakdown.seeds,
      pct: totalCost > 0 ? (cropMetric.costBreakdown.seeds / totalCost) * 100 : 0,
      color: 'bg-emerald-600',
    },
    {
      category: 'Fertilizer & Crop Protection Chemicals',
      amount: cropMetric.costBreakdown.fertilizerChemicals,
      pct: totalCost > 0 ? (cropMetric.costBreakdown.fertilizerChemicals / totalCost) * 100 : 0,
      color: 'bg-amber-600',
    },
    {
      category: 'Mechanization, Tillage & Diesel Fuel',
      amount: cropMetric.costBreakdown.mechanization,
      pct: totalCost > 0 ? (cropMetric.costBreakdown.mechanization / totalCost) * 100 : 0,
      color: 'bg-blue-600',
    },
    {
      category: 'Field & Seasonal Labor (Weeding & Harvest)',
      amount: cropMetric.costBreakdown.labor,
      pct: totalCost > 0 ? (cropMetric.costBreakdown.labor / totalCost) * 100 : 0,
      color: 'bg-purple-600',
    },
    {
      category: 'Logistics, Packaging Sacks & Haulage',
      amount: cropMetric.costBreakdown.logistics,
      pct: totalCost > 0 ? (cropMetric.costBreakdown.logistics / totalCost) * 100 : 0,
      color: 'bg-rose-600',
    },
    {
      category: 'Other / Irrigation & Utilities',
      amount: cropMetric.costBreakdown.other,
      pct: totalCost > 0 ? (cropMetric.costBreakdown.other / totalCost) * 100 : 0,
      color: 'bg-stone-500',
    },
  ].filter((item) => item.amount > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a19]/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#181a19]/10 max-w-2xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#181a19]/10 bg-[#fafaf7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#16422b]/15 text-[#16422b] flex items-center justify-center font-bold text-xs">
                {cropMetric.cropName.charAt(0)}
              </span>
              <h3 className="text-sm font-bold text-[#181a19]">
                {cropMetric.cropName} — Cost & Yield Waterfall
              </h3>
            </div>
            <p className="text-xs text-[#181a19]/60 mt-0.5">
              {cropMetric.variety} · {cropMetric.category} ·{' '}
              {linkedField?.name || `${cropMetric.cultivatedAreaHa.toFixed(1)} ha`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#181a19]/40 hover:text-[#181a19] p-1.5 transition-colors"
            aria-label="Close cost breakdown"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/5">
              <span className="text-[10px] text-[#181a19]/60 block uppercase font-medium">
                Recognized Revenue
              </span>
              <span className="text-sm font-bold font-mono tabular-nums text-[#16422b] mt-0.5 block">
                {formatNaira(cropMetric.recognizedRevenue)}
              </span>
              <span className="text-[10px] text-[#181a19]/50 block">
                {formatNaira(cropMetric.revenuePerHectare)}/ha
              </span>
            </div>

            <div className="p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/5">
              <span className="text-[10px] text-[#181a19]/60 block uppercase font-medium">
                Total Direct Cost
              </span>
              <span className="text-sm font-bold font-mono tabular-nums text-rose-600 mt-0.5 block">
                {formatNaira(cropMetric.directExpenses)}
              </span>
              <span className="text-[10px] text-[#181a19]/50 block">
                {formatNaira(cropMetric.costPerKgProduced, true)}/kg
              </span>
            </div>

            <div className="p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/5">
              <span className="text-[10px] text-[#181a19]/60 block uppercase font-medium">
                Gross Profit
              </span>
              <span
                className={`text-sm font-bold font-mono tabular-nums mt-0.5 block ${
                  cropMetric.grossProfit >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                }`}
              >
                {cropMetric.grossProfit >= 0 ? '+' : ''}
                {formatNaira(cropMetric.grossProfit)}
              </span>
              <span className="text-[10px] text-[#181a19]/60 block">
                {cropMetric.grossMarginPercent.toFixed(1)}% margin
              </span>
            </div>

            <div className="p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/5">
              <span className="text-[10px] text-[#181a19]/60 block uppercase font-medium">
                Harvest Yield
              </span>
              <span className="text-sm font-bold font-mono tabular-nums text-[#181a19] mt-0.5 block">
                {formatWeight(cropMetric.harvestedKg)}
              </span>
              <span className="text-[10px] text-[#181a19]/60 block">
                {cropMetric.yieldMTPerHa.toFixed(1)} MT/ha
              </span>
            </div>
          </div>

          {/* Cost Allocation Waterfall */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#181a19] uppercase tracking-wider">
                Direct Cost Allocation by Operational Bucket
              </h4>
              <span className="text-xs font-mono text-[#181a19]/60">
                Total: {formatNaira(cropMetric.directExpenses)}
              </span>
            </div>

            {/* Stacked Percentage Bar */}
            {totalCost > 0 && (
              <div className="h-4 w-full bg-[#181a19]/10 rounded-full overflow-hidden flex shadow-inner">
                {costItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`${item.color} h-full transition-all`}
                    style={{ width: `${item.pct}%` }}
                    title={`${item.category}: ${formatNaira(item.amount)} (${item.pct.toFixed(1)}%)`}
                  />
                ))}
              </div>
            )}

            {/* Cost Details Table */}
            <div className="divide-y divide-[#181a19]/5 border border-[#181a19]/10 rounded-xl overflow-hidden bg-white">
              {costItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 text-xs hover:bg-[#fafaf7] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                    <span className="font-medium text-[#181a19] truncate">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 font-mono tabular-nums text-xs">
                    <span className="text-[#181a19]/50 w-12 text-right">
                      {item.pct.toFixed(1)}%
                    </span>
                    <span className="font-semibold text-[#181a19] w-28 text-right">
                      {formatNaira(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakeven Threshold Indicator */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-950">
              <span>Enterprise Breakeven Intelligence</span>
              <span className="text-[11px] font-normal text-emerald-800">
                Margin of Safety:{' '}
                {cropMetric.averageSellingPricePerKg > 0 && cropMetric.breakevenPricePerKg > 0
                  ? `${Math.round(
                      ((cropMetric.averageSellingPricePerKg - cropMetric.breakevenPricePerKg) /
                        cropMetric.averageSellingPricePerKg) *
                        100
                    )}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-emerald-900">
              <div>
                <span className="text-[11px] text-emerald-800/80 block">
                  Minimum Floor Price to Break Even:
                </span>
                <span className="font-mono font-bold text-emerald-950 text-sm">
                  {formatNaira(cropMetric.breakevenPricePerKg, true)} / kg
                </span>
                <span className="text-[10px] text-emerald-800/70 block mt-0.5">
                  Actual realized price: {formatNaira(cropMetric.averageSellingPricePerKg, true)}/kg
                </span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-800/80 block">
                  Minimum Yield Required to Break Even:
                </span>
                <span className="font-mono font-bold text-emerald-950 text-sm">
                  {formatWeight(cropMetric.breakevenYieldKgPerHa)} / ha
                </span>
                <span className="text-[10px] text-emerald-800/70 block mt-0.5">
                  Actual harvested: {formatWeight(cropMetric.yieldKgPerHa)}/ha
                </span>
              </div>
            </div>
          </div>

          {/* Raw Logged Transactions List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#181a19] uppercase tracking-wider">
              Underlying Cost Invoices ({cropExpenses.length})
            </h4>
            <div className="max-h-44 overflow-y-auto divide-y divide-[#181a19]/5 border border-[#181a19]/10 rounded-xl bg-white text-xs">
              {cropExpenses.length === 0 ? (
                <div className="p-4 text-center text-[#181a19]/50">No expenses tied to this crop.</div>
              ) : (
                cropExpenses.map((exp) => (
                  <div key={exp.id} className="p-2.5 flex items-center justify-between hover:bg-[#fafaf7]">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-[#181a19] truncate">{exp.description}</p>
                      <p className="text-[10px] text-[#181a19]/50">
                        {exp.date} · {exp.vendor} · {exp.receiptNumber || 'No voucher'}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-rose-600 shrink-0 tabular-nums">
                      {formatNaira(exp.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#fafaf7] border-t border-[#181a19]/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
