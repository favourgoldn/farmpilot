import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../../types/farm';
import { formatNaira } from '../../utils/finance';

interface Props {
  expenses: Expense[];
}

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; color: string; short: string }
> = {
  fertilizer_chemicals: {
    label: 'Fertilizer & Crop Protection',
    short: 'Fertilizer & Chemicals',
    color: '#16422b', // Dark Forest Green
  },
  seeds_seedlings: {
    label: 'Certified Seeds & Nursery',
    short: 'Seeds & Seedlings',
    color: '#2e7d32', // Rich Green
  },
  mechanization_fuel: {
    label: 'Mechanization, Tillage & Fuel',
    short: 'Tractor & Fuel',
    color: '#d97706', // Warm Amber
  },
  labor: {
    label: 'Field & Seasonal Harvest Labor',
    short: 'Labor Wages',
    color: '#b45309', // Ochre
  },
  logistics_packaging: {
    label: 'Produce Bags, Crates & Haulage',
    short: 'Logistics & Crates',
    color: '#475569', // Slate
  },
  lease_utilities: {
    label: 'Land Lease, Water & Energy',
    short: 'Lease & Utilities',
    color: '#64748b',
  },
  day_old_chicks: {
    label: 'Day-Old Chicks & Flock Stocking',
    short: 'DOC / Birds',
    color: '#e11d48', // Crimson Rose
  },
  poultry_feed: {
    label: 'Poultry Feed & Concentrates',
    short: 'Poultry Feed',
    color: '#ea580c', // Bright Orange
  },
  veterinary_vaccines: {
    label: 'Vaccines, Vet Care & Biologicals',
    short: 'Vaccines & Vet',
    color: '#0284c7', // Sky Blue
  },
  poultry_medication: {
    label: 'Medications & Anti-Stress Supplements',
    short: 'Medications',
    color: '#0d9488', // Teal
  },
  poultry_bedding_litter: {
    label: 'Wood Shavings & Pen Litter',
    short: 'Bedding & Litter',
    color: '#a16207', // Gold Amber
  },
  heating_brooding_fuel: {
    label: 'Charcoal, Gas & Brooding Heating',
    short: 'Brooding Heating',
    color: '#c2410c', // Deep Orange
  },
  biosecurity_cleaning: {
    label: 'Biosecurity, Footbaths & Disinfectants',
    short: 'Biosecurity',
    color: '#4338ca', // Indigo
  },
  poultry_equipment: {
    label: 'Feeders, Drinkers & Pen Equipment',
    short: 'Pen Equipment',
    color: '#4f46e5', // Violet
  },
  poultry_labor: {
    label: 'Poultry Attendants & Pen Labor',
    short: 'Pen Attendants',
    color: '#7c3aed', // Purple
  },
  poultry_packaging: {
    label: 'Egg Paper Crates & Bird Crates',
    short: 'Egg Crates / Boxes',
    color: '#78716c', // Stone
  },
  other: {
    label: 'Tools & Miscellaneous Maintenance',
    short: 'Sundry / Other',
    color: '#94a3b8',
  },
};

export const ExpenseBreakdownChart: React.FC<Props> = ({ expenses }) => {
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const breakdown = (Object.keys(CATEGORY_META) as ExpenseCategory[])
    .map((cat) => {
      const catExpenses = expenses.filter((e) => e.category === cat);
      const amount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      const count = catExpenses.length;
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        category: cat,
        amount,
        count,
        percentage,
        ...CATEGORY_META[cat],
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#181a19] tracking-tight">
            Operating Expense Breakdown
          </h3>
          <p className="text-xs text-[#181a19]/60">
            Categorized input costs & field operation expenditures
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#181a19]/60">Total Cost:</span>
          <p className="text-sm font-semibold text-[#181a19] font-mono tabular-nums">
            {formatNaira(totalExpense)}
          </p>
        </div>
      </div>

      {breakdown.length === 0 ? (
        <div className="h-52 flex flex-col items-center justify-center text-center p-6 bg-[#fafaf7] rounded-lg border border-dashed border-[#181a19]/15">
          <p className="text-sm font-medium text-[#181a19]/70">No expenses on record</p>
          <p className="text-xs text-[#181a19]/50 mt-1">
            Track seed purchases, tractor hire, or fertilizer inputs to see your expense distribution.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Segmented Progress Bar */}
          <div className="h-4 w-full rounded-md overflow-hidden flex bg-[#fafaf7] border border-[#181a19]/10">
            {breakdown.map((item) => (
              <div
                key={item.category}
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
                title={`${item.short}: ${formatNaira(item.amount)} (${item.percentage.toFixed(1)}%)`}
                className="h-full transition-all duration-200 cursor-pointer hover:opacity-90"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === item.category ? null : item.category
                  )
                }
              />
            ))}
          </div>

          {/* Category List */}
          <div className="space-y-2 pt-1">
            {breakdown.map((item) => {
              const isSelected = selectedCategory === item.category;
              return (
                <div
                  key={item.category}
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : item.category)
                  }
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#16422b]/5 border border-[#16422b]/20'
                      : 'hover:bg-[#fafaf7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <span className="font-medium text-[#181a19]">{item.short}</span>
                      <span className="text-[#181a19]/40 ml-1.5 hidden sm:inline">
                        ({item.count} {item.count === 1 ? 'entry' : 'entries'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                    <span className="font-medium text-[#181a19]">
                      {formatNaira(item.amount)}
                    </span>
                    <span className="text-[#181a19]/50 w-11 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
