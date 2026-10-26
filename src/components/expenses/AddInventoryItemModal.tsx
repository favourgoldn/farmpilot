import React, { useState } from 'react';
import { Package, ShieldAlert, Tag, Building2, MapPin } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Modal } from '../common/Modal';
import { InventoryItem } from '../../types/farm';

interface AddInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: InventoryItem | null;
}

export const AddInventoryItemModal: React.FC<AddInventoryItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { farms, suppliers, addInventoryItem, updateInventoryItem } = useFarm();

  const [formData, setFormData] = useState({
    farmId: itemToEdit?.farmId || farms[0]?.id || 'farm-001',
    name: itemToEdit?.name || '',
    category: (itemToEdit?.category || 'Fertilizer') as InventoryItem['category'],
    currentStock: itemToEdit ? String(itemToEdit.currentStock) : '20',
    unit: itemToEdit?.unit || 'bags (50kg)',
    reorderLevel: itemToEdit ? String(itemToEdit.reorderLevel) : '10',
    costPerUnit: itemToEdit ? String(itemToEdit.costPerUnit) : '38000',
    supplier: itemToEdit?.supplier || suppliers[0]?.name || 'Direct Agro Depot',
    location: itemToEdit?.location || 'Central Farm Store - Bay A',
    notes: itemToEdit?.notes || '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.currentStock) return;

    if (itemToEdit) {
      await updateInventoryItem(itemToEdit.id, {
        farmId: formData.farmId,
        name: formData.name,
        category: formData.category,
        currentStock: parseFloat(formData.currentStock) || 0,
        unit: formData.unit,
        reorderLevel: parseFloat(formData.reorderLevel) || 5,
        costPerUnit: parseFloat(formData.costPerUnit) || 0,
        supplier: formData.supplier,
        location: formData.location,
        notes: formData.notes,
      });
    } else {
      await addInventoryItem({
        farmId: formData.farmId,
        name: formData.name,
        category: formData.category,
        currentStock: parseFloat(formData.currentStock) || 0,
        unit: formData.unit,
        reorderLevel: parseFloat(formData.reorderLevel) || 5,
        costPerUnit: parseFloat(formData.costPerUnit) || 0,
        lastRestocked: new Date().toISOString().split('T')[0],
        supplier: formData.supplier,
        location: formData.location,
        notes: formData.notes,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? 'Edit Warehouse Inventory Item' : 'Add Item to Warehouse Inventory'}
      subtitle="Track agricultural chemicals, fertilizers, seeds, and farm diesel stock"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Item Brand / Commodity Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NPK 15-15-15 Granular Fertilizer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Category Sector *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as InventoryItem['category'] })
              }
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            >
              <option value="Fertilizer">Fertilizer (NPK, Urea, Calcium Nitrate)</option>
              <option value="Agrochemical">Agrochemical (Herbicides, Fungicides, Pesticides)</option>
              <option value="Seed">Certified Seed & Seedlings</option>
              <option value="Fuel / Diesel">Fuel / Diesel (AGO) & Lubricants</option>
              <option value="Equipment Spares">Equipment Spares & Irrigation Parts</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Initial Quantity In Stock *
            </label>
            <input
              type="number"
              step="any"
              required
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono tabular-nums font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Unit of Measurement
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            >
              <option value="bags (50kg)">bags (50kg)</option>
              <option value="bags (10kg)">bags (10kg)</option>
              <option value="litres">litres</option>
              <option value="kg">kg</option>
              <option value="crates (25kg)">crates (25kg)</option>
              <option value="units">units / pieces</option>
              <option value="metric_tons">metric tons</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Reorder Warning Threshold *
            </label>
            <input
              type="number"
              step="any"
              required
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Cost Per Unit (₦) *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 38500"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono tabular-nums"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Preferred Supplier / Vendor
            </label>
            <input
              type="text"
              list="supplier-options"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            />
            <datalist id="supplier-options">
              {suppliers.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Warehouse Storage Location / Bay
            </label>
            <input
              type="text"
              placeholder="e.g. Bay 3 - Ventilated Chemical Lockup"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Handling & Safety Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Keep off damp floors on wooden pallets"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{itemToEdit ? 'Save Changes' : 'Register Stock Item'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
