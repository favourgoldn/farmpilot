import { CreditCard, DollarSign, FileCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { SaleRecord } from '../../types/farm';
import { formatNaira } from '../../utils/finance';

interface RecordCustomerPaymentModalProps {
  onClose: () => void;
  defaultSaleId?: string;
}

const NIGERIAN_BANKS = [
  'First Bank of Nigeria',
  'Zenith Bank Plc',
  'Access Bank Plc',
  'Guaranty Trust Bank (GTBank)',
  'United Bank for Africa (UBA)',
  'Fidelity Bank',
  'Stanbic IBTC Bank',
  'Union Bank',
  'Sterling Bank',
  'Wema Bank / ALAT',
  'Opay / PalmPay Microfinance',
  'Direct Cash in Hand',
];

export const RecordCustomerPaymentModal: React.FC<RecordCustomerPaymentModalProps> = ({
  onClose,
  defaultSaleId,
}) => {
  const { sales, recordSalePayment, userProfile, settings, farms } = useFarm();

  // Find default sale or first sale with outstanding balance
  const outstandingSales = sales.filter((s) => s.outstandingAmount > 0);
  const initialSaleId =
    defaultSaleId ||
    outstandingSales[0]?.id ||
    sales[0]?.id ||
    '';

  const [selectedSaleId, setSelectedSaleId] = useState(initialSaleId);
  const selectedSale = sales.find((s) => s.id === selectedSaleId);

  const [amountInput, setAmountInput] = useState(
    selectedSale ? selectedSale.outstandingAmount.toString() : ''
  );
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'Bank Transfer' | 'Cash' | 'Mobile Money' | 'Cheque' | 'POS'
  >('Bank Transfer');
  const [bankName, setBankName] = useState(NIGERIAN_BANKS[0]);
  const [referenceNumber, setReferenceNumber] = useState(
    `NIP-${Math.floor(100000000 + Math.random() * 900000000)}`
  );
  const [accountCredited, setAccountCredited] = useState(
    'FarmPilot Primary Revenue Account'
  );
  const [receivedBy, setReceivedBy] = useState(
    userProfile?.displayName || settings.managerName || 'Farm Manager'
  );
  const [notes, setNotes] = useState('');

  const handleSaleChange = (newSaleId: string) => {
    setSelectedSaleId(newSaleId);
    const sale = sales.find((s) => s.id === newSaleId);
    if (sale) {
      setAmountInput(sale.outstandingAmount.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleId || !amountInput) return;

    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    await recordSalePayment(selectedSaleId, parsedAmount, {
      date: paymentDate,
      paymentMethod,
      bankName: paymentMethod === 'Bank Transfer' ? bankName : undefined,
      referenceNumber: referenceNumber.trim() || undefined,
      accountCredited,
      receivedBy,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a19]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-[#181a19]/10 max-w-md w-full overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#181a19]/10 bg-[#fafaf7]">
          <div>
            <h3 className="text-sm font-bold text-[#181a19]">
              Record Customer Remittance
            </h3>
            <p className="text-xs text-[#181a19]/60">
              Credit inward cash or bank wire against a sales invoice.
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
          {/* Target Invoice Selector */}
          <div>
            <label className="block font-medium text-[#181a19]/80 mb-1">
              Select Sales Invoice *
            </label>
            <select
              value={selectedSaleId}
              onChange={(e) => handleSaleChange(e.target.value)}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            >
              {sales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.invoiceNumber} — {s.buyerName} (Due: {formatNaira(s.outstandingAmount)})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Invoice Quick Summary */}
          {selectedSale && (
            <div className="p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/10 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#181a19]/60">Customer:</span>
                <span className="font-semibold text-[#181a19]">{selectedSale.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#181a19]/60">Invoice Total:</span>
                <span className="font-mono tabular-nums">{formatNaira(selectedSale.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#181a19]/60">Already Paid:</span>
                <span className="font-mono tabular-nums text-emerald-800 font-medium">
                  {formatNaira(selectedSale.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#181a19]/10 pt-1 font-bold text-amber-900">
                <span>Remaining Balance Due:</span>
                <span className="font-mono tabular-nums">
                  {formatNaira(selectedSale.outstandingAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Amount Received (Naira ₦) *
              </label>
              <input
                type="number"
                required
                min="1"
                max={selectedSale ? selectedSale.outstandingAmount : undefined}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Remittance Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          {/* Payment Method and Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Bank Transfer">Bank Wire / NIP Transfer</option>
                <option value="Cash">Cash in Hand</option>
                <option value="Mobile Money">Mobile Money (Paga, etc.)</option>
                <option value="POS">POS Terminal Card</option>
                <option value="Cheque">Bankers Cheque / Draft</option>
              </select>
            </div>

            {paymentMethod === 'Bank Transfer' ? (
              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Settling Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Received By
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
                />
              </div>
            )}
          </div>

          {/* Transaction Reference & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Bank Reference / Slip #
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. NIP-ZEN-9928192"
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Credited Account
              </label>
              <input
                type="text"
                value={accountCredited}
                onChange={(e) => setAccountCredited(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#181a19]/80 mb-1">
              Payment Remarks & Narration
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Final balance settlement cleared via NIP transfer."
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
              Credit Payment Remittance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
