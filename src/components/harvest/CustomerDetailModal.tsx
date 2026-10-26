import {
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShoppingBag,
  TrendingUp,
  X,
} from 'lucide-react';
import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { formatNaira, formatWeight } from '../../utils/finance';

interface CustomerDetailModalProps {
  onClose: () => void;
  onNewInvoice?: () => void;
  onRecordPayment?: (saleId: string) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  onClose,
  onNewInvoice,
  onRecordPayment,
}) => {
  const {
    activeCustomerToView,
    sales,
    salePayments,
    crops,
    setActiveInvoiceToView,
  } = useFarm();

  if (!activeCustomerToView) return null;

  const customer = activeCustomerToView;

  // Filter sales for this customer
  const customerSales = sales.filter(
    (s) => s.customerId === customer.id || s.buyerName === customer.name
  );

  // Filter payments for this customer
  const customerPayments = salePayments.filter(
    (p) =>
      p.customerId === customer.id ||
      p.customerName === customer.name ||
      customerSales.some((s) => s.id === p.saleId)
  );

  const totalRevenue = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalPaid = customerSales.reduce((sum, s) => sum + s.amountPaid, 0);
  const totalOutstanding = customerSales.reduce((sum, s) => sum + s.outstandingAmount, 0);
  const totalVolumeKg = customerSales.reduce((sum, s) => sum + s.normalizedKg, 0);

  const creditUsagePercent =
    customer.creditLimit > 0
      ? Math.min(100, Math.round((totalOutstanding / customer.creditLimit) * 100))
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a19]/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-[#181a19]/10 max-w-3xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#181a19]/10 bg-[#fafaf7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#16422b]/15 text-[#16422b] flex items-center justify-center font-bold text-xs">
                {customer.name.charAt(0)}
              </span>
              <h3 className="text-sm font-bold text-[#181a19]">{customer.name}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-[#181a19]/5 text-[#181a19]/70">
                {customer.buyerType}
              </span>
            </div>
            <p className="text-xs text-[#181a19]/60 mt-0.5">
              Contact: {customer.contactPerson || 'Procurement Desk'} · {customer.phone}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNewInvoice && (
              <button
                type="button"
                onClick={onNewInvoice}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Invoice</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#181a19]/40 hover:text-[#181a19] p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-[#181a19]">
          {/* Customer Dossier Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#fafaf7] p-3 rounded-xl border border-[#181a19]/10">
              <span className="text-[11px] text-[#181a19]/60 block mb-1">Lifetime Spend</span>
              <p className="text-base font-bold font-mono text-[#16422b] tabular-nums">
                {formatNaira(totalRevenue)}
              </p>
              <span className="text-[10px] text-[#181a19]/50 block mt-0.5">
                {customerSales.length} total orders
              </span>
            </div>

            <div className="bg-[#fafaf7] p-3 rounded-xl border border-[#181a19]/10">
              <span className="text-[11px] text-[#181a19]/60 block mb-1">Cash Collected</span>
              <p className="text-base font-bold font-mono text-emerald-800 tabular-nums">
                {formatNaira(totalPaid)}
              </p>
              <span className="text-[10px] text-emerald-700 block mt-0.5">
                Settled remittances
              </span>
            </div>

            <div className="bg-[#fafaf7] p-3 rounded-xl border border-[#181a19]/10">
              <span className="text-[11px] text-[#181a19]/60 block mb-1">Outstanding Balance</span>
              <p className="text-base font-bold font-mono text-amber-800 tabular-nums">
                {formatNaira(totalOutstanding)}
              </p>
              <span className="text-[10px] text-amber-700 block mt-0.5">
                Receivables due
              </span>
            </div>

            <div className="bg-[#fafaf7] p-3 rounded-xl border border-[#181a19]/10">
              <span className="text-[11px] text-[#181a19]/60 block mb-1">Total Produce Taken</span>
              <p className="text-base font-bold font-mono text-[#181a19] tabular-nums">
                {formatWeight(totalVolumeKg)}
              </p>
              <span className="text-[10px] text-[#181a19]/50 block mt-0.5">
                Cumulative deliveries
              </span>
            </div>
          </div>

          {/* Credit Limit & Terms Strip */}
          <div className="p-4 rounded-xl border border-[#181a19]/10 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-bold text-[#181a19]">Off-taker Credit Line & Terms</span>
                <span className="text-[11px] text-[#181a19]/60 block">
                  Terms: <span className="font-semibold text-[#16422b]">{customer.paymentTerms}</span> · Market Hub: {customer.marketHub || 'N/A'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#181a19]">
                  {formatNaira(totalOutstanding)} / {formatNaira(customer.creditLimit)}
                </span>
                <span className="text-[10px] text-[#181a19]/50 block">
                  {creditUsagePercent}% credit limit used
                </span>
              </div>
            </div>

            <div className="w-full bg-[#181a19]/10 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  creditUsagePercent > 90
                    ? 'bg-rose-500'
                    : creditUsagePercent > 60
                    ? 'bg-amber-500'
                    : 'bg-[#16422b]'
                }`}
                style={{ width: `${Math.min(100, creditUsagePercent)}%` }}
              ></div>
            </div>
          </div>

          {/* Customer Invoices Ledger */}
          <div>
            <h4 className="text-xs font-bold text-[#181a19] mb-2 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#16422b]" />
              <span>Sales Invoices History ({customerSales.length})</span>
            </h4>

            {customerSales.length === 0 ? (
              <p className="text-xs text-[#181a19]/50 italic p-4 bg-[#fafaf7] rounded-xl text-center">
                No sales invoices recorded for this off-taker yet.
              </p>
            ) : (
              <div className="border border-[#181a19]/10 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Crop Produce</th>
                      <th className="py-2.5 px-3 text-right">Invoice Value</th>
                      <th className="py-2.5 px-3 text-right">Balance Due</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {customerSales.map((sale) => {
                      const crop = crops.find((c) => c.id === sale.cropId);
                      return (
                        <tr key={sale.id} className="hover:bg-[#fafaf7]/60">
                          <td className="py-2.5 px-3 font-mono font-medium">{sale.invoiceNumber}</td>
                          <td className="py-2.5 px-3 font-mono text-[#181a19]/70">{sale.date}</td>
                          <td className="py-2.5 px-3 font-medium">{crop?.name || 'Produce'}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#16422b] font-semibold">
                            {formatNaira(sale.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-800 font-medium">
                            {formatNaira(sale.outstandingAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-sm uppercase ${
                                sale.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-[#16422b]'
                                  : sale.paymentStatus === 'partial'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {sale.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setActiveInvoiceToView(sale)}
                                className="px-2 py-1 text-[10px] font-semibold text-[#181a19]/70 hover:text-[#181a19] bg-[#181a19]/5 hover:bg-[#181a19]/10 rounded"
                              >
                                View
                              </button>
                              {sale.outstandingAmount > 0 && onRecordPayment && (
                                <button
                                  onClick={() => onRecordPayment(sale.id)}
                                  className="px-2 py-1 text-[10px] font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded"
                                >
                                  Pay
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Remittance History */}
          {customerPayments.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#181a19] mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-800" />
                <span>Recorded Remittances ({customerPayments.length})</span>
              </h4>
              <div className="border border-[#181a19]/10 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Ref #</th>
                      <th className="py-2 px-3">Invoice</th>
                      <th className="py-2 px-3">Method / Bank</th>
                      <th className="py-2 px-3 text-right">Amount Credited</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {customerPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-mono text-[#181a19]/70">{p.date}</td>
                        <td className="py-2 px-3 font-mono text-[11px]">{p.referenceNumber || 'N/A'}</td>
                        <td className="py-2 px-3 font-mono text-[11px]">{p.invoiceNumber}</td>
                        <td className="py-2 px-3 text-[#181a19]/80">
                          {p.paymentMethod} {p.bankName ? `(${p.bankName})` : ''}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-800 font-semibold">
                          {formatNaira(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
