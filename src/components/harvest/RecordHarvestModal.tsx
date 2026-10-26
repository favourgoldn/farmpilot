import { Calendar, CheckCircle2, MapPin, Scale, Warehouse, X } from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { QuantityUnit } from '../../types/farm';

interface RecordHarvestModalProps {
  onClose: () => void;
  defaultCropId?: string;
}

const STORAGE_LOCATIONS = [
  'Central Silo Store A (Ventilated Grain Bin)',
  'Central Silo Store B',
  'Cold Shade Packhouse #1 (Perishables)',
  'Cold Shade Packhouse #2 (Ventilated Crates)',
  'Field Loading Pad A',
  'Field Loading Pad B (Immediate Mill Dispatch)',
  'Agronomy Research Seed Store',
  'General Estate Warehouse Bay 1',
];

export const RecordHarvestModal: React.FC<RecordHarvestModalProps> = ({
  onClose,
  defaultCropId,
}) => {
  const { crops, fields, addHarvest } = useFarm();

  const [cropId, setCropId] = useState(defaultCropId || crops[0]?.id || '');
  const selectedCrop = crops.find((c) => c.id === cropId);

  const [fieldId, setFieldId] = useState(
    selectedCrop?.fieldId || fields[0]?.id || ''
  );

  const currentYear = new Date().getFullYear().toString().slice(-2);
  const cropPrefix = (selectedCrop?.name || 'CROP').slice(0, 4).toUpperCase();
  const [batchNumber, setBatchNumber] = useState(
    `LOT-${cropPrefix}-${currentYear}${Math.floor(10 + Math.random() * 90)}`
  );

  const [harvestDate, setHarvestDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const defaultUnit: QuantityUnit =
    selectedCrop?.category === 'Cereal / Grain'
      ? 'bags_50kg'
      : selectedCrop?.category === 'Horticulture / Veg'
      ? 'crates_25kg'
      : selectedCrop?.category === 'Root & Tuber'
      ? 'metric_tons'
      : 'kg';

  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<QuantityUnit>(defaultUnit);
  const [gradeQuality, setGradeQuality] = useState<
    'Grade A Premium' | 'Grade B Standard' | 'Industrial Processing'
  >('Grade A Premium');

  const [moisturePercent, setMoisturePercent] = useState(
    selectedCrop?.category === 'Cereal / Grain' ? '12.5' : ''
  );
  const [storageLocation, setStorageLocation] = useState(STORAGE_LOCATIONS[0]);
  const [estimatedMarketPrice, setEstimatedMarketPrice] = useState(
    defaultUnit === 'bags_50kg' ? '24000' : defaultUnit === 'crates_25kg' ? '10500' : '110000'
  );
  const [notes, setNotes] = useState('');

  const handleCropChange = (newCropId: string) => {
    setCropId(newCropId);
    const crop = crops.find((c) => c.id === newCropId);
    if (crop) {
      setFieldId(crop.fieldId);
      const prefix = crop.name.slice(0, 4).toUpperCase();
      setBatchNumber(`LOT-${prefix}-${currentYear}${Math.floor(10 + Math.random() * 90)}`);

      const u: QuantityUnit =
        crop.category === 'Cereal / Grain'
          ? 'bags_50kg'
          : crop.category === 'Horticulture / Veg'
          ? 'crates_25kg'
          : 'metric_tons';
      setUnit(u);
      setEstimatedMarketPrice(u === 'bags_50kg' ? '24000' : u === 'crates_25kg' ? '10500' : '110000');
      if (crop.category === 'Cereal / Grain') {
        setMoisturePercent('12.5');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropId || !fieldId || !quantity) return;

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) return;

    await addHarvest({
      cropId,
      fieldId,
      date: harvestDate,
      quantity: parsedQty,
      unit,
      gradeQuality,
      storageLocation,
      batchNumber: batchNumber.trim() || undefined,
      moisturePercent: moisturePercent ? parseFloat(moisturePercent) : undefined,
      estimatedMarketPricePerUnit: estimatedMarketPrice ? parseFloat(estimatedMarketPrice) : undefined,
      remainingQuantity: parsedQty,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a19]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-[#181a19]/10 max-w-lg w-full overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#181a19]/10 bg-[#fafaf7]">
          <div>
            <h3 className="text-sm font-bold text-[#181a19]">
              Log Harvested Farm Yield
            </h3>
            <p className="text-xs text-[#181a19]/60">
              Record physical produce gathered into storage and available inventory.
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
          {/* Crop & Field Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Harvested Crop *
              </label>
              <select
                value={cropId}
                onChange={(e) => handleCropChange(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.variety})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Field Plot Parcel *
              </label>
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.size} {f.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Batch Number & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Lot / Batch Code
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Harvest Date *
              </label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Harvested Quantity *
              </label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                placeholder="e.g. 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Packaging / Quantity Unit *
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

          {/* Quality Grade & Moisture % */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Quality Inspection Grade
              </label>
              <select
                value={gradeQuality}
                onChange={(e) => setGradeQuality(e.target.value as any)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Grade A Premium">Grade A Premium (Clean, Uniform)</option>
                <option value="Grade B Standard">Grade B Standard</option>
                <option value="Industrial Processing">Industrial Processing Grade</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Moisture Content (% Target ≤13%)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 12.5"
                value={moisturePercent}
                onChange={(e) => setMoisturePercent(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          {/* Storage Location & Market Price Valuation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Storage Facility / Silo Location
              </label>
              <select
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                {STORAGE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Est. Selling Price (₦ per unit)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 24000"
                value={estimatedMarketPrice}
                onChange={(e) => setEstimatedMarketPrice(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#181a19]/80 mb-1">
              Field Gang & Harvest Observation Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Excellent ear fill, dry threshing completed on solar floor A."
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
              Log Yield to Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
