import { CheckCircle2, Download, Printer, ShieldCheck, X } from 'lucide-react';
import React from 'react';
import { BillingTransaction } from '../../types/farm';
import { formatNaira } from '../../services/paystackService';

interface SubscriptionReceiptModalProps {
  transaction: BillingTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionReceiptModal: React.FC<SubscriptionReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const vatAmount = Math.round(transaction.amountNgn * 0.075);
  const subtotal = transaction.amountNgn - vatAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a19]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#181a19]/10 w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions */}
        <div className="p-4 sm:p-5 border-b border-[#181a19]/10 flex items-center justify-between bg-[#fafaf7] rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16422b] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#16422b]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#181a19]">Paystack Payment Receipt</h3>
              <p className="text-[11px] text-[#181a19]/60 font-mono">
                {transaction.receiptNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-[#181a19]/70 hover:text-[#181a19] hover:bg-black/5 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#181a19]/50 hover:text-[#181a19] hover:bg-black/5 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="farmpilot-receipt-print" className="p-6 sm:p-8 space-y-6 text-xs text-[#181a19]">
          {/* Top Brand Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#181a19]/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-[#16422b]">
                  FarmPilot
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-emerald-100 text-[#16422b]">
                  PAID
                </span>
              </div>
              <p className="text-[11px] text-[#181a19]/60 mt-0.5">
                Smart Farm Management & Profit Intelligence
              </p>
              <p className="text-[10px] text-[#181a19]/40 font-mono mt-1">
                FarmPilot Agribusiness Solutions Ltd • RC 1948201
              </p>
            </div>

            <div className="sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified by Paystack</span>
              </div>
              <p className="text-[10px] text-[#181a19]/50 mt-1 font-mono">
                Date: {new Date(transaction.paidAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Customer & Transaction Meta Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#181a19]/50 block">
                Billed To
              </span>
              <p className="font-bold text-xs mt-0.5">{transaction.farmName || 'Commercial Farm'}</p>
              <p className="text-[#181a19]/70 text-[11px]">{transaction.customerName}</p>
              <p className="text-[#181a19]/60 text-[11px] truncate">{transaction.customerEmail}</p>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#181a19]/50 block">
                Transaction Details
              </span>
              <p className="text-[11px] mt-0.5">
                <span className="text-[#181a19]/60">Channel: </span>
                <span className="font-medium capitalize">{transaction.channel.replace('_', ' ')}</span>
              </p>
              <p className="text-[11px]">
                <span className="text-[#181a19]/60">Reference: </span>
                <span className="font-mono font-medium">{transaction.reference}</span>
              </p>
              {transaction.bankName && (
                <p className="text-[11px] text-[#181a19]/70">
                  <span className="text-[#181a19]/60">Institution: </span>
                  {transaction.bankName}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#181a19]/10 text-[10px] uppercase font-semibold text-[#181a19]/50">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Cycle</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181a19]/5">
                <tr>
                  <td className="py-3">
                    <p className="font-semibold text-[#181a19]">
                      {transaction.planName} Plan Subscription
                    </p>
                    <p className="text-[11px] text-[#181a19]/60">
                      {transaction.description}
                    </p>
                  </td>
                  <td className="py-3 text-center capitalize font-medium text-[#181a19]/70">
                    {transaction.billingCycle}
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-[#181a19]">
                    {formatNaira(subtotal)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="mt-4 pt-3 border-t border-[#181a19]/10 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#181a19]/70">
                <span>Subtotal (Net of VAT)</span>
                <span className="font-mono">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#181a19]/70">
                <span>Nigerian VAT (7.5%)</span>
                <span className="font-mono">{formatNaira(vatAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#16422b] pt-2 border-t border-[#181a19]/10">
                <span>Total Amount Paid (NGN)</span>
                <span className="font-mono">{formatNaira(transaction.amountNgn)}</span>
              </div>
            </div>
          </div>

          {/* Verification Footer Notes */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-[#143826] space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Electronic Tax Receipt</span>
            </p>
            <p className="text-[#143826]/80 text-[10.5px]">
              This automated payment receipt confirms that your FarmPilot commercial subscription has been successfully provisioned. All estate limits and team permissions are active immediately.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-[#181a19]/10 bg-[#fafaf7] flex items-center justify-between rounded-b-2xl">
          <span className="text-[11px] text-[#181a19]/50 font-mono">
            Status: Confirmed / Settled
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
