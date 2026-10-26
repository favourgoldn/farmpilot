import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  DollarSign,
  Package,
  Plus,
  Truck,
  User,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { BuyerCategory, QuantityUnit } from '../../types/farm';
import { formatNaira } from '../../utils/finance';

interface RecordProduceSaleModalProps {
  onClose: () => void;
  defaultCropId?: string;
  defaultCustomerId?: string;
}

export const RecordProduceSaleModal: React.FC<RecordProduceSaleModalProps> = ({
  onClose,
  defaultCropId,
  defaultCustomerId,
}) => {
  const {
    crops,
    harvests,
    customers,
    produceStockSummaries,
    addSale,
    addSalePayment,
    userProfile,
  } = useFarm();

  const [selectedCropId, setSelectedCropId] = useState(
    defaultCropId || crops[0]?.id || ''
  );
  const selectedCrop = crops.find((c) => c.id === selectedCropId);
  const stockSummary = produceStockSummaries.find((s) => s.cropId === selectedCropId);

  // Customer Selection
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    defaultCustomerId || (customers[0]?.id || '')
  );
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Custom buyer override if customer not selected
  const [buyerName, setBuyerName] = useState(selectedCustomer?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(selectedCustomer?.phone || '');
  const [buyerType, setBuyerType] = useState<BuyerCategory>(
    selectedCustomer?.buyerType || 'Off-taker Processor'
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    selectedCustomer?.address || ''
  );

  // Invoice numbers and dates
  const currentYear = new Date().getFullYear();
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${currentYear}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  // Quantity and pricing
  const defaultUnit =
    stockSummary?.unit ||
    (selectedCrop?.category === 'Cereal / Grain'
      ? 'bags_50kg'
      : selectedCrop?.category === 'Horticulture / Veg'
      ? 'crates_25kg'
      : 'metric_tons');

  const [quantitySold, setQuantitySold] = useState('');
  const [unit, setUnit] = useState<QuantityUnit>(defaultUnit);
  const [unitPrice, setUnitPrice] = useState(
    stockSummary?.averageSalePricePerUnit ? stockSummary.averageSalePricePerUnit.toString() : '24000'
  );
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'Bank Transfer' | 'Cash' | 'Mobile Money' | 'Cheque' | 'Credit Terms'
  >('Bank Transfer');

  // Logistics & Waybill
  const [waybillNumber, setWaybillNumber] = useState(
    `WAY-${currentYear}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [bankDetails, setBankDetails] = useState('Access Bank - 0029381742 (FarmPilot Ltd)');
  const [notes, setNotes] = useState('');

  // Handle Customer Change
  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setBuyerName(cust.name);
      setBuyerPhone(cust.phone);
      setBuyerType(cust.buyerType);
      setDeliveryAddress(cust.address || '');

      // Adjust due date based on payment terms
      const d = new Date();
      if (cust.paymentTerms === 'Cash on Delivery') {
        d.setDate(d.getDate());
      } else if (cust.paymentTerms === '7 Days Net') {
        d.setDate(d.getDate() + 7);
      } else if (cust.paymentTerms === '14 Days Net') {
        d.setDate(d.getDate() + 14);
      } else if (cust.paymentTerms === '30 Days Net') {
        d.setDate(d.getDate() + 30);
      }
      setDueDate(d.toISOString().split('T')[0]);
    }
  };

  const parsedQty = parseFloat(quantitySold) || 0;
  const parsedPrice = parseFloat(unitPrice) || 0;
  const totalAmount = parsedQty * parsedPrice;
  const parsedPaid = Math.min(totalAmount, parseFloat(amountPaid) || 0);
  const outstandingAmount = Math.max(0, totalAmount - parsedPaid);

  const isExceedingStock =
    stockSummary && stockSummary.availableQuantity > 0 && parsedQty > stockSummary.availableQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCropId || parsedQty <= 0 || parsedPrice <= 0 || !buyerName.trim()) return;

    // Associated harvest
    const harvest = harvests.find((h) => h.cropId === selectedCropId);

    await addSale({
      cropId: selectedCropId,
      harvestId: harvest?.id,
      customerId: selectedCustomerId || undefined,
      invoiceNumber: invoiceNumber.trim(),
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerType,
      date: saleDate,
      dueDate,
      quantitySold: parsedQty,
      unit,
      unitPrice: parsedPrice,
      totalAmount,
      amountPaid: parsedPaid,
      paymentStatus: outstandingAmount === 0 ? 'paid' : parsedPaid > 0 ? 'partial' : 'outstanding',
      paymentMethod,
      deliveryAddress: deliveryAddress.trim() || undefined,
      waybillNumber: waybillNumber.trim() || undefined,
      vehicleNumber: vehicleNumber.trim() || undefined,
      driverName: driverName.trim() || undefined,
      driverPhone: driverPhone.trim() || undefined,
      bankDetails,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a19]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-[#181a19]/10 max-w-2xl w-full overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#181a19]/10 bg-[#fafaf7]">
          <div>
            <h3 className="text-sm font-bold text-[#181a19]">
              Generate Sales Invoice & Delivery Waybill
            </h3>
            <p className="text-xs text-[#181a19]/60">
              Contract produce delivery, calculate receivables, and record cash collections.
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
          {/* Crop & Live Stock Status */}
          <div className="p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/10 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Crop Produce to Dispatch *
                </label>
                <select
                  value={selectedCropId}
                  onChange={(e) => {
                    setSelectedCropId(e.target.value);
                    const s = produceStockSummaries.find((sum) => sum.cropId === e.target.value);
                    if (s) {
                      setUnit(s.unit);
                      setUnitPrice(s.averageSalePricePerUnit.toString());
                    }
                  }}
                  className="w-full bg-white border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
                >
                  {crops.map((c) => {
                    const s = produceStockSummaries.find((sum) => sum.cropId === c.id);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({s ? `${s.availableQuantity} ${s.unit.replace('_', ' ')} available` : '0 in stock'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Available Warehouse Stock
                </label>
                <div className="px-3 py-2 bg-white rounded-lg border border-[#181a19]/10 flex items-center justify-between">
                  <span className="font-mono tabular-nums font-bold text-[#16422b]">
                    {stockSummary ? `${stockSummary.availableQuantity.toLocaleString()} ${stockSummary.unit.replace('_', ' ')}` : '0 in stock'}
                  </span>
                  <span className="text-[10px] text-[#181a19]/50">
                    Est. Value: {stockSummary ? formatNaira(stockSummary.estimatedValuation) : '₦0'}
                  </span>
                </div>
              </div>
            </div>

            {isExceedingStock && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Warning: Quantity sold ({parsedQty}) exceeds recorded on-hand stock ({stockSummary?.availableQuantity}).
                </span>
              </div>
            )}
          </div>

          {/* Customer / Off-taker Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Select Registered Customer / Off-taker
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="">-- Custom / Direct Buyer (Unregistered) --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.buyerType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Buyer Contact Phone *
              </label>
              <input
                type="text"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          {!selectedCustomerId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Buyer Name / Business *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alhaji Danladi Grain Wholesalers"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Buyer Type
                </label>
                <select
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value as BuyerCategory)}
                  className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
                >
                  <option value="Off-taker Processor">Off-taker Processor</option>
                  <option value="Wholesale Aggregator">Wholesale Aggregator</option>
                  <option value="Open Market Trader">Open Market Trader</option>
                  <option value="Retail Buyer">Retail Buyer</option>
                  <option value="Export Merchant">Export Merchant</option>
                </select>
              </div>
            </div>
          )}

          {/* Invoice # & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Invoice # *
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          {/* Volume, Unit & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Quantity Sold *
              </label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                placeholder="e.g. 200"
                value={quantitySold}
                onChange={(e) => setQuantitySold(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Unit *
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

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Price per Unit (₦) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 24000"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          {/* Financial Calculation Strip */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[10px] text-[#181a19]/60 block">Total Invoice Value</span>
              <span className="text-sm font-bold font-mono tabular-nums text-[#16422b]">
                {formatNaira(totalAmount)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#181a19]/60 block">Cash Received Now</span>
              <span className="text-sm font-bold font-mono tabular-nums text-emerald-800">
                {formatNaira(parsedPaid)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#181a19]/60 block">Receivable Debt</span>
              <span className="text-sm font-bold font-mono tabular-nums text-amber-900">
                {formatNaira(outstandingAmount)}
              </span>
            </div>
          </div>

          {/* Down Payment & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Initial Cash / Wire Received (Naira ₦)
              </label>
              <input
                type="number"
                min="0"
                max={totalAmount}
                placeholder="e.g. 0 if credit, or full amount"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Payment Method / Settlement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Bank Transfer">Bank Wire Transfer</option>
                <option value="Cash">Cash in Hand</option>
                <option value="Mobile Money">Mobile Money (Paga/OPay)</option>
                <option value="Cheque">Bankers Cheque</option>
                <option value="Credit Terms">Agreed Buyer Credit Terms</option>
              </select>
            </div>
          </div>

          {/* Haulage & Waybill Details */}
          <div className="border-t border-[#181a19]/10 pt-3 space-y-3">
            <span className="font-bold text-[#181a19] text-xs flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#16422b]" />
              <span>Logistics, Haulage & Waybill Information</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Waybill #
                </label>
                <input
                  type="text"
                  value={waybillNumber}
                  onChange={(e) => setWaybillNumber(e.target.value)}
                  className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#16422b]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Haulage Truck / Plate #
                </label>
                <input
                  type="text"
                  placeholder="e.g. KTU-882-XA (Mack 30T)"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Driver Name & Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. Musa Abdullahi (0803...)"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Delivery Factory / Warehouse Address
              </label>
              <input
                type="text"
                placeholder="e.g. Shed 44, Mile 12 Market, Lagos"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
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
              Generate Invoice & Waybill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
