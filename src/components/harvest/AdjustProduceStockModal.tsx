import { AlertCircle, Scale, X } from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { ProduceAdjustmentReason, QuantityUnit } from '../../types/farm';

interface AdjustProduceStockModalProps {
  onClose: () => void;
  defaultCropId?: string;
}

const ADJUSTMENT_REASONS: { value: ProduceAdjustmentReason; label: string; description: string }[] = [
  {
    value: 'moisture_loss_shrinkage',
    label: 'Moisture Loss & Solar Drying Shrinkage',
    description: 'Natural post-harvest dehydration during silo or drying floor stabilization',
  },
  {
    value: 'sorting_reject',
    label: 'Sorting & Grading Cull Loss',
    description: 'Damaged, undersized, or insect-punctured produce culled during grading',
  },
  {
    value: 'seed_retention',
    label: 'Seed Retention for Next Season Planting',
    description: 'Selected high-quality grains or stems reserved as planting material',
  },
  {
    value: 'internal_consumption',
    label: 'Staff & Farm Internal Consumption',
    description: 'Produce distributed to field workforce or estate canteen',
  },
  {
    value: 'spoilage_damage',
    label: 'Spoilage, Rupture or Rodent Damage',
    description: 'Produce rendered unmarketable during transit or barn storage',
  },
  {
    value: 'physical_audit_reconciliation',
    label: 'Physical Warehouse Audit Reconciliation',
    description: 'Adjustment to match actual physical weighbridge/crate count',
  },
];

export const AdjustProduceStockModal: React.FC<AdjustProduceStockModalProps> = ({
  onClose,
  defaultCropId,
}) => {
  const {
    crops,
    harvests,
    produceStockSummaries,
    addProduceAdjustment,
    userProfile,
  } = useFarm();

  const [cropId, setCropId] = useState(defaultCropId || crops[0]?.id || '');
  const selectedCrop = crops.find((c) => c.id === cropId);
  const stockSummary = produceStockSummaries.find((s) => s.cropId === cropId);

  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<QuantityUnit>(
    stockSummary?.unit || (selectedCrop?.category === 'Cereal / Grain' ? 'bags_50kg' : 'crates_25kg')
  );
  const [reason, setReason] = useState<ProduceAdjustmentReason>('moisture_loss_shrinkage');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [performedBy, setPerformedBy] = useState(
    userProfile?.displayName || 'Chief Agronomist'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropId || !quantity) return;

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) return;

    await addProduceAdjustment({
      cropId,
      quantity: parsedQty,
      unit,
      reason,
      date,
      notes: notes.trim() || undefined,
      performedBy,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a19]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-[#181a19]/10 max-w-md w-full overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#181a19]/10 bg-[#fafaf7]">
          <div>
            <h3 className="text-sm font-bold text-[#181a19]">
              Adjust Produce Stock
            </h3>
            <p className="text-xs text-[#181a19]/60">
              Account for moisture loss, sorting culls, seed retention, or spoilage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#181a19]/40 hover:text-[#181a19] p-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Crop Produce */}
          <div>
            <label className="block font-medium text-[#181a19]/80 mb-1">
              Select Crop Produce *
            </label>
            <select
              value={cropId}
              onChange={(e) => {
                setCropId(e.target.value);
                const s = produceStockSummaries.find((sum) => sum.cropId === e.target.value);
                if (s) setUnit(s.unit);
              }}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            >
              {crops.map((c) => {
                const s = produceStockSummaries.find((sum) => sum.cropId === c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({s ? `${s.availableQuantity} ${s.unit.replace('_', ' ')} on hand` : '0 in stock'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current Stock Banner */}
          {stockSummary && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-900 font-semibold block">
                  Current On-Hand Produce Stock
                </span>
                <span className="text-xs text-emerald-800">
                  {stockSummary.availableQuantity.toLocaleString()} {stockSummary.unit.replace('_', ' ')} available in storage
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-900">
                {stockSummary.stockStatus.toUpperCase().replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Adjustment Reason */}
          <div>
            <label className="block font-medium text-[#181a19]/80 mb-1">
              Reason for Stock Adjustment *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ProduceAdjustmentReason)}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            >
              {ADJUSTMENT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#181a19]/50 mt-1">
              {ADJUSTMENT_REASONS.find((r) => r.value === reason)?.description}
            </p>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Deduction Quantity *
              </label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                max={stockSummary ? stockSummary.availableQuantity : undefined}
                placeholder="e.g. 15"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Measurement Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as QuantityUnit)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="bags_50kg">50kg Sacks / Bags</option>
                <option value="crates_25kg">25kg Crates</option>
                <option value="metric_tons">Metric Tons (1,000 kg)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="tubers">Tubers</option>
              </select>
            </div>
          </div>

          {/* Date & Officer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Date of Occurrence
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Performed / Certified By
              </label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#181a19]/80 mb-1">
              Inspection Notes / Lab Test Reference
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Moisture reduction from 14.5% to 12.8% on drying floor floor A."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#181a19]/60 hover:text-[#181a19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Confirm Stock Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
