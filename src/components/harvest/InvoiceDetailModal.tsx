import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileCheck,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  Truck,
  User,
  X,
} from 'lucide-react';
import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { formatNaira, formatWeight } from '../../utils/finance';

interface InvoiceDetailModalProps {
  onClose: () => void;
  onRecordPayment?: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  onClose,
  onRecordPayment,
}) => {
  const {
    activeInvoiceToView,
    crops,
    harvests,
    customers,
    settings,
    farms,
  } = useFarm();

  if (!activeInvoiceToView) return null;

  const sale = activeInvoiceToView;
  const crop = crops.find((c) => c.id === sale.cropId);
  const harvest = harvests.find((h) => h.id === sale.harvestId);
  const customer = customers.find((c) => c.id === sale.customerId || c.name === sale.buyerName);
  const farm = farms[0];

  const isOverdue =
    sale.dueDate &&
    sale.outstandingAmount > 0 &&
    new Date(sale.dueDate).getTime() < new Date().getTime();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a19]/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#181a19]/10 max-w-3xl w-full overflow-hidden my-6 print:shadow-none print:border-none print:my-0">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#fafaf7] border-b border-[#181a19]/10 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[#16422b]">
              {sale.invoiceNumber}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase ${
                sale.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-[#16422b]'
                  : isOverdue
                  ? 'bg-rose-100 text-rose-800'
                  : sale.paymentStatus === 'partial'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-blue-100 text-blue-900'
              }`}
            >
              {isOverdue ? 'OVERDUE' : sale.paymentStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {sale.outstandingAmount > 0 && onRecordPayment && (
              <button
                type="button"
                onClick={onRecordPayment}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>+ Credit Payment</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/15 hover:bg-[#fafaf7] rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#181a19]/70" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[#181a19]/40 hover:text-[#181a19] p-1.5 transition-colors"
              aria-label="Close invoice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-8 space-y-6 text-[#181a19]">
          {/* Header & Watermark */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#181a19]/10 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-lg bg-[#16422b] text-white flex items-center justify-center font-bold text-sm tracking-wider">
                  FP
                </span>
                <h1 className="text-xl font-bold tracking-tight text-[#181a19]">
                  {farm?.name || settings.farmName || 'FarmPilot Agro Holdings'}
                </h1>
              </div>
              <p className="text-xs text-[#181a19]/60 max-w-sm">
                {farm?.locationDetails || 'Commercial Agro-Industrial Estate'}, {farm?.lga ? `${farm.lga}, ` : ''}{farm?.state || settings.primaryState}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#181a19]/60 mt-2">
                <span>Phone: {settings.phone || '+234 803 000 0000'}</span>
                <span>•</span>
                <span>Email: {settings.email || 'accounts@farmpilot.ng'}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs uppercase font-bold tracking-wider text-[#16422b] block">
                COMMERCIAL SALES INVOICE
              </span>
              <p className="text-xl font-mono font-bold text-[#181a19] mt-0.5">
                {sale.invoiceNumber}
              </p>
              <div className="mt-2 space-y-0.5 text-xs text-[#181a19]/70 font-mono">
                <p>
                  <span className="text-[#181a19]/50 font-sans">Date: </span>
                  {sale.date}
                </p>
                {sale.dueDate && (
                  <p>
                    <span className="text-[#181a19]/50 font-sans">Due Date: </span>
                    {sale.dueDate}
                  </p>
                )}
                {sale.waybillNumber && (
                  <p>
                    <span className="text-[#181a19]/50 font-sans">Waybill #: </span>
                    {sale.waybillNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer / Off-taker Billing & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fafaf7] p-4 rounded-xl border border-[#181a19]/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#181a19]/50 block mb-1">
                Billed To (Customer / Off-taker)
              </span>
              <p className="text-sm font-bold text-[#181a19]">{sale.buyerName}</p>
              <p className="text-xs text-[#181a19]/70 mt-0.5">{sale.buyerType}</p>
              <p className="text-xs text-[#181a19]/70 mt-1">Phone: {sale.buyerPhone}</p>
              {customer?.email && (
                <p className="text-xs text-[#181a19]/70">Email: {customer.email}</p>
              )}
              {customer?.paymentTerms && (
                <p className="text-[11px] text-[#16422b] font-medium mt-1">
                  Agreed Terms: {customer.paymentTerms}
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#181a19]/50 block mb-1">
                Dispatch & Delivery Waybill
              </span>
              <p className="text-xs text-[#181a19]/80">
                <span className="font-semibold">Destination:</span>{' '}
                {sale.deliveryAddress || customer?.address || 'Designated Off-taker Warehouse'}
              </p>
              {sale.vehicleNumber && (
                <p className="text-xs text-[#181a19]/80 mt-1">
                  <span className="font-semibold">Transport Truck:</span> {sale.vehicleNumber}
                </p>
              )}
              {sale.driverName && (
                <p className="text-xs text-[#181a19]/80 mt-0.5">
                  <span className="font-semibold">Driver:</span> {sale.driverName} ({sale.driverPhone || 'N/A'})
                </p>
              )}
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Agricultural commodity inspected & cleared for haulage</span>
              </div>
            </div>
          </div>

          {/* Itemized Harvest Produce Table */}
          <div className="border border-[#181a19]/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                  <th className="py-2.5 px-4">Item & Commodity Description</th>
                  <th className="py-2.5 px-4">Harvest Lot #</th>
                  <th className="py-2.5 px-4 text-center">Quality Grade</th>
                  <th className="py-2.5 px-4 text-right">Volume</th>
                  <th className="py-2.5 px-4 text-right">Unit Price (₦)</th>
                  <th className="py-2.5 px-4 text-right">Total Amount (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181a19]/5">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#181a19]">{crop?.name || 'Commercial Farm Produce'}</p>
                    <p className="text-[11px] text-[#181a19]/60">
                      Variety: {crop?.variety || 'Standard Agribusiness Grade'} · {crop?.category || ''}
                    </p>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#181a19]/80">
                    {harvest?.batchNumber || 'LOT-PROD-CURRENT'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-[#181a19]/5 rounded">
                      {harvest?.gradeQuality || 'Grade A Premium'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    <p className="font-semibold text-[#181a19]">
                      {sale.quantitySold.toLocaleString()} {sale.unit.replace('_', ' ')}
                    </p>
                    <p className="text-[10px] text-[#181a19]/50">
                      ({formatWeight(sale.normalizedKg)})
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-[#181a19]/80">
                    {formatNaira(sale.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#181a19]">
                    {formatNaira(sale.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Totals & Balance Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            {/* Payment Remittance Instructions */}
            <div className="max-w-xs text-xs space-y-1.5">
              <span className="font-bold text-[#181a19] block text-[11px] uppercase tracking-wider">
                Bank Remittance Details
              </span>
              <p className="text-[#181a19]/70 text-[11px]">
                Please remit payments directly to the designated commercial agribusiness account:
              </p>
              <div className="p-3 bg-[#fafaf7] rounded-lg border border-[#181a19]/10 font-mono text-[11px] space-y-0.5">
                <p>
                  <span className="text-[#181a19]/50">Bank:</span> {sale.bankDetails ? sale.bankDetails.split('-')[0] : 'Access Bank Plc'}
                </p>
                <p>
                  <span className="text-[#181a19]/50">Account #:</span> 0029381742
                </p>
                <p>
                  <span className="text-[#181a19]/50">Account Name:</span> {farm?.name || settings.farmName || 'FarmPilot Agro Ventures'}
                </p>
                <p className="text-[10px] text-[#16422b] mt-1">
                  Narration: {sale.invoiceNumber}
                </p>
              </div>
              {sale.notes && (
                <p className="text-[11px] text-[#181a19]/60 italic mt-2">
                  Notes: {sale.notes}
                </p>
              )}
            </div>

            {/* Totals Box */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-[#181a19]/70">
                <span>Subtotal Produce:</span>
                <span className="font-mono tabular-nums">{formatNaira(sale.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#181a19]/70">
                <span>Haulage / Logistics:</span>
                <span className="font-mono tabular-nums text-emerald-800">Included / Arranged</span>
              </div>
              <div className="flex justify-between py-1.5 border-t border-[#181a19]/10 font-bold text-sm text-[#181a19]">
                <span>Total Invoice Value:</span>
                <span className="font-mono tabular-nums text-[#16422b]">{formatNaira(sale.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                <span>Cash Received:</span>
                <span className="font-mono tabular-nums font-semibold">{formatNaira(sale.amountPaid)}</span>
              </div>
              <div className={`flex justify-between py-1.5 px-2.5 rounded font-bold ${
                sale.outstandingAmount > 0 ? 'bg-amber-50 text-amber-900' : 'bg-[#fafaf7] text-[#181a19]/50'
              }`}>
                <span>Outstanding Balance:</span>
                <span className="font-mono tabular-nums">{formatNaira(sale.outstandingAmount)}</span>
              </div>
            </div>
          </div>

          {/* Authorized Signatures & Footer */}
          <div className="border-t border-[#181a19]/10 pt-8 mt-8 grid grid-cols-2 gap-8 text-xs text-[#181a19]/60">
            <div>
              <div className="border-b border-[#181a19]/20 w-40 mb-2"></div>
              <p className="font-semibold text-[#181a19]">{settings.managerName || 'Adebayo Ogunlesi'}</p>
              <p className="text-[11px]">Farm Operations & Accounts Lead</p>
            </div>
            <div className="text-right">
              <div className="border-b border-[#181a19]/20 w-40 mb-2 ml-auto"></div>
              <p className="font-semibold text-[#181a19]">{sale.buyerName}</p>
              <p className="text-[11px]">Receiver / Weighbridge Confirmation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
