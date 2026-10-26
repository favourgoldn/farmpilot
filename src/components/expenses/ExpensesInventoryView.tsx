import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileCheck2,
  Filter,
  Layers,
  MapPin,
  Package,
  Phone,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Trash2,
  Truck,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import {
  Expense,
  ExpenseCategory,
  InventoryItem,
  PurchaseRecord,
  ReceiptRecord,
  StockMovement,
  StockMovementType,
  Supplier,
} from '../../types/farm';
import { formatNaira } from '../../utils/finance';
import { RecordSupplierModal } from './RecordSupplierModal';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { RecordStockMovementModal } from './RecordStockMovementModal';
import { ReceiptVoucherModal } from './ReceiptVoucherModal';
import { EditExpenseModal } from './EditExpenseModal';
import { AddInventoryItemModal } from './AddInventoryItemModal';

type ActiveTab =
  | 'expenses'
  | 'suppliers'
  | 'purchases'
  | 'movements'
  | 'inventory'
  | 'receipts';

export const ExpensesInventoryView: React.FC = () => {
  const {
    expenses,
    inventory,
    crops,
    fields,
    suppliers,
    purchases,
    stockMovements,
    receipts,
    deleteExpense,
    deleteSupplier,
    deletePurchase,
    deleteStockMovement,
    deleteInventoryItem,
    openModal,
    showToast,
    setActiveReceipt,
    setActiveExpenseToEdit,
    updatePurchase,
    updateInventoryItem,
  } = useFarm();

  const [activeTab, setActiveTab] = useState<ActiveTab>('expenses');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedMovementType, setSelectedMovementType] = useState<string>('all');
  const [selectedAuditStatus, setSelectedAuditStatus] = useState<string>('all');

  // Modals local controls
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [preSelectedSupplierId, setPreSelectedSupplierId] = useState<string | undefined>(undefined);

  const [isStockMovementModalOpen, setIsStockMovementModalOpen] = useState(false);
  const [preSelectedInventoryId, setPreSelectedInventoryId] = useState<string | undefined>(undefined);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptToView, setReceiptToView] = useState<ReceiptRecord | null>(null);
  const [receiptModalMode, setReceiptModalMode] = useState<'view' | 'create'>('view');

  const [isExpenseEditModalOpen, setIsExpenseEditModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [inventoryItemToEdit, setInventoryItemToEdit] = useState<InventoryItem | null>(null);

  // 1. Expenses filtering
  const filteredExpenses = expenses.filter((e) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      e.description.toLowerCase().includes(query) ||
      e.vendor.toLowerCase().includes(query) ||
      (e.receiptNumber && e.receiptNumber.toLowerCase().includes(query));
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesStatus =
      selectedPaymentStatus === 'all' || e.paymentStatus === selectedPaymentStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaidExpenses = filteredExpenses
    .filter((e) => e.paymentStatus === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPendingExpenses = filteredExpenses
    .filter((e) => e.paymentStatus === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  // 2. Suppliers filtering
  const filteredSuppliers = suppliers.filter((s) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(query) ||
      s.contactPerson.toLowerCase().includes(query) ||
      s.state.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query);
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // 3. Purchases filtering
  const filteredPurchases = purchases.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      p.purchaseOrderNumber.toLowerCase().includes(query) ||
      p.supplierName.toLowerCase().includes(query) ||
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(query));
    const matchesPayment =
      selectedPaymentStatus === 'all' || p.paymentStatus === selectedPaymentStatus;
    return matchesSearch && matchesPayment;
  });

  const totalPurchasesAmount = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalOutstandingPurchases = filteredPurchases.reduce(
    (sum, p) => sum + p.outstandingAmount,
    0
  );

  // 4. Stock Movements filtering
  const filteredMovements = stockMovements.filter((m) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      m.inventoryItemName.toLowerCase().includes(query) ||
      m.performedBy.toLowerCase().includes(query) ||
      m.reason.toLowerCase().includes(query);
    const matchesType = selectedMovementType === 'all' || m.type === selectedMovementType;
    return matchesSearch && matchesType;
  });

  // 5. Inventory filtering
  const filteredInventory = inventory.filter((i) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      i.name.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query) ||
      i.supplier.toLowerCase().includes(query);
    const matchesCat = selectedCategory === 'all' || i.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const lowStockItems = inventory.filter((i) => i.currentStock <= i.reorderLevel);
  const totalInventoryAssetValue = inventory.reduce(
    (sum, i) => sum + i.currentStock * i.costPerUnit,
    0
  );

  // 6. Receipts filtering
  const filteredReceipts = receipts.filter((r) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      r.receiptNumber.toLowerCase().includes(query) ||
      r.vendor.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query);
    const matchesAudit =
      selectedAuditStatus === 'all' || r.auditStatus === selectedAuditStatus;
    return matchesSearch && matchesAudit;
  });

  const totalVerifiedReceiptsAmount = receipts
    .filter((r) => r.auditStatus === 'verified')
    .reduce((sum, r) => sum + r.amount, 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Category',
      'Description',
      'Amount (NGN)',
      'Vendor',
      'Payment Method',
      'Status',
      'Receipt Number',
    ];
    const rows = filteredExpenses.map((e) => [
      e.date,
      e.category,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.vendor.replace(/"/g, '""')}"`,
      e.paymentMethod,
      e.paymentStatus,
      e.receiptNumber || 'N/A',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `farmpilot-expense-audit-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Expense Audit Exported',
      message: 'Downloaded CSV spreadsheet of filtered expenses.',
    });
  };

  // Helper to open voucher modal for an expense with receipt
  const handleViewReceiptForExpense = (expense: Expense) => {
    const matched = receipts.find(
      (r) => r.receiptNumber === expense.receiptNumber || r.linkedExpenseId === expense.id
    );
    if (matched) {
      setReceiptToView(matched);
      setReceiptModalMode('view');
      setIsReceiptModalOpen(true);
    } else {
      // Create on the fly display receipt
      setReceiptToView({
        id: `rcpt-exp-${expense.id}`,
        farmId: expense.farmId,
        receiptNumber: expense.receiptNumber || `VOU-${expense.id.slice(-6).toUpperCase()}`,
        title: expense.description,
        vendor: expense.vendor,
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
        paymentMethod: expense.paymentMethod,
        auditStatus: expense.paymentStatus === 'paid' ? 'verified' : 'pending_audit',
        verifiedBy: 'Adebayo Ogunlesi',
        notes: expense.notes || `Audited payment voucher for ${expense.description}`,
      });
      setReceiptModalMode('view');
      setIsReceiptModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16422b]"></span>
            <h2 className="text-xl font-bold text-[#181a19] tracking-tight">
              Expenses & Inventory Intelligence
            </h2>
          </div>
          <p className="text-xs text-[#181a19]/60 mt-0.5">
            Audit operational cash disbursements, manage input suppliers, procurement orders, warehouse stock movements, and compliance receipts
          </p>
        </div>

        {/* Global Action Buttons based on Active Tab */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'expenses' && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#181a19] bg-white border border-[#181a19]/15 hover:bg-[#fafaf7] rounded-lg transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#181a19]/60" />
                <span>Export Ledger CSV</span>
              </button>
              <button
                onClick={() => openModal('add_expense')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Expense</span>
              </button>
            </>
          )}

          {activeTab === 'suppliers' && (
            <button
              onClick={() => {
                setSupplierToEdit(null);
                setIsSupplierModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Supplier</span>
            </button>
          )}

          {activeTab === 'purchases' && (
            <button
              onClick={() => {
                setPreSelectedSupplierId(undefined);
                setIsPurchaseModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Purchase Order</span>
            </button>
          )}

          {activeTab === 'movements' && (
            <button
              onClick={() => {
                setPreSelectedInventoryId(undefined);
                setIsStockMovementModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Stock Movement</span>
            </button>
          )}

          {activeTab === 'inventory' && (
            <button
              onClick={() => {
                setInventoryItemToEdit(null);
                setIsInventoryModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock Commodity</span>
            </button>
          )}

          {activeTab === 'receipts' && (
            <button
              onClick={() => {
                setReceiptToView(null);
                setReceiptModalMode('create');
                setIsReceiptModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Receipt Voucher</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1 p-1 bg-white border border-[#181a19]/10 rounded-xl overflow-x-auto shadow-xs">
        {[
          { id: 'expenses', label: 'Expenses Ledger', count: expenses.length, icon: Receipt },
          { id: 'suppliers', label: 'Suppliers Directory', count: suppliers.length, icon: Building2 },
          { id: 'purchases', label: 'Purchase Invoices', count: purchases.length, icon: ShoppingCart },
          { id: 'movements', label: 'Stock Movements', count: stockMovements.length, icon: Layers },
          {
            id: 'inventory',
            label: 'Warehouse Inventory',
            count: inventory.length,
            icon: Package,
            alert: lowStockItems.length,
          },
          { id: 'receipts', label: 'Receipts & Vouchers', count: receipts.length, icon: FileCheck2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as ActiveTab);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#16422b] text-white shadow-xs'
                  : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#181a19]/10 text-[#181a19]/70'
                }`}
              >
                {tab.count}
              </span>
              {tab.alert !== undefined && tab.alert > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                  {tab.alert}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: EXPENSES LEDGER
         ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Total Operational Spend
              </span>
              <span className="text-xl font-bold font-mono text-[#181a19]">
                {formatNaira(totalExpenseAmount)}
              </span>
              <p className="text-[10px] text-[#181a19]/50 mt-1">
                Across {filteredExpenses.length} transactions
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Cash Settled & Disbursed
              </span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {formatNaira(totalPaidExpenses)}
              </span>
              <p className="text-[10px] text-emerald-700/80 mt-1">Paid via transfer or cash</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Pending Accounts Payable
              </span>
              <span className="text-xl font-bold font-mono text-amber-700">
                {formatNaira(totalPendingExpenses)}
              </span>
              <p className="text-[10px] text-amber-700/80 mt-1">
                {filteredExpenses.filter((e) => e.paymentStatus === 'pending').length} unliquidated liabilities
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Vouchers with Official Slips
              </span>
              <span className="text-xl font-bold font-mono text-[#16422b]">
                {filteredExpenses.filter((e) => e.receiptNumber).length} / {filteredExpenses.length}
              </span>
              <p className="text-[10px] text-[#16422b]/80 mt-1">Audit-ready compliance</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search expense description, vendor, or receipt slip..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Spend Categories</option>
                <option value="seeds_seedlings">Certified Seeds & Nursery</option>
                <option value="fertilizer_chemicals">Fertilizer & Chemicals</option>
                <option value="mechanization_fuel">Mechanization & Fuel</option>
                <option value="labor">Field Labor</option>
                <option value="logistics_packaging">Logistics & Packaging</option>
                <option value="lease_utilities">Lease & Utilities</option>
                <option value="other">General Overhead</option>
              </select>

              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Settled (Paid)</option>
                <option value="pending">Pending Liability</option>
              </select>
            </div>
          </div>

          {/* Expense Ledger Table */}
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#181a19]/15">
              <Receipt className="w-8 h-8 text-[#181a19]/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#181a19]">No expenses logged</p>
              <p className="text-xs text-[#181a19]/50 mt-1 mb-4">
                Record farm input purchases, labor payroll, or machinery hire to maintain accurate profit intelligence.
              </p>
              <button
                onClick={() => openModal('add_expense')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] rounded-lg"
              >
                + Record Expense
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#181a19]/10 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Enterprise</th>
                      <th className="py-3 px-4">Vendor / Payee</th>
                      <th className="py-3 px-4 text-right">Amount (₦)</th>
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Receipt Voucher</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {filteredExpenses.map((expense) => {
                      const linkedCrop = crops.find((c) => c.id === expense.cropId);
                      return (
                        <tr
                          key={expense.id}
                          className="hover:bg-[#fafaf7]/70 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono tabular-nums text-[#181a19]/70 whitespace-nowrap">
                            {expense.date}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-[#181a19] capitalize px-2 py-0.5 rounded-md bg-[#fafaf7] border border-[#181a19]/10">
                              {expense.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#181a19]">
                            {expense.description}
                          </td>
                          <td className="py-3 px-4 text-[#181a19]/70">
                            {linkedCrop ? linkedCrop.name : 'Estate Overhead'}
                          </td>
                          <td className="py-3 px-4 text-[#181a19]/80 font-medium">
                            {expense.vendor}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#181a19]">
                            {formatNaira(expense.amount)}
                          </td>
                          <td className="py-3 px-4 text-[#181a19]/70">
                            {expense.paymentMethod}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                                expense.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {expense.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {expense.receiptNumber ? (
                              <button
                                onClick={() => handleViewReceiptForExpense(expense)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#16422b]/10 text-[#16422b] hover:bg-[#16422b]/20 font-mono text-[11px] font-semibold transition-colors"
                                title="View official payment voucher docket"
                              >
                                <FileCheck2 className="w-3 h-3" />
                                <span>{expense.receiptNumber}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleViewReceiptForExpense(expense)}
                                className="text-[10px] text-[#181a19]/40 hover:text-[#16422b] hover:underline"
                              >
                                + Generate Voucher
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setExpenseToEdit(expense);
                                  setIsExpenseEditModalOpen(true);
                                }}
                                className="text-[#181a19]/40 hover:text-[#16422b] p-1 transition-colors"
                                title="Edit expense entry"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteExpense(expense.id)}
                                className="text-[#181a19]/30 hover:text-rose-600 p-1 transition-colors"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: SUPPLIERS DIRECTORY
         ========================================================================= */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Approved Vendors
              </span>
              <span className="text-xl font-bold font-mono text-[#181a19]">
                {suppliers.length}
              </span>
              <p className="text-[10px] text-[#181a19]/50 mt-1">Input dealers & contractors</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Credit Agreement Partners
              </span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {suppliers.filter((s) => s.paymentTerms.includes('Net') || s.paymentTerms.includes('Credit')).length}
              </span>
              <p className="text-[10px] text-emerald-700/80 mt-1">Net 15 / 30-day deferred billing</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Active In-State Partners
              </span>
              <span className="text-xl font-bold font-mono text-[#16422b]">
                {suppliers.filter((s) => s.state.includes('Oyo')).length} in Oyo State
              </span>
              <p className="text-[10px] text-[#16422b]/80 mt-1">Localized supply chain</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Top Rated (5 Stars)
              </span>
              <span className="text-xl font-bold font-mono text-amber-600">
                {suppliers.filter((s) => s.rating === 5).length} Vendors
              </span>
              <p className="text-[10px] text-amber-700/80 mt-1">High germination & prompt delivery</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search supplier name, representative, state, or input type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              <option value="all">All Supply Sectors</option>
              <option value="Fertilizer & Chemicals">Fertilizer & Chemicals</option>
              <option value="Seeds & Seedlings">Seeds & Seedlings</option>
              <option value="Machinery & Tractor Hire">Machinery & Tractor Hire</option>
              <option value="Labor & Farm Hands">Labor & Farm Hands</option>
              <option value="Fuel & Utilities">Fuel & Utilities</option>
              <option value="Packaging & Logistics">Packaging & Logistics</option>
            </select>
          </div>

          {/* Suppliers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs hover:border-[#16422b]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#fafaf7] text-[#181a19]/70 border border-[#181a19]/10">
                      {supplier.category}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (supplier.rating || 5)
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#181a19] mb-1">
                    {supplier.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#181a19]/70 my-3">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16422b]"></span>
                      <span className="font-semibold text-[#181a19]">{supplier.contactPerson}</span>
                    </p>
                    <p className="flex items-center gap-2 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-[#181a19]/40" />
                      <a href={`tel:${supplier.phone}`} className="hover:text-[#16422b] hover:underline">
                        {supplier.phone}
                      </a>
                    </p>
                    {supplier.email && (
                      <p className="flex items-center gap-2 text-[11px]">
                        <span className="text-[#181a19]/40">@</span>
                        <a href={`mailto:${supplier.email}`} className="hover:text-[#16422b] hover:underline truncate">
                          {supplier.email}
                        </a>
                      </p>
                    )}
                    {supplier.address && (
                      <p className="flex items-center gap-2 text-[11px] text-[#181a19]/60">
                        <MapPin className="w-3 h-3 text-[#181a19]/40 shrink-0" />
                        <span className="truncate">{supplier.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Payment Terms & Bank Info */}
                  <div className="p-2.5 bg-[#fafaf7] rounded-lg border border-[#181a19]/5 text-[11px] space-y-1 font-mono">
                    <div className="flex justify-between items-center text-[#181a19]/70">
                      <span>Terms:</span>
                      <span className="font-semibold text-[#16422b]">{supplier.paymentTerms}</span>
                    </div>
                    {supplier.bankName && (
                      <div className="flex justify-between items-center text-[#181a19]/60 text-[10px]">
                        <span>Bank:</span>
                        <span>{supplier.bankName} • {supplier.accountNumber}</span>
                      </div>
                    )}
                  </div>

                  {supplier.notes && (
                    <p className="text-[11px] text-[#181a19]/60 italic mt-2.5 line-clamp-2">
                      "{supplier.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-[#181a19]/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setPreSelectedSupplierId(supplier.id);
                      setIsPurchaseModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-md transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Create PO</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSupplierToEdit(supplier);
                        setIsSupplierModalOpen(true);
                      }}
                      className="p-1.5 text-[#181a19]/40 hover:text-[#16422b] rounded-md transition-colors"
                      title="Edit supplier profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSupplier(supplier.id)}
                      className="p-1.5 text-[#181a19]/30 hover:text-rose-600 rounded-md transition-colors"
                      title="Remove supplier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PURCHASES & PROCUREMENT INVOICES
         ========================================================================= */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Total Purchase Commitments
              </span>
              <span className="text-xl font-bold font-mono text-[#181a19]">
                {formatNaira(totalPurchasesAmount)}
              </span>
              <p className="text-[10px] text-[#181a19]/50 mt-1">Across all procurement POs</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Outstanding Payables
              </span>
              <span className="text-xl font-bold font-mono text-amber-700">
                {formatNaira(totalOutstandingPurchases)}
              </span>
              <p className="text-[10px] text-amber-700/80 mt-1">Pending vendor settlements</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Received & Restocked
              </span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {purchases.filter((p) => p.deliveryStatus === 'received').length} Orders
              </span>
              <p className="text-[10px] text-emerald-700/80 mt-1">Safe in warehouse storage</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Pending Physical Deliveries
              </span>
              <span className="text-xl font-bold font-mono text-blue-700">
                {purchases.filter((p) => p.deliveryStatus === 'pending').length} Orders
              </span>
              <p className="text-[10px] text-blue-700/80 mt-1">In transit from depots</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search PO number, supplier, or invoice reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Unpaid Credit</option>
            </select>
          </div>

          {/* Purchases List */}
          <div className="space-y-3">
            {filteredPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-[#16422b]/10 text-[#16422b]">
                      {purchase.purchaseOrderNumber}
                    </span>
                    <span className="font-bold text-sm text-[#181a19]">
                      {purchase.supplierName}
                    </span>
                    <span className="text-[11px] text-[#181a19]/50 font-mono">
                      • {purchase.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        purchase.deliveryStatus === 'received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {purchase.deliveryStatus.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        purchase.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : purchase.paymentStatus === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {purchase.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items itemization pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {purchase.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-1 rounded bg-[#fafaf7] border border-[#181a19]/10 text-[#181a19]"
                    >
                      <span className="font-bold">{item.quantity} {item.unit}</span> {item.name} @ {formatNaira(item.unitPrice)}
                    </span>
                  ))}
                </div>

                {/* Amounts Breakdown Bar */}
                <div className="pt-2 border-t border-[#181a19]/5 flex flex-wrap items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-4 text-[11px] font-mono">
                    <span className="text-[#181a19]/60">
                      Total: <span className="font-bold text-[#181a19]">{formatNaira(purchase.totalAmount)}</span>
                    </span>
                    <span className="text-emerald-700">
                      Paid: <span className="font-bold">{formatNaira(purchase.amountPaid)}</span>
                    </span>
                    {purchase.outstandingAmount > 0 && (
                      <span className="text-rose-600 font-bold">
                        Payable: {formatNaira(purchase.outstandingAmount)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {purchase.deliveryStatus === 'pending' && (
                      <button
                        onClick={async () => {
                          await updatePurchase(purchase.id, { deliveryStatus: 'received' });
                          showToast({
                            type: 'success',
                            title: 'Delivery Confirmed',
                            message: `Order ${purchase.purchaseOrderNumber} marked as received into warehouse.`,
                          });
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        Confirm Receipt & Restock
                      </button>
                    )}

                    {purchase.receiptNumber && (
                      <button
                        onClick={() => {
                          const rcpt = receipts.find((r) => r.receiptNumber === purchase.receiptNumber);
                          if (rcpt) {
                            setReceiptToView(rcpt);
                            setReceiptModalMode('view');
                            setIsReceiptModalOpen(true);
                          }
                        }}
                        className="flex items-center gap-1 text-[11px] font-medium text-[#16422b] hover:underline"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Voucher ({purchase.receiptNumber})</span>
                      </button>
                    )}

                    <button
                      onClick={() => deletePurchase(purchase.id)}
                      className="p-1 text-[#181a19]/30 hover:text-rose-600 transition-colors"
                      title="Delete PO"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: STOCK MOVEMENTS AUDIT TRAIL
         ========================================================================= */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Total Material Transactions
              </span>
              <span className="text-xl font-bold font-mono text-[#181a19]">
                {stockMovements.length}
              </span>
              <p className="text-[10px] text-[#181a19]/50 mt-1">Full immutable audit history</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Inbound Restocks (IN)
              </span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {stockMovements.filter((m) => m.type === 'IN').length} Logged
              </span>
              <p className="text-[10px] text-emerald-700/80 mt-1">Deliveries received</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Field Applications (OUT)
              </span>
              <span className="text-xl font-bold font-mono text-blue-700">
                {stockMovements.filter((m) => m.type === 'OUT').length} Applied
              </span>
              <p className="text-[10px] text-blue-700/80 mt-1">Dispensed to crops/parcels</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Inventory Adjustments
              </span>
              <span className="text-xl font-bold font-mono text-amber-700">
                {stockMovements.filter((m) => m.type === 'ADJUSTMENT' || m.type === 'RETURN').length}
              </span>
              <p className="text-[10px] text-amber-700/80 mt-1">Damaged sacks or store variances</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search commodity name, operator, or purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <select
              value={selectedMovementType}
              onChange={(e) => setSelectedMovementType(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              <option value="all">All Movement Types</option>
              <option value="IN">Inbound Restock (IN)</option>
              <option value="OUT">Field Application (OUT)</option>
              <option value="ADJUSTMENT">Audit Count Adjustment</option>
              <option value="RETURN">Supplier Return</option>
            </select>
          </div>

          {/* Movement Ledger Table */}
          <div className="bg-white border border-[#181a19]/10 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Input Commodity</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-center">Stock Balance</th>
                    <th className="py-3 px-4">Field Destination</th>
                    <th className="py-3 px-4">Agronomist / Operator</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181a19]/5">
                  {filteredMovements.map((movement) => {
                    const linkedField = fields.find((f) => f.id === movement.fieldId);
                    const linkedCrop = crops.find((c) => c.id === movement.cropId);
                    return (
                      <tr key={movement.id} className="hover:bg-[#fafaf7]/70 transition-colors">
                        <td className="py-3 px-4 font-mono tabular-nums text-[#181a19]/70 whitespace-nowrap">
                          {movement.date}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              movement.type === 'IN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : movement.type === 'OUT'
                                ? 'bg-blue-100 text-blue-800'
                                : movement.type === 'ADJUSTMENT'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {movement.type === 'IN' && <ArrowDownRight className="w-3 h-3" />}
                            {movement.type === 'OUT' && <ArrowUpRight className="w-3 h-3" />}
                            {movement.type === 'ADJUSTMENT' && <RefreshCw className="w-3 h-3" />}
                            {movement.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#181a19]">
                          {movement.inventoryItemName}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-xs whitespace-nowrap">
                          <span
                            className={
                              movement.type === 'IN'
                                ? 'text-emerald-700'
                                : movement.type === 'OUT' || movement.type === 'RETURN'
                                ? 'text-blue-700'
                                : 'text-amber-700'
                            }
                          >
                            {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}
                            {movement.quantity} {movement.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-[#181a19]/70 whitespace-nowrap">
                          {movement.previousStock} → <span className="font-bold text-[#181a19]">{movement.newStock}</span>
                        </td>
                        <td className="py-3 px-4 text-[#181a19]/70">
                          {linkedField ? `${linkedField.name}` : linkedCrop ? `${linkedCrop.name}` : 'Warehouse'}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#181a19]/80">
                          {movement.performedBy}
                        </td>
                        <td className="py-3 px-4 text-[#181a19]/60 max-w-xs truncate" title={movement.reason}>
                          {movement.reason}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteStockMovement(movement.id)}
                            className="text-[#181a19]/30 hover:text-rose-600 transition-colors p-1"
                            title="Delete movement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: WAREHOUSE INVENTORY
         ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Low Stock Warning Banner if any */}
          {lowStockItems.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold text-amber-900">
                    Reorder Alert: {lowStockItems.length} Input Commodities Below Buffer Threshold
                  </span>
                  <p className="text-[11px] text-amber-800/80">
                    {lowStockItems.map((i) => `${i.name} (${i.currentStock} ${i.unit} left)`).join(' • ')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setPreSelectedSupplierId(undefined);
                  setIsPurchaseModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg whitespace-nowrap shadow-xs"
              >
                + Order Supplies Now
              </button>
            </div>
          )}

          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Total Commodities in Warehouse
              </span>
              <span className="text-xl font-bold font-mono text-[#181a19]">
                {inventory.length} Tracked Lines
              </span>
              <p className="text-[10px] text-[#181a19]/50 mt-1">Chemicals, seeds, fuel, fertilizers</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Estimated Warehouse Inventory Asset Value
              </span>
              <span className="text-xl font-bold font-mono text-[#16422b]">
                {formatNaira(totalInventoryAssetValue)}
              </span>
              <p className="text-[10px] text-[#16422b]/80 mt-1">Valued at historical purchase cost</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Stock Reorder Status
              </span>
              <span
                className={`text-xl font-bold font-mono ${
                  lowStockItems.length > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {lowStockItems.length === 0 ? '100% Sufficient' : `${lowStockItems.length} Depleted`}
              </span>
              <p className="text-[10px] text-[#181a19]/50 mt-1">
                Based on active seasonal consumption
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search warehouse item name, category, or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              <option value="all">All Inventory Categories</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Agrochemical">Agrochemical</option>
              <option value="Seed">Seed</option>
              <option value="Fuel / Diesel">Fuel / Diesel</option>
              <option value="Equipment Spares">Equipment Spares</option>
            </select>
          </div>

          {/* Inventory Item Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => {
              const isLow = item.currentStock <= item.reorderLevel;
              const fillPct = Math.min(
                100,
                Math.round((item.currentStock / Math.max(item.currentStock, item.reorderLevel * 2)) * 100)
              );
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between transition-colors ${
                    isLow ? 'border-amber-400 bg-amber-50/20' : 'border-[#181a19]/10'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#fafaf7] text-[#181a19]/70 border border-[#181a19]/10">
                        {item.category}
                      </span>
                      {isLow && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" />
                          Reorder Alert
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#181a19] mb-1">{item.name}</h4>
                    <p className="text-[11px] text-[#181a19]/50 mb-3">
                      Supplier: <span className="text-[#181a19]/80 font-medium">{item.supplier}</span>
                    </p>

                    {/* Stock Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[11px] font-mono text-[#181a19]/60">
                        <span>Buffer Health</span>
                        <span>{item.currentStock} / {item.reorderLevel} min</span>
                      </div>
                      <div className="w-full bg-[#181a19]/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isLow ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs border-t border-[#181a19]/5 pt-2.5 font-mono tabular-nums">
                      <div className="flex items-center justify-between">
                        <span className="text-[#181a19]/60">Current Stock:</span>
                        <span className="font-bold text-base text-[#181a19]">
                          {item.currentStock} {item.unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#181a19]/60">
                        <span>Unit Value:</span>
                        <span>{formatNaira(item.costPerUnit)}</span>
                      </div>

                      <div className="flex items-center justify-between text-[#181a19]/60">
                        <span>Line Value:</span>
                        <span className="font-semibold text-[#16422b]">
                          {formatNaira(item.currentStock * item.costPerUnit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#181a19]/10 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => {
                        setPreSelectedInventoryId(item.id);
                        setIsStockMovementModalOpen(true);
                      }}
                      className="text-[#16422b] font-bold hover:underline flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Log Movement</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setInventoryItemToEdit(item);
                          setIsInventoryModalOpen(true);
                        }}
                        className="text-[#181a19]/40 hover:text-[#16422b]"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteInventoryItem(item.id)}
                        className="text-[#181a19]/30 hover:text-rose-600"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: RECEIPTS & OFFICIAL VOUCHERS
         ========================================================================= */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Total Filed Vouchers
              </span>
              <span className="text-xl font-bold font-mono text-[#181a19]">
                {receipts.length}
              </span>
              <p className="text-[10px] text-[#181a19]/50 mt-1">Official farm expenditure slips</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Audited & Verified Outflow
              </span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {formatNaira(totalVerifiedReceiptsAmount)}
              </span>
              <p className="text-[10px] text-emerald-700/80 mt-1">
                {receipts.filter((r) => r.auditStatus === 'verified').length} verified dockets
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Pending Audit Certification
              </span>
              <span className="text-xl font-bold font-mono text-amber-700">
                {receipts.filter((r) => r.auditStatus === 'pending_audit').length} Slips
              </span>
              <p className="text-[10px] text-amber-700/80 mt-1">Awaiting agronomist sign-off</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10 shadow-xs">
              <span className="text-[11px] font-medium text-[#181a19]/60 block mb-1">
                Audit Compliance Score
              </span>
              <span className="text-xl font-bold font-mono text-[#16422b]">
                {receipts.length > 0
                  ? `${Math.round(
                      (receipts.filter((r) => r.auditStatus === 'verified').length /
                        receipts.length) *
                        100
                    )}%`
                  : '100%'}
              </span>
              <p className="text-[10px] text-[#16422b]/80 mt-1">Fiscal proof coverage</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search voucher number, vendor, or itemization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <select
              value={selectedAuditStatus}
              onChange={(e) => setSelectedAuditStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Audited & Verified</option>
              <option value="pending_audit">Pending Audit</option>
            </select>
          </div>

          {/* Receipts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs hover:border-[#16422b]/30 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#16422b]/10 text-[#16422b]">
                      {receipt.receiptNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                        receipt.auditStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {receipt.auditStatus === 'verified' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      <span>{receipt.auditStatus.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#181a19] mb-1">{receipt.title}</h4>
                  <p className="text-[11px] text-[#181a19]/60 mb-3">
                    Payee / Vendor: <span className="font-medium text-[#181a19]">{receipt.vendor}</span>
                  </p>

                  <div className="p-3 bg-[#fafaf7] rounded-lg border border-[#181a19]/5 space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-[#181a19]/60">
                      <span>Date:</span>
                      <span>{receipt.date}</span>
                    </div>
                    <div className="flex justify-between text-[#181a19]/60">
                      <span>Channel:</span>
                      <span>{receipt.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-[#181a19]/5">
                      <span className="font-semibold text-[#181a19]">Disbursed:</span>
                      <span className="text-base font-bold text-[#16422b]">
                        {formatNaira(receipt.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#181a19]/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setReceiptToView(receipt);
                      setReceiptModalMode('view');
                      setIsReceiptModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#16422b] hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Official Voucher</span>
                  </button>

                  <span className="text-[10px] text-[#181a19]/40 font-mono">
                    {receipt.verifiedBy ? `By: ${receipt.verifiedBy}` : 'Unsigned'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          LOCAL MODALS MOUNTED FOR THIS COMPONENT
         ========================================================================= */}
      <RecordSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        supplierToEdit={supplierToEdit}
      />

      <RecordPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        preSelectedSupplierId={preSelectedSupplierId}
      />

      <RecordStockMovementModal
        isOpen={isStockMovementModalOpen}
        onClose={() => setIsStockMovementModalOpen(false)}
        preSelectedInventoryId={preSelectedInventoryId}
      />

      <ReceiptVoucherModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={receiptToView}
        mode={receiptModalMode}
      />

      <EditExpenseModal
        isOpen={isExpenseEditModalOpen}
        onClose={() => setIsExpenseEditModalOpen(false)}
        expense={expenseToEdit}
      />

      <AddInventoryItemModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        itemToEdit={inventoryItemToEdit}
      />
    </div>
  );
};
