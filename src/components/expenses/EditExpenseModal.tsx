import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { Modal } from '../common/Modal';
import { Expense, ExpenseCategory } from '../../types/farm';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  const { updateExpense, crops, fields, suppliers } = useFarm();

  const [formData, setFormData] = useState({
    date: expense?.date || new Date().toISOString().split('T')[0],
    category: (expense?.category || 'fertilizer_chemicals') as ExpenseCategory,
    description: expense?.description || '',
    amount: expense?.amount ? String(expense.amount) : '',
    vendor: expense?.vendor || '',
    receiptNumber: expense?.receiptNumber || '',
    cropId: expense?.cropId || '',
    fieldId: expense?.fieldId || '',
    paymentMethod: expense?.paymentMethod || ('Bank Transfer' as const),
    paymentStatus: expense?.paymentStatus || ('paid' as const),
    notes: expense?.notes || '',
  });

  // Keep state synced if expense changes
  React.useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: String(expense.amount),
        vendor: expense.vendor,
        receiptNumber: expense.receiptNumber || '',
        cropId: expense.cropId || '',
        fieldId: expense.fieldId || '',
        paymentMethod: expense.paymentMethod,
        paymentStatus: expense.paymentStatus,
        notes: expense.notes || '',
      });
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    await updateExpense(expense.id, {
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      vendor: formData.vendor,
      receiptNumber: formData.receiptNumber || undefined,
      cropId: formData.cropId || undefined,
      fieldId: formData.fieldId || undefined,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      notes: formData.notes || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Operating Expense"
      subtitle="Revise expense line details, vendor payee, or receipt allocation"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Expense Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as ExpenseCategory })
              }
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              <option value="seeds_seedlings">Certified Seeds & Nursery</option>
              <option value="fertilizer_chemicals">Fertilizer & Chemicals</option>
              <option value="mechanization_fuel">Mechanization, Tractor & Fuel</option>
              <option value="labor">Field Labor & Harvesting Hands</option>
              <option value="logistics_packaging">Logistics, Sacks & Crates</option>
              <option value="lease_utilities">Land Lease & Water/Power</option>
              <option value="other">General Overhead</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Amount (Naira ₦) *
            </label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono tabular-nums font-semibold focus:outline-none focus:border-[#16422b]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
            Description / Itemization *
          </label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Vendor / Payee *
            </label>
            <input
              type="text"
              required
              list="supplier-suggestions"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            />
            <datalist id="supplier-suggestions">
              {suppliers.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Receipt / Slip Number
            </label>
            <input
              type="text"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Associated Crop Enterprise
            </label>
            <select
              value={formData.cropId}
              onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            >
              <option value="">General Farm Overhead</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.variety})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Associated Field Plot
            </label>
            <select
              value={formData.fieldId}
              onChange={(e) => setFormData({ ...formData, fieldId: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            >
              <option value="">All Estate Fields</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.size} {f.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Supplier Credit">Supplier Credit</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Settlement Status
            </label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            >
              <option value="paid">Paid & Settled</option>
              <option value="pending">Pending Liability</option>
            </select>
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
            className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg shadow-xs"
          >
            Save Revisions
          </button>
        </div>
      </form>
    </Modal>
  );
};
