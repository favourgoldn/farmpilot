import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Download,
  Building,
  Calendar,
  CreditCard,
  Hash,
  X,
  CheckCircle,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Modal } from '../common/Modal';
import { ReceiptRecord, ExpenseCategory } from '../../types/farm';
import { formatNaira } from '../../utils/finance';

function numberToWords(amount: number): string {
  // Simple readable formatting for Nigerian Naira receipts
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString()} Naira Only`;
}

interface ReceiptVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt?: ReceiptRecord | null;
  mode?: 'view' | 'create';
}

export const ReceiptVoucherModal: React.FC<ReceiptVoucherModalProps> = ({
  isOpen,
  onClose,
  receipt,
  mode = 'view',
}) => {
  const { settings, updateReceipt, addReceipt, farms, suppliers, userProfile } = useFarm();

  const [createForm, setCreateForm] = useState({
    receiptNumber: `VOU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: '',
    vendor: suppliers[0]?.name || 'Local Agricultural Vendor',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'fertilizer_chemicals' as ExpenseCategory,
    paymentMethod: 'Bank Transfer' as const,
    auditStatus: 'verified' as const,
    notes: '',
  });

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const toggleVerification = async () => {
    if (!receipt) return;
    const newStatus = receipt.auditStatus === 'verified' ? 'pending_audit' : 'verified';
    await updateReceipt(receipt.id, {
      auditStatus: newStatus,
      verifiedBy: newStatus === 'verified' ? userProfile?.displayName || 'Audited By Manager' : undefined,
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.amount || !createForm.title) return;

    await addReceipt({
      farmId: farms[0]?.id || 'farm-001',
      receiptNumber: createForm.receiptNumber,
      title: createForm.title,
      vendor: createForm.vendor,
      date: createForm.date,
      amount: parseFloat(createForm.amount),
      category: createForm.category,
      paymentMethod: createForm.paymentMethod,
      auditStatus: createForm.auditStatus,
      verifiedBy: userProfile?.displayName,
      notes: createForm.notes,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Official Receipt Voucher' : 'Agricultural Disbursement & Payment Voucher'}
      subtitle={
        mode === 'create'
          ? 'Generate audited electronic disbursement slip with compliance docket'
          : `Official FarmPilot fiscal voucher docket: ${receipt?.receiptNumber || 'AUDIT'}`
      }
    >
      {mode === 'create' ? (
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
                Receipt / Waybill Slip Number *
              </label>
              <input
                type="text"
                required
                value={createForm.receiptNumber}
                onChange={(e) => setCreateForm({ ...createForm, receiptNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
                Disbursement Category *
              </label>
              <select
                value={createForm.category}
                onChange={(e) =>
                  setCreateForm({ ...createForm, category: e.target.value as ExpenseCategory })
                }
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
              >
                <option value="seeds_seedlings">Certified Seeds & Nursery</option>
                <option value="fertilizer_chemicals">Fertilizer & Chemicals</option>
                <option value="mechanization_fuel">Mechanization, Tractor & Fuel</option>
                <option value="labor">Field Labor & Harvesting Hands</option>
                <option value="logistics_packaging">Logistics, Sacks & Crates</option>
                <option value="lease_utilities">Lease & Utilities</option>
                <option value="other">General Overhead</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Voucher Title / Payment Purpose *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 35 Bags NPK 15-15-15 + Atrazine Herbicide Delivery"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
                Vendor / Payee Name *
              </label>
              <input
                type="text"
                required
                value={createForm.vendor}
                onChange={(e) => setCreateForm({ ...createForm, vendor: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
                Amount Paid (Naira ₦) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 1420000"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono tabular-nums font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={createForm.date}
                onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
                Payment Channel
              </label>
              <select
                value={createForm.paymentMethod}
                onChange={(e) => setCreateForm({ ...createForm, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
              >
                <option value="Bank Transfer">Bank Transfer (NIBSS / NIP)</option>
                <option value="Cash">Cash Disbursement</option>
                <option value="Mobile Money">Mobile Money (POS / Paga)</option>
                <option value="Supplier Credit">Supplier Credit Settlement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Audit Notes / Certification Remark
            </label>
            <input
              type="text"
              placeholder="e.g. Goods received in good condition, weighbridge verified"
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg"
            />
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
              Store Official Voucher
            </button>
          </div>
        </form>
      ) : (
        /* View High-Fidelity Nigerian Official Voucher */
        <div className="space-y-4">
          <div
            id="printable-voucher"
            className="bg-white border-2 border-[#181a19]/15 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden text-xs"
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <span className="text-7xl font-black rotate-[-25deg] tracking-widest uppercase">
                FARMPILOT AUDITED
              </span>
            </div>

            {/* Voucher Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-[#181a19]/15">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16422b]"></span>
                  <h3 className="text-base font-bold text-[#181a19] tracking-tight uppercase">
                    {settings.farmName || 'Alafia Agro Holdings Ltd'}
                  </h3>
                </div>
                <p className="text-[11px] text-[#181a19]/60 mt-0.5">
                  Commercial Estate • {settings.primaryState || 'Oyo State'}, Nigeria
                </p>
                <p className="text-[10px] text-[#181a19]/40 font-mono">
                  Official Agricultural Payment & Disbursement Voucher
                </p>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#fafaf7] border border-[#181a19]/10 font-mono text-xs font-semibold">
                  <Hash className="w-3.5 h-3.5 text-[#16422b]" />
                  <span>{receipt?.receiptNumber || 'VOU-2026-000'}</span>
                </div>
                <p className="text-[11px] text-[#181a19]/60 mt-1.5">
                  Date: <span className="font-semibold text-[#181a19]">{receipt?.date}</span>
                </p>
              </div>
            </div>

            {/* Official Stamp & Status */}
            <div className="my-5 flex flex-wrap items-center justify-between gap-4 p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    receipt?.auditStatus === 'verified'
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800'
                      : 'bg-amber-100/70 border-amber-300 text-amber-800'
                  }`}
                >
                  {receipt?.auditStatus === 'verified' ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-[11px]">
                      {receipt?.auditStatus === 'verified' ? 'Audited & Verified' : 'Audit Check Pending'}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                        receipt?.auditStatus === 'verified'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {receipt?.auditStatus === 'verified' ? 'Compliant' : 'Review'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#181a19]/60">
                    Sign-off: {receipt?.verifiedBy || 'Internal Operations Lead'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#181a19]/50 block">Disbursed Amount</span>
                <span className="text-xl font-bold font-mono text-[#16422b]">
                  {formatNaira(receipt?.amount || 0)}
                </span>
              </div>
            </div>

            {/* Details Table */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#181a19]/50 block uppercase tracking-wider">
                    Paid To / Vendor:
                  </span>
                  <span className="font-bold text-[#181a19] text-sm">
                    {receipt?.vendor}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#181a19]/50 block uppercase tracking-wider">
                    Disbursement Sector:
                  </span>
                  <span className="font-semibold text-[#181a19] capitalize">
                    {receipt?.category?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#181a19]/5">
                <div>
                  <span className="text-[10px] text-[#181a19]/50 block uppercase tracking-wider">
                    Payment Method:
                  </span>
                  <span className="font-semibold text-[#181a19]">
                    {receipt?.paymentMethod}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#181a19]/50 block uppercase tracking-wider">
                    Purpose / Voucher Title:
                  </span>
                  <span className="font-medium text-[#181a19]">
                    {receipt?.title}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-[#fafaf7] rounded-lg border border-[#181a19]/5 text-[11px]">
                <span className="text-[#181a19]/50 block text-[9px] uppercase tracking-wider mb-0.5">
                  Amount in Words:
                </span>
                <span className="font-mono font-medium text-[#181a19]">
                  {numberToWords(receipt?.amount || 0)}
                </span>
              </div>

              {receipt?.notes && (
                <div className="text-[11px] text-[#181a19]/70 italic">
                  Note: "{receipt.notes}"
                </div>
              )}
            </div>

            {/* Approver Signature Block */}
            <div className="pt-6 border-t-2 border-dashed border-[#181a19]/15 grid grid-cols-2 gap-8 text-[11px]">
              <div>
                <p className="text-[10px] text-[#181a19]/50 uppercase tracking-wider mb-8">
                  Prepared By (Accounts Officer / Cashier):
                </p>
                <div className="border-t border-[#181a19]/30 pt-1 flex justify-between text-[#181a19]/80 font-mono text-[10px]">
                  <span>Sign & Date</span>
                  <span>{receipt?.date}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[#181a19]/50 uppercase tracking-wider mb-8">
                  Authorized & Certified (Farm Manager / Agronomist):
                </p>
                <div className="border-t border-[#181a19]/30 pt-1 flex justify-between text-[#181a19]/80 font-mono text-[10px]">
                  <span>{receipt?.verifiedBy || settings.managerName}</span>
                  <span>Certified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={toggleVerification}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                receipt?.auditStatus === 'verified'
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>
                {receipt?.auditStatus === 'verified'
                  ? 'Mark for Re-audit'
                  : 'Certify as Audited & Verified'}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/15 hover:bg-[#fafaf7] rounded-lg transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Voucher</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
