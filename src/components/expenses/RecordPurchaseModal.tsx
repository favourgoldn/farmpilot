import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, Calendar, CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Modal } from '../common/Modal';
import { PurchaseItem } from '../../types/farm';
import { formatNaira } from '../../utils/finance';

interface RecordPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedSupplierId?: string;
}

export const RecordPurchaseModal: React.FC<RecordPurchaseModalProps> = ({
  isOpen,
  onClose,
  preSelectedSupplierId,
}) => {
  const { farms, suppliers, inventory, addPurchase } = useFarm();

  const [farmId, setFarmId] = useState(farms[0]?.id || 'farm-001');
  const [supplierId, setSupplierId] = useState(preSelectedSupplierId || suppliers[0]?.id || '');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState(
    `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryStatus, setDeliveryStatus] = useState<'received' | 'pending' | 'partially_received'>('received');
  const [autoRestock, setAutoRestock] = useState(true);

  // Line items state
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: 'pitem-1',
      name: '',
      category: 'Fertilizer',
      quantity: 10,
      unit: 'bags (50kg)',
      unitPrice: 38000,
      totalPrice: 380000,
    },
  ]);

  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('paid');
  const [amountPaid, setAmountPaid] = useState<string>('380000');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash' | 'Mobile Money' | 'Supplier Credit'>(
    'Bank Transfer'
  );
  const [receiptNumber, setReceiptNumber] = useState(
    `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [notes, setNotes] = useState('');

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const grandTotal = subtotal + (deliveryFee || 0);

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? parseFloat(value) || 0 : target.quantity;
      const p = field === 'unitPrice' ? parseFloat(value) || 0 : target.unitPrice;
      target.totalPrice = q * p;
    }

    // If selected from inventory item
    if (field === 'inventoryItemId' && value) {
      const matched = inventory.find((inv) => inv.id === value);
      if (matched) {
        target.name = matched.name;
        target.category = matched.category;
        target.unit = matched.unit;
        target.unitPrice = matched.costPerUnit;
        target.totalPrice = target.quantity * matched.costPerUnit;
      }
    }

    updated[index] = target;
    setItems(updated);

    // Update amount paid default if status is paid
    if (paymentStatus === 'paid') {
      const newSub = updated.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      setAmountPaid(String(newSub + (deliveryFee || 0)));
    }
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: `pitem-${Date.now()}`,
        name: '',
        category: 'Fertilizer',
        quantity: 1,
        unit: 'bags (50kg)',
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    if (paymentStatus === 'paid') {
      const newSub = updated.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      setAmountPaid(String(newSub + (deliveryFee || 0)));
    }
  };

  const handlePaymentStatusChange = (status: 'paid' | 'partial' | 'unpaid') => {
    setPaymentStatus(status);
    if (status === 'paid') {
      setAmountPaid(String(grandTotal));
    } else if (status === 'unpaid') {
      setAmountPaid('0');
    } else if (status === 'partial') {
      setAmountPaid(String(Math.floor(grandTotal / 2)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !items[0].name) return;

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);
    const supplierName = selectedSupplier?.name || 'Direct Agro Supplier';

    const paidNum = paymentStatus === 'unpaid' ? 0 : parseFloat(amountPaid) || 0;
    const outstanding = Math.max(0, grandTotal - paidNum);

    await addPurchase({
      farmId,
      purchaseOrderNumber,
      supplierId,
      supplierName,
      date,
      deliveryDate,
      items,
      subtotal,
      taxOrDeliveryFee: deliveryFee,
      totalAmount: grandTotal,
      amountPaid: paidNum,
      outstandingAmount: outstanding,
      paymentStatus: outstanding === 0 ? 'paid' : paidNum === 0 ? 'unpaid' : 'partial',
      paymentMethod,
      deliveryStatus,
      receiptNumber: receiptNumber || undefined,
      autoRestocked: autoRestock,
      notes,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Purchase Order & Input Procurement"
      subtitle="Issue formal purchase order, auto-restock warehouse commodities, and book accounts payable"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Top Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Select Farm Estate *
            </label>
            <select
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Supplier / Input Vendor *
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name} ({sup.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Purchase Order (PO) Number *
            </label>
            <input
              type="text"
              required
              value={purchaseOrderNumber}
              onChange={(e) => setPurchaseOrderNumber(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Order Date *
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
              Delivery / Arrival Date
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Physical Delivery Status
            </label>
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            >
              <option value="received">Received into Warehouse</option>
              <option value="pending">Pending Transit / Dispatch</option>
              <option value="partially_received">Partially Received</option>
            </select>
          </div>
        </div>

        {/* Dynamic Items Table */}
        <div className="space-y-2 border border-[#181a19]/10 rounded-xl p-3 bg-white">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-[#181a19] flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-[#16422b]" />
              Input Line Items & Quantities
            </span>
            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-1 text-[11px] font-medium text-[#16422b] hover:underline"
            >
              <Plus className="w-3 h-3" />
              <span>+ Add Line Item</span>
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center bg-[#fafaf7] p-2 rounded-lg border border-[#181a19]/10 text-xs"
              >
                <div className="col-span-12 sm:col-span-4">
                  <input
                    type="text"
                    required
                    placeholder="Item Name (e.g. NPK 15-15-15)"
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#181a19]/15 rounded-md text-xs font-medium"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <select
                    value={item.category}
                    onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#181a19]/15 rounded-md text-[11px]"
                  >
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Agrochemical">Agrochemical</option>
                    <option value="Seed">Seed</option>
                    <option value="Fuel / Diesel">Fuel / Diesel</option>
                    <option value="Equipment Spares">Equipment Spares</option>
                  </select>
                </div>

                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#181a19]/15 rounded-md text-xs font-mono tabular-nums"
                  />
                </div>

                <div className="col-span-3 sm:col-span-1">
                  <select
                    value={item.unit}
                    onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                    className="w-full px-1.5 py-1.5 bg-white border border-[#181a19]/15 rounded-md text-[10px]"
                  >
                    <option value="bags (50kg)">bags</option>
                    <option value="litres">litres</option>
                    <option value="kg">kg</option>
                    <option value="units">units</option>
                    <option value="metric_tons">MT</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="number"
                    required
                    placeholder="Price ₦"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#181a19]/15 rounded-md text-xs font-mono tabular-nums"
                  />
                </div>

                <div className="col-span-6 sm:col-span-1 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    disabled={items.length <= 1}
                    className="text-[#181a19]/30 hover:text-rose-600 disabled:opacity-30 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal & Delivery row */}
          <div className="pt-2 border-t border-[#181a19]/10 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[#181a19]/70">Haulage / Waybill Fee (₦):</label>
              <input
                type="number"
                value={deliveryFee || ''}
                onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-24 px-2 py-1 bg-[#fafaf7] border border-[#181a19]/15 rounded-md text-xs font-mono"
              />
            </div>

            <div className="text-right font-mono">
              <span className="text-[11px] text-[#181a19]/60 mr-2">Grand Total:</span>
              <span className="text-sm font-bold text-[#16422b]">
                {formatNaira(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Auto Restock Checkbox */}
        <label className="flex items-center gap-2.5 p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={autoRestock}
            onChange={(e) => setAutoRestock(e.target.checked)}
            className="accent-[#16422b] w-4 h-4 rounded"
          />
          <div>
            <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Automatically Update Warehouse Inventory & Post Stock Movement (IN)
            </span>
            <p className="text-[10px] text-emerald-800/80">
              When checked, increments inventory stock levels and maintains audit traceability.
            </p>
          </div>
        </label>

        {/* Commercial Payment & Receipt Voucher Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/10">
          <div>
            <label className="block text-[10px] font-medium text-[#181a19]/80 mb-1">
              Payment Status *
            </label>
            <div className="flex gap-2">
              {(['paid', 'partial', 'unpaid'] as const).map((st) => (
                <label key={st} className="flex items-center gap-1 text-xs cursor-pointer capitalize">
                  <input
                    type="radio"
                    name="po_payment"
                    checked={paymentStatus === st}
                    onChange={() => handlePaymentStatusChange(st)}
                    className="accent-[#16422b]"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#181a19]/80 mb-1">
              Amount Paid Now (₦)
            </label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              disabled={paymentStatus === 'unpaid'}
              className="w-full px-2.5 py-1.5 bg-white border border-[#181a19]/15 rounded-lg text-xs font-mono disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#181a19]/80 mb-1">
              Payment Channel
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-white border border-[#181a19]/15 rounded-lg text-xs"
            >
              <option value="Bank Transfer">Bank Transfer (NIBSS Instant)</option>
              <option value="Cash">Cash Disbursement</option>
              <option value="Mobile Money">Mobile Money (POS / Paga)</option>
              <option value="Supplier Credit">Supplier Credit (Payable Later)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Receipt / Delivery Waybill Number
            </label>
            <input
              type="text"
              placeholder="e.g. SCN-2026-881 or NOT-99321"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Delivery Inspection & Storage Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Inspected 35 bags intact, stored in Bay B"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            />
          </div>
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
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Confirm Purchase Order</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
