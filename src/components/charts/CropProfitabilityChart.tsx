import React from 'react';
import { CropProfitMetric, formatNaira, formatWeight } from '../../utils/finance';

interface Props {
  metrics: CropProfitMetric[];
}

export const CropProfitabilityChart: React.FC<Props> = ({ metrics }) => {
  const maxRevenue = Math.max(...metrics.map((m) => m.recognizedRevenue), 1000000);

  return (
    <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#181a19] tracking-tight">
            Crop Profitability Comparison
          </h3>
          <p className="text-xs text-[#181a19]/60">
            Recognized sales revenue versus direct input costs by crop enterprise
          </p>
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="h-52 flex flex-col items-center justify-center text-center p-6 bg-[#fafaf7] rounded-lg border border-dashed border-[#181a19]/15">
          <p className="text-sm font-medium text-[#181a19]/70">No crop enterprises registered</p>
          <p className="text-xs text-[#181a19]/50 mt-1">
            Register your planted crops and link sales and expenses to unlock margin intelligence.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {metrics.map((crop) => {
            const revBarWidth = Math.min(100, (crop.recognizedRevenue / maxRevenue) * 100);
            const expBarWidth = Math.min(100, (crop.directExpenses / maxRevenue) * 100);

            return (
              <div
                key={crop.cropId}
                className="p-3 rounded-lg border border-[#181a19]/5 bg-[#fafaf7]/50 hover:bg-[#fafaf7] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-[#181a19]">
                      {crop.cropName}
                    </span>
                    <span className="text-xs text-[#181a19]/50 ml-2 font-normal">
                      {crop.variety} · {crop.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono tabular-nums shrink-0">
                    <span className="text-[#181a19]/60">Gross Margin:</span>
                    <span
                      className={`font-semibold ${
                        crop.grossProfit >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                      }`}
                    >
                      {crop.grossProfit >= 0 ? '+' : ''}
                      {crop.grossMarginPercent.toFixed(1)}% ({formatNaira(crop.grossProfit)})
                    </span>
                  </div>
                </div>

                {/* Comparative Visual Bars */}
                <div className="space-y-1.5 pt-1">
                  {/* Revenue Bar */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-[#181a19]/60 shrink-0">Revenue:</span>
                    <div className="flex-1 bg-[#181a19]/5 h-3 rounded-xs overflow-hidden">
                      <div
                        className="bg-[#16422b] h-full rounded-xs transition-all duration-300"
                        style={{ width: `${Math.max(revBarWidth, 2)}%` }}
                      />
                    </div>
                    <span className="w-24 text-right font-mono tabular-nums text-[#181a19] font-medium shrink-0">
                      {formatNaira(crop.recognizedRevenue)}
                    </span>
                  </div>

                  {/* Direct Expense Bar */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-[#181a19]/60 shrink-0">Direct Cost:</span>
                    <div className="flex-1 bg-[#181a19]/5 h-3 rounded-xs overflow-hidden">
                      <div
                        className="bg-[#d97706] h-full rounded-xs transition-all duration-300"
                        style={{ width: `${Math.max(expBarWidth, 2)}%` }}
                      />
                    </div>
                    <span className="w-24 text-right font-mono tabular-nums text-[#181a19]/70 shrink-0">
                      {formatNaira(crop.directExpenses)}
                    </span>
                  </div>
                </div>

                {/* Additional metrics subtext */}
                <div className="mt-2.5 pt-2 border-t border-[#181a19]/5 flex flex-wrap items-center justify-between text-[11px] text-[#181a19]/60 gap-2">
                  <div>
                    Harvested: <span className="font-mono tabular-nums text-[#181a19]">{formatWeight(crop.harvestedKg)}</span>
                    <span className="mx-1.5 text-[#181a19]/30">·</span>
                    Sold: <span className="font-mono tabular-nums text-[#181a19]">{formatWeight(crop.soldKg)}</span>
                  </div>
                  {crop.costPerKgProduced > 0 && (
                    <div>
                      Unit Production Cost: <span className="font-mono tabular-nums text-[#181a19]">{formatNaira(crop.costPerKgProduced, true)}/kg</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
