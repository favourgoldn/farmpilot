import React, { useState } from 'react';
import { Expense, SaleRecord } from '../../types/farm';
import { formatNaira } from '../../utils/finance';

interface Props {
  expenses: Expense[];
  sales: SaleRecord[];
}

interface MonthlyData {
  month: string;
  shortMonth: string;
  revenue: number;
  expenses: number;
  net: number;
}

export const RevenueExpensesChart: React.FC<Props> = ({ expenses, sales }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group by last 6 months (May to Oct 2026)
  const months = [
    { key: '2026-05', short: 'May', label: 'May 2026' },
    { key: '2026-06', short: 'Jun', label: 'Jun 2026' },
    { key: '2026-07', short: 'Jul', label: 'Jul 2026' },
    { key: '2026-08', short: 'Aug', label: 'Aug 2026' },
    { key: '2026-09', short: 'Sep', label: 'Sep 2026' },
    { key: '2026-10', short: 'Oct', label: 'Oct 2026' },
  ];

  const data: MonthlyData[] = months.map((m) => {
    const monthSales = sales
      .filter((s) => s.date.startsWith(m.key))
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const monthExpenses = expenses
      .filter((e) => e.date.startsWith(m.key))
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      month: m.label,
      shortMonth: m.short,
      revenue: monthSales,
      expenses: monthExpenses,
      net: monthSales - monthExpenses,
    };
  });

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.revenue, d.expenses)),
    1000000 // minimum ceiling
  );

  const chartHeight = 200;
  const chartWidth = 540;
  const barWidth = 24;
  const groupSpacing = chartWidth / data.length;

  return (
    <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#181a19] tracking-tight">
            Revenue vs. Operating Expenses
          </h3>
          <p className="text-xs text-[#181a19]/60">
            Monthly cash recognition and cost outflow comparison
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-[#181a19]/70 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#16422b]"></span>
            <span>Sales Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#d97706]"></span>
            <span>Operating Expenses</span>
          </div>
        </div>
      </div>

      {data.every((d) => d.revenue === 0 && d.expenses === 0) ? (
        <div className="h-52 flex flex-col items-center justify-center text-center p-6 bg-[#fafaf7] rounded-lg border border-dashed border-[#181a19]/15">
          <p className="text-sm font-medium text-[#181a19]/70">No financial transactions recorded yet</p>
          <p className="text-xs text-[#181a19]/50 mt-1">
            Log your first farm expense or crop sale to generate this monthly comparison chart.
          </p>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 36}`}
            className="w-full h-56 overflow-visible select-none"
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = chartHeight - pct * chartHeight + 10;
              const value = maxVal * pct;
              return (
                <g key={i}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="rgba(24, 26, 25, 0.08)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x="4"
                    y={y - 4}
                    className="text-[9px] fill-[#181a19]/40 font-mono tabular-nums"
                  >
                    {formatNaira(value)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((item, idx) => {
              const centerX = idx * groupSpacing + groupSpacing / 2;
              const revHeight = (item.revenue / maxVal) * chartHeight;
              const expHeight = (item.expenses / maxVal) * chartHeight;

              const revX = centerX - barWidth - 2;
              const expX = centerX + 2;

              const revY = chartHeight - revHeight + 10;
              const expY = chartHeight - expHeight + 10;

              const isHovered = hoveredIndex === idx;

              return (
                <g
                  key={item.month}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-opacity duration-150"
                  style={{ opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1 }}
                >
                  {/* Subtle column highlight hover area */}
                  <rect
                    x={idx * groupSpacing + 4}
                    y={10}
                    width={groupSpacing - 8}
                    height={chartHeight}
                    fill={isHovered ? 'rgba(20, 56, 38, 0.04)' : 'transparent'}
                    rx="4"
                  />

                  {/* Revenue Bar (Forest Green) */}
                  <rect
                    x={revX}
                    y={revY}
                    width={barWidth}
                    height={Math.max(revHeight, 2)}
                    rx="3"
                    fill="#16422b"
                  />

                  {/* Expense Bar (Warm Amber) */}
                  <rect
                    x={expX}
                    y={expY}
                    width={barWidth}
                    height={Math.max(expHeight, 2)}
                    rx="3"
                    fill="#d97706"
                  />

                  {/* X-axis label */}
                  <text
                    x={centerX}
                    y={chartHeight + 28}
                    textAnchor="middle"
                    className={`text-[11px] font-medium transition-colors ${
                      isHovered ? 'fill-[#16422b] font-semibold' : 'fill-[#181a19]/70'
                    }`}
                  >
                    {item.shortMonth}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredIndex !== null && (
            <div className="absolute top-2 right-4 bg-[#181a19] text-white p-3 rounded-lg shadow-lg text-xs pointer-events-none z-10 border border-white/10 animate-in fade-in duration-100">
              <p className="font-semibold text-white/90 mb-1 border-b border-white/15 pb-1">
                {data[hoveredIndex].month}
              </p>
              <div className="space-y-1 font-mono tabular-nums">
                <div className="flex justify-between gap-4">
                  <span className="text-[#86efac]">Revenue:</span>
                  <span className="font-medium">{formatNaira(data[hoveredIndex].revenue)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#fde047]">Expenses:</span>
                  <span className="font-medium">{formatNaira(data[hoveredIndex].expenses)}</span>
                </div>
                <div className="flex justify-between gap-4 pt-1 border-t border-white/15">
                  <span className="text-white/70">Net Result:</span>
                  <span
                    className={`font-semibold ${
                      data[hoveredIndex].net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {data[hoveredIndex].net >= 0 ? '+' : ''}
                    {formatNaira(data[hoveredIndex].net)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
