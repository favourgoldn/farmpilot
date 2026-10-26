import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Modal } from '../common/Modal';
import { StockMovementType } from '../../types/farm';

interface RecordStockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedInventoryId?: string;
}

export const RecordStockMovementModal: React.FC<RecordStockMovementModalProps> = ({
  isOpen,
  onClose,
  preSelectedInventoryId,
}) => {
  const { inventory, fields, crops, userProfile, addStockMovement } = useFarm();

  const [selectedItemId, setSelectedItemId] = useState(
    preSelectedInventoryId || inventory[0]?.id || ''
  );
  const [type, setType] = useState<StockMovementType>('OUT');
  const [quantity, setQuantity] = useState<string>('5');
  const [fieldId, setFieldId] = useState<string>(fields[0]?.id || '');
  const [cropId, setCropId] = useState<string>(crops[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [performedBy, setPerformedBy] = useState<string>(
    userProfile?.displayName || 'Farm Agronomist'
  );
  const [reason, setReason] = useState<string>('');

  const selectedItem = inventory.find((i) => i.id === selectedItemId);
  const currentStock = selectedItem?.currentStock || 0;
  const unit = selectedItem?.unit || 'units';

  const numQty = parseFloat(quantity) || 0;
  let simulatedNewStock = currentStock;
  if (type === 'IN') {
    simulatedNewStock = currentStock + numQty;
  } else if (type === 'OUT' || type === 'RETURN') {
    simulatedNewStock = Math.max(0, currentStock - numQty);
  } else if (type === 'ADJUSTMENT') {
    simulatedNewStock = numQty;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || numQty <= 0) return;

    await addStockMovement({
      farmId: selectedItem.farmId,
      inventoryItemId: selectedItem.id,
      inventoryItemName: selectedItem.name,
      type,
      quantity: numQty,
      unit,
      previousStock: currentStock,
      newStock: simulatedNewStock,
      date,
      cropId: type === 'OUT' ? cropId || undefined : undefined,
      fieldId: type === 'OUT' ? fieldId || undefined : undefined,
      performedBy,
      reason: reason || (type === 'OUT' ? 'Field chemical / fertilizer application' : 'Warehouse stock update'),
      referenceType: type === 'OUT' ? 'field_application' : type === 'IN' ? 'purchase' : 'audit_reconciliation',
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Warehouse Stock Movement"
      subtitle="Track agricultural input usage, field application, or physical inventory audit counts"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
            Warehouse Stock Item *
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
          >
            {inventory.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.currentStock} {item.unit} available)
              </option>
            ))}
          </select>
        </div>

        {/* Movement Type Badges */}
        <div>
          <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1.5">
            Movement Transaction Type *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: 'OUT',
                label: 'Field Application (OUT)',
                desc: 'Dispensed to parcel/crop',
                icon: ArrowUpRight,
                color: 'text-blue-700 bg-blue-50 border-blue-200',
              },
              {
                id: 'IN',
                label: 'Stock Inbound (IN)',
                desc: 'Restock / Purchase delivery',
                icon: ArrowDownRight,
                color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
              },
              {
                id: 'ADJUSTMENT',
                label: 'Audit Adjustment',
                desc: 'Spoilage, bag tear, recount',
                icon: RefreshCw,
                color: 'text-amber-700 bg-amber-50 border-amber-200',
              },
              {
                id: 'RETURN',
                label: 'Vendor Return',
                desc: 'Sent back to supplier',
                icon: AlertCircle,
                color: 'text-purple-700 bg-purple-50 border-purple-200',
              },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = type === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setType(m.id as StockMovementType)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `${m.color} ring-2 ring-[#16422b]`
                      : 'bg-white border-[#181a19]/10 hover:bg-[#fafaf7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs mb-0.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.id}</span>
                  </div>
                  <p className="text-[10px] text-[#181a19]/60 leading-tight">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity & Impact Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              {type === 'ADJUSTMENT' ? 'New Reconciled Stock Quantity *' : 'Quantity to Move *'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                required
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono tabular-nums text-sm font-semibold focus:outline-none focus:border-[#16422b]"
              />
              <span className="text-xs font-mono font-medium text-[#181a19]/70 px-2.5 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg whitespace-nowrap">
                {unit}
              </span>
            </div>
          </div>

          {/* Stock Balance Simulation */}
          <div className="p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/10 text-xs font-mono">
            <div className="flex items-center justify-between text-[#181a19]/60 text-[11px] mb-1">
              <span>Current In Warehouse:</span>
              <span>{currentStock} {unit}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="text-[#181a19]">Resulting Balance:</span>
              <span className={simulatedNewStock <= (selectedItem?.reorderLevel || 0) ? 'text-rose-600' : 'text-emerald-700'}>
                {simulatedNewStock} {unit}
              </span>
            </div>
          </div>
        </div>

        {/* If OUT: Field & Crop Enterprise Selection */}
        {type === 'OUT' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-200">
            <div>
              <label className="block text-[10px] font-semibold text-blue-900 mb-1">
                Target Field Block (Where applied)
              </label>
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.size} {f.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-blue-900 mb-1">
                Target Crop Enterprise
              </label>
              <select
                value={cropId}
                onChange={(e) => setCropId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs"
              >
                <option value="">General Field Preparation</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.variety})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Movement Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Agronomist / Operator In-Charge *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Babajide Soyemi"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
            Reason / Agronomic Purpose
          </label>
          <input
            type="text"
            placeholder="e.g. Basal fertilizer broadcast on Field A maize ridges; 2 bags per ha"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Post Stock Movement</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
