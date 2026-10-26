import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Plus,
  Printer,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  Truck,
  User,
  Users,
  Wallet,
  Warehouse,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { Customer, QuantityUnit, SaleRecord } from '../../types/farm';
import { formatNaira, formatWeight } from '../../utils/finance';
import { AdjustProduceStockModal } from './AdjustProduceStockModal';
import { CustomerDetailModal } from './CustomerDetailModal';
import { CustomerModal } from './CustomerModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { RecordCustomerPaymentModal } from './RecordCustomerPaymentModal';
import { RecordHarvestModal } from './RecordHarvestModal';
import { RecordProduceSaleModal } from './RecordProduceSaleModal';

export const HarvestSalesView: React.FC = () => {
  const {
    harvests,
    sales,
    crops,
    fields,
    customers,
    salePayments,
    produceAdjustments,
    produceStockSummaries,
    deleteHarvest,
    deleteSale,
    deleteCustomer,
    deleteSalePayment,
    deleteProduceAdjustment,
    activeInvoiceToView,
    setActiveInvoiceToView,
    activeCustomerToView,
    setActiveCustomerToView,
    financialSummary,
    showToast,
  } = useFarm();

  // Active top tab
  const [activeTab, setActiveTab] = useState<
    'stock' | 'harvests' | 'invoices' | 'customers' | 'payments'
  >('stock');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'outstanding' | 'overdue'>('all');
  const [cropFilter, setCropFilter] = useState<string>('all');

  // Modal Control States
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalSaleId, setPaymentModalSaleId] = useState<string | undefined>(undefined);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [selectedCropForAction, setSelectedCropForAction] = useState<string | undefined>(undefined);
  const [selectedCustomerForSale, setSelectedCustomerForSale] = useState<string | undefined>(undefined);

  // Available stock aggregation
  const totalAvailableStockKg = produceStockSummaries.reduce((sum, s) => sum + s.availableKg, 0);
  const totalEstimatedProduceValuation = produceStockSummaries.reduce(
    (sum, s) => sum + s.estimatedValuation,
    0
  );

  // Filtered Sales
  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.waybillNumber && s.waybillNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const isOverdue =
      s.dueDate && s.outstandingAmount > 0 && new Date(s.dueDate).getTime() < new Date().getTime();

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'overdue'
        ? isOverdue
        : s.paymentStatus === statusFilter;

    const matchesCrop = cropFilter === 'all' || s.cropId === cropFilter;

    return matchesSearch && matchesStatus && matchesCrop;
  });

  // Filtered Harvests
  const filteredHarvests = harvests.filter((h) => {
    const crop = crops.find((c) => c.id === h.cropId);
    const field = fields.find((f) => f.id === h.fieldId);
    const matchesSearch =
      (crop?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (field?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.batchNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.storageLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCrop = cropFilter === 'all' || h.cropId === cropFilter;

    return matchesSearch && matchesCrop;
  });

  // Filtered Customers
  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.marketHub && c.marketHub.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.buyerType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filtered Payments
  const filteredPayments = salePayments.filter((p) => {
    return (
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const cashCollectionPercentage =
    financialSummary.totalSalesRevenue > 0
      ? Math.round(
          (financialSummary.totalCashReceived / financialSummary.totalSalesRevenue) * 100
        )
      : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#181a19] tracking-tight">
              Harvest & Sales Intelligence
            </h2>
            <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-[#16422b]/10 text-[#16422b]">
              Live Inventory & Ledger
            </span>
          </div>
          <p className="text-xs text-[#181a19]/60 mt-0.5">
            Track harvested produce batches, on-hand warehouse stock, customer off-takers, commercial invoices, and cash remittances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedCropForAction(undefined);
              setIsHarvestModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/15 hover:bg-[#fafaf7] rounded-lg transition-colors shadow-xs"
          >
            <Scale className="w-3.5 h-3.5 text-[#16422b]" />
            <span>Log Harvest</span>
          </button>

          <button
            onClick={() => {
              setSelectedCropForAction(undefined);
              setIsAdjustStockModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/15 hover:bg-[#fafaf7] rounded-lg transition-colors shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
            <span>Adjust Stock</span>
          </button>

          <button
            onClick={() => {
              setCustomerToEdit(null);
              setIsCustomerModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/15 hover:bg-[#fafaf7] rounded-lg transition-colors shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>+ Customer</span>
          </button>

          <button
            onClick={() => {
              setSelectedCropForAction(undefined);
              setSelectedCustomerForSale(undefined);
              setIsSaleModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Sales Invoice</span>
          </button>
        </div>
      </div>

      {/* 5-Card Operational & Financial Reconciliation Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Physical Yield Gathered */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#181a19]/60">Total Harvest Yield</span>
            <Scale className="w-4 h-4 text-[#16422b]/60" />
          </div>
          <p className="text-base font-bold font-mono tabular-nums text-[#181a19]">
            {formatWeight(financialSummary.totalHarvestedKg)}
          </p>
          <span className="text-[11px] text-[#181a19]/50 block mt-1">
            Across {harvests.length} field lots
          </span>
        </div>

        {/* Card 2: On-hand Stock in Storage */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#181a19]/60">Available Produce Stock</span>
            <Warehouse className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-base font-bold font-mono tabular-nums text-[#16422b]">
            {formatWeight(totalAvailableStockKg)}
          </p>
          <span className="text-[11px] text-emerald-800 font-medium block mt-1">
            Valued at ~{formatNaira(totalEstimatedProduceValuation)}
          </span>
        </div>

        {/* Card 3: Recognized Revenue */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#181a19]/60">Recognized Revenue</span>
            <ShoppingBag className="w-4 h-4 text-[#16422b]/60" />
          </div>
          <p className="text-base font-bold font-mono tabular-nums text-[#181a19]">
            {formatNaira(financialSummary.totalSalesRevenue)}
          </p>
          <span className="text-[11px] text-[#181a19]/50 block mt-1">
            From {formatWeight(financialSummary.totalSoldKg)} dispatched
          </span>
        </div>

        {/* Card 4: Cash Collected in Bank */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#181a19]/60">Cash Remitted to Bank</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-base font-bold font-mono tabular-nums text-emerald-700">
            {formatNaira(financialSummary.totalCashReceived)}
          </p>
          <span className="text-[11px] text-emerald-800 font-medium block mt-1">
            {cashCollectionPercentage}% cash realization rate
          </span>
        </div>

        {/* Card 5: Unpaid Off-taker Debt */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#181a19]/60">Outstanding Off-taker Debt</span>
            <CreditCard className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-base font-bold font-mono tabular-nums text-amber-900">
            {formatNaira(financialSummary.outstandingCustomerPayments)}
          </p>
          <span className="text-[11px] text-amber-800 font-medium block mt-1">
            Pending buyer settlement
          </span>
        </div>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-[#181a19]/10 rounded-xl w-fit">
        <button
          onClick={() => {
            setActiveTab('stock');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'stock'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <Warehouse className="w-3.5 h-3.5" />
          <span>Available Stock ({produceStockSummaries.filter((s) => s.availableQuantity > 0).length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('invoices');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'invoices'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Invoices & Sales ({sales.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('harvests');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'harvests'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Harvest Logs ({harvests.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('customers');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'customers'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customers & Off-takers ({customers.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('payments');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'payments'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payments Ledger ({salePayments.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: AVAILABLE PRODUCE STOCK & INVENTORY               */}
      {/* ========================================================= */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          {/* Produce Stock Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produceStockSummaries.map((stock) => {
              const harvestLots = harvests.filter((h) => h.cropId === stock.cropId);
              const latestHarvest = harvestLots[0];

              return (
                <div
                  key={stock.cropId}
                  className="bg-white border border-[#181a19]/10 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:border-[#16422b]/30"
                >
                  <div>
                    {/* Header: Title and Status Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-semibold text-[#181a19]/50 uppercase tracking-wider block">
                          {stock.category}
                        </span>
                        <h3 className="text-base font-bold text-[#181a19] tracking-tight">
                          {stock.cropName}
                        </h3>
                        <p className="text-xs text-[#181a19]/60">{stock.variety}</p>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase whitespace-nowrap ${
                          stock.stockStatus === 'in_stock'
                            ? 'bg-emerald-100 text-[#16422b]'
                            : stock.stockStatus === 'low_stock'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-[#181a19]/10 text-[#181a19]/60'
                        }`}
                      >
                        {stock.stockStatus === 'in_stock'
                          ? 'Available in Silo'
                          : stock.stockStatus === 'low_stock'
                          ? 'Low Produce Stock'
                          : 'Depleted / Sold Out'}
                      </span>
                    </div>

                    {/* Stock Quantities & Valuation Card */}
                    <div className="bg-[#fafaf7] p-3.5 rounded-xl border border-[#181a19]/10 mb-4">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-xs text-[#181a19]/60">Available Balance:</span>
                        <div className="text-right">
                          <span className="text-lg font-bold font-mono tabular-nums text-[#16422b]">
                            {stock.availableQuantity.toLocaleString()} {stock.unit.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-[#181a19]/50 block">
                            ({formatWeight(stock.availableKg)})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#181a19]/10">
                        <span className="text-[#181a19]/60">Est. Inventory Asset Value:</span>
                        <span className="font-mono tabular-nums font-bold text-[#181a19]">
                          {formatNaira(stock.estimatedValuation)}
                        </span>
                      </div>
                    </div>

                    {/* Yield Breakdown: Harvested, Sold, Adjusted */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                      <div className="p-2 rounded-lg bg-white border border-[#181a19]/10">
                        <span className="text-[10px] text-[#181a19]/50 block">Harvested</span>
                        <span className="font-mono tabular-nums font-semibold text-[#181a19]">
                          {stock.totalHarvestedQuantity}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#181a19]/10">
                        <span className="text-[10px] text-[#181a19]/50 block">Sold</span>
                        <span className="font-mono tabular-nums font-semibold text-emerald-800">
                          {stock.totalSoldQuantity}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#181a19]/10">
                        <span className="text-[10px] text-[#181a19]/50 block">Shrink/Cull</span>
                        <span className="font-mono tabular-nums font-semibold text-amber-800">
                          {stock.totalAdjustedQuantity}
                        </span>
                      </div>
                    </div>

                    {/* Storage & Quality Specs */}
                    <div className="text-[11px] text-[#181a19]/70 space-y-1 mb-4">
                      {stock.storageLocations.length > 0 && (
                        <p className="flex items-center gap-1.5">
                          <Warehouse className="w-3 h-3 text-[#181a19]/40 shrink-0" />
                          <span className="truncate">{stock.storageLocations.join(', ')}</span>
                        </p>
                      )}
                      {latestHarvest?.moisturePercent && (
                        <p className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span>Safe Storage Moisture: {latestHarvest.moisturePercent}%</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Card Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#181a19]/10">
                    <button
                      type="button"
                      disabled={stock.availableQuantity <= 0}
                      onClick={() => {
                        setSelectedCropForAction(stock.cropId);
                        setIsSaleModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] disabled:bg-[#181a19]/20 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Sell from Stock</span>
                    </button>

                    <button
                      type="button"
                      disabled={stock.availableQuantity <= 0}
                      onClick={() => {
                        setSelectedCropForAction(stock.cropId);
                        setIsAdjustStockModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#181a19] hover:bg-[#fafaf7] border border-[#181a19]/15 rounded-lg transition-colors"
                      title="Record moisture shrinkage, sorting culls, seed retention"
                    >
                      Adjust
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Harvest Lots Batch Breakdown Table */}
          <div className="bg-white border border-[#181a19]/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#181a19]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#181a19] tracking-tight">
                  Harvested Batches & Warehouse Lot Registry
                </h3>
                <p className="text-xs text-[#181a19]/60">
                  Traceable lots linked to fields, moisture readings, and storage facilities.
                </p>
              </div>

              <button
                onClick={() => setIsHarvestModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#16422b] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log New Harvest Lot</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                    <th className="py-3 px-4">Lot Batch #</th>
                    <th className="py-3 px-4">Harvest Date</th>
                    <th className="py-3 px-4">Crop Produce</th>
                    <th className="py-3 px-4">Origin Field</th>
                    <th className="py-3 px-4">Harvested Yield</th>
                    <th className="py-3 px-4">Quality & Moisture</th>
                    <th className="py-3 px-4">Storage Location</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181a19]/5">
                  {harvests.map((h) => {
                    const crop = crops.find((c) => c.id === h.cropId);
                    const field = fields.find((f) => f.id === h.fieldId);

                    return (
                      <tr key={h.id} className="hover:bg-[#fafaf7]/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-[#181a19] whitespace-nowrap">
                          {h.batchNumber || 'LOT-STANDARD'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#181a19]/70 whitespace-nowrap">
                          {h.date}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#181a19]">
                          {crop?.name || 'Crop Produce'}
                        </td>
                        <td className="py-3 px-4 text-[#181a19]/70">
                          {field?.name || 'Field Block'}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums">
                          <span className="font-bold text-[#181a19]">
                            {h.quantity} {h.unit.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-[#181a19]/50 block">
                            ({formatWeight(h.normalizedKg)})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#181a19] block">{h.gradeQuality}</span>
                          {h.moisturePercent && (
                            <span className="text-[11px] text-[#16422b] block">
                              Moisture: {h.moisturePercent}%
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#181a19]/70 text-[11px]">
                          {h.storageLocation}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteHarvest(h.id)}
                            className="text-[#181a19]/30 hover:text-rose-600 transition-colors p-1"
                            title="Remove harvest lot"
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

          {/* Recent Stock Adjustments History */}
          {produceAdjustments.length > 0 && (
            <div className="bg-white border border-[#181a19]/10 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#181a19]/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#181a19] tracking-tight">
                    Post-Harvest Stock Adjustments Log
                  </h3>
                  <p className="text-xs text-[#181a19]/60">
                    Audit trail for moisture shrinkage, sorting rejects, seed retention, and internal use.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Produce</th>
                      <th className="py-2.5 px-4">Reason</th>
                      <th className="py-2.5 px-4 text-right">Deducted Qty</th>
                      <th className="py-2.5 px-4">Certified By</th>
                      <th className="py-2.5 px-4">Notes</th>
                      <th className="py-2.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {produceAdjustments.map((adj) => {
                      const crop = crops.find((c) => c.id === adj.cropId);
                      return (
                        <tr key={adj.id} className="hover:bg-[#fafaf7]/60">
                          <td className="py-2.5 px-4 font-mono text-[#181a19]/70 whitespace-nowrap">
                            {adj.date}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-[#181a19]">
                            {crop?.name || 'Produce'}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-medium text-amber-900 capitalize">
                              {adj.reason.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums text-rose-800 font-semibold">
                            -{adj.quantity} {adj.unit.replace('_', ' ')}
                          </td>
                          <td className="py-2.5 px-4 text-[#181a19]/70">{adj.performedBy}</td>
                          <td className="py-2.5 px-4 text-[#181a19]/60 text-[11px] max-w-xs truncate">
                            {adj.notes || '—'}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => deleteProduceAdjustment(adj.id)}
                              className="text-[#181a19]/30 hover:text-rose-600 transition-colors p-1"
                              title="Delete adjustment entry"
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
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: FIELD HARVEST LOGS                                */}
      {/* ========================================================= */}
      {activeTab === 'harvests' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search crop, field, lot batch #, or storage location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Crops</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsHarvestModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Harvest</span>
              </button>
            </div>
          </div>

          {filteredHarvests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#181a19]/15">
              <Scale className="w-8 h-8 text-[#181a19]/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#181a19]">No harvest records match your filter</p>
              <p className="text-xs text-[#181a19]/50 mt-1 mb-4">
                Record your farm yields to calculate actual field outputs and replenish warehouse inventory.
              </p>
              <button
                onClick={() => setIsHarvestModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16422b] rounded-lg"
              >
                + Record First Harvest
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#181a19]/10 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                      <th className="py-3 px-4">Harvest Date</th>
                      <th className="py-3 px-4">Batch Lot #</th>
                      <th className="py-3 px-4">Crop Produce</th>
                      <th className="py-3 px-4">Field Block</th>
                      <th className="py-3 px-4">Quantity Gathered</th>
                      <th className="py-3 px-4">Weight (kg)</th>
                      <th className="py-3 px-4">Quality & Moisture</th>
                      <th className="py-3 px-4">Storage Location</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {filteredHarvests.map((harvest) => {
                      const crop = crops.find((c) => c.id === harvest.cropId);
                      const field = fields.find((f) => f.id === harvest.fieldId);

                      return (
                        <tr key={harvest.id} className="hover:bg-[#fafaf7]/70 transition-colors">
                          <td className="py-3 px-4 font-mono tabular-nums text-[#181a19]/70 whitespace-nowrap">
                            {harvest.date}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-[#181a19] whitespace-nowrap">
                            {harvest.batchNumber || 'LOT-2601'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#181a19]">
                            {crop?.name || 'Farm Crop'}
                          </td>
                          <td className="py-3 px-4 text-[#181a19]/70">
                            {field?.name || 'Field Plot'}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums font-semibold text-[#181a19]">
                            {harvest.quantity} {harvest.unit.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-[#16422b] font-medium">
                            {formatWeight(harvest.normalizedKg)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[#181a19] font-medium block">
                              {harvest.gradeQuality}
                            </span>
                            {harvest.moisturePercent && (
                              <span className="text-[11px] text-[#16422b] block">
                                Moisture: {harvest.moisturePercent}%
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[#181a19]/70 text-[11px]">
                            {harvest.storageLocation}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => deleteHarvest(harvest.id)}
                              className="text-[#181a19]/30 hover:text-rose-600 transition-colors p-1"
                              title="Delete harvest entry"
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
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SALES INVOICES & WAYBILLS                         */}
      {/* ========================================================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Search & Status Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search buyer name, invoice #, or waybill #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Fully Settled (Paid)</option>
                <option value="partial">Partially Paid</option>
                <option value="outstanding">Outstanding Due</option>
                <option value="overdue">Overdue Invoices</option>
              </select>

              <button
                onClick={() => {
                  setSelectedCropForAction(undefined);
                  setSelectedCustomerForSale(undefined);
                  setIsSaleModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Invoice</span>
              </button>
            </div>
          </div>

          {filteredSales.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#181a19]/15">
              <ShoppingBag className="w-8 h-8 text-[#181a19]/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#181a19]">No sales invoices found</p>
              <p className="text-xs text-[#181a19]/50 mt-1 mb-4">
                Record your produce sales to issue professional invoices, track receivables, and log buyer cash settlements.
              </p>
              <button
                onClick={() => setIsSaleModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16422b] rounded-lg"
              >
                + Record First Sale Invoice
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#181a19]/10 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Crop Produce</th>
                      <th className="py-3 px-4">Buyer / Off-taker</th>
                      <th className="py-3 px-4">Volume Dispatched</th>
                      <th className="py-3 px-4 text-right">Recognized Total (₦)</th>
                      <th className="py-3 px-4 text-right">Cash Received</th>
                      <th className="py-3 px-4 text-right">Balance Due</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {filteredSales.map((sale) => {
                      const crop = crops.find((c) => c.id === sale.cropId);
                      const isOverdue =
                        sale.dueDate &&
                        sale.outstandingAmount > 0 &&
                        new Date(sale.dueDate).getTime() < new Date().getTime();

                      return (
                        <tr key={sale.id} className="hover:bg-[#fafaf7]/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-[#181a19] whitespace-nowrap">
                            <button
                              onClick={() => setActiveInvoiceToView(sale)}
                              className="text-[#16422b] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>{sale.invoiceNumber}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </button>
                            {sale.waybillNumber && (
                              <span className="text-[10px] text-[#181a19]/50 block">
                                {sale.waybillNumber}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-[#181a19]/70 whitespace-nowrap">
                            {sale.date}
                            {sale.dueDate && (
                              <span className="text-[10px] text-[#181a19]/50 block">
                                Due: {sale.dueDate}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#181a19]">
                            {crop?.name || 'Produce'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#181a19] block">
                              {sale.buyerName}
                            </span>
                            <span className="text-[11px] text-[#181a19]/50 block">
                              {sale.buyerPhone} · {sale.buyerType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-[#181a19]/80 whitespace-nowrap">
                            {sale.quantitySold} {sale.unit.replace('_', ' ')}
                            <span className="text-[10px] text-[#181a19]/50 block">
                              ({formatWeight(sale.normalizedKg)})
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#16422b] whitespace-nowrap">
                            {formatNaira(sale.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-800 font-medium whitespace-nowrap">
                            {formatNaira(sale.amountPaid)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-amber-900 whitespace-nowrap">
                            {formatNaira(sale.outstandingAmount)}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
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
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setActiveInvoiceToView(sale)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#181a19] bg-white border border-[#181a19]/15 hover:bg-[#fafaf7] rounded transition-colors shadow-xs"
                                title="View & Print Official Agribusiness Invoice"
                              >
                                View Invoice
                              </button>
                              {sale.outstandingAmount > 0 && (
                                <button
                                  onClick={() => {
                                    setPaymentModalSaleId(sale.id);
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded transition-colors shadow-xs"
                                  title="Record incoming cash payment"
                                >
                                  + Pay
                                </button>
                              )}
                              <button
                                onClick={() => deleteSale(sale.id)}
                                className="text-[#181a19]/30 hover:text-rose-600 transition-colors p-1"
                                title="Delete sale entry"
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

      {/* ========================================================= */}
      {/* TAB 4: CUSTOMERS & OFF-TAKERS DIRECTORY                 */}
      {/* ========================================================= */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search customer name, contact person, phone, or market hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <button
              onClick={() => {
                setCustomerToEdit(null);
                setIsCustomerModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Register Off-taker</span>
            </button>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#181a19]/15">
              <Users className="w-8 h-8 text-[#181a19]/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#181a19]">No off-takers registered</p>
              <p className="text-xs text-[#181a19]/50 mt-1 mb-4">
                Keep an address book of your commercial grain buyers, food processors, wholesale aggregators, and credit lines.
              </p>
              <button
                onClick={() => {
                  setCustomerToEdit(null);
                  setIsCustomerModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16422b] rounded-lg"
              >
                + Register First Off-taker
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((cust) => {
                const custSales = sales.filter(
                  (s) => s.customerId === cust.id || s.buyerName === cust.name
                );
                const totalSpent = custSales.reduce((sum, s) => sum + s.totalAmount, 0);
                const currentDebt = custSales.reduce((sum, s) => sum + s.outstandingAmount, 0);
                const debtPercent =
                  cust.creditLimit > 0
                    ? Math.min(100, Math.round((currentDebt / cust.creditLimit) * 100))
                    : 0;

                return (
                  <div
                    key={cust.id}
                    className="bg-white border border-[#181a19]/10 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#16422b]/30 transition-all"
                  >
                    <div>
                      {/* Customer Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#16422b]/10 text-[#16422b] flex items-center justify-center font-bold text-xs">
                            {cust.name.charAt(0)}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-[#181a19] tracking-tight line-clamp-1">
                              {cust.name}
                            </h3>
                            <span className="text-[10px] text-[#181a19]/60 font-medium block">
                              {cust.buyerType}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800">
                          {cust.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1 text-xs text-[#181a19]/70 mb-4 bg-[#fafaf7] p-3 rounded-xl border border-[#181a19]/10">
                        <p className="flex items-center gap-1.5 font-medium text-[#181a19]">
                          <User className="w-3.5 h-3.5 text-[#181a19]/40 shrink-0" />
                          <span>{cust.contactPerson || 'Procurement Rep'}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#181a19]/40 shrink-0" />
                          <span>{cust.phone}</span>
                        </p>
                        {cust.marketHub && (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#181a19]/40 shrink-0" />
                            <span className="truncate">{cust.marketHub}</span>
                          </p>
                        )}
                        <p className="flex items-center gap-1.5 text-[#16422b] font-medium pt-1 border-t border-[#181a19]/10">
                          <span>Terms: {cust.paymentTerms}</span>
                        </p>
                      </div>

                      {/* Financial Metrics & Credit Line Bar */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#181a19]/60">Total Lifetime Volume:</span>
                          <span className="font-mono tabular-nums font-bold text-[#16422b]">
                            {formatNaira(totalSpent)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#181a19]/60">Outstanding Due:</span>
                          <span className={`font-mono tabular-nums font-bold ${currentDebt > 0 ? 'text-amber-900' : 'text-emerald-800'}`}>
                            {formatNaira(currentDebt)}
                          </span>
                        </div>

                        <div className="pt-1">
                          <div className="flex justify-between text-[10px] text-[#181a19]/50 mb-1">
                            <span>Credit Limit: {formatNaira(cust.creditLimit)}</span>
                            <span>{debtPercent}% used</span>
                          </div>
                          <div className="w-full bg-[#181a19]/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                debtPercent > 90
                                  ? 'bg-rose-500'
                                  : debtPercent > 60
                                  ? 'bg-amber-500'
                                  : 'bg-[#16422b]'
                              }`}
                              style={{ width: `${Math.min(100, debtPercent)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#181a19]/10">
                      <button
                        onClick={() => setActiveCustomerToView(cust)}
                        className="flex-1 py-1.5 px-3 text-xs font-semibold text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/10 rounded-lg transition-colors text-center"
                      >
                        Dossier
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCustomerForSale(cust.id);
                          setIsSaleModalOpen(true);
                        }}
                        className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs text-center"
                      >
                        + Invoice
                      </button>

                      <button
                        onClick={() => {
                          setCustomerToEdit(cust);
                          setIsCustomerModalOpen(true);
                        }}
                        className="p-1.5 text-[#181a19]/50 hover:text-[#181a19] hover:bg-[#fafaf7] border border-[#181a19]/10 rounded-lg transition-colors"
                        title="Edit customer details"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteCustomer(cust.id)}
                        className="p-1.5 text-[#181a19]/30 hover:text-rose-600 transition-colors"
                        title="Delete customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: PAYMENTS LEDGER                                    */}
      {/* ========================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search remittance reference #, invoice #, customer, or bank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <button
              onClick={() => {
                setPaymentModalSaleId(undefined);
                setIsPaymentModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Payment</span>
            </button>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#181a19]/15">
              <CreditCard className="w-8 h-8 text-[#181a19]/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#181a19]">No payment remittances recorded</p>
              <p className="text-xs text-[#181a19]/50 mt-1 mb-4">
                Record bank wire confirmations or cash in hand to maintain a transparent, audit-ready cashbook.
              </p>
              <button
                onClick={() => {
                  setPaymentModalSaleId(undefined);
                  setIsPaymentModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16422b] rounded-lg"
              >
                + Record Customer Remittance
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#181a19]/10 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#fafaf7] border-b border-[#181a19]/10 text-[#181a19]/70 font-semibold">
                      <th className="py-3 px-4">Remittance Date</th>
                      <th className="py-3 px-4">Reference Slip #</th>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Payment Channel & Bank</th>
                      <th className="py-3 px-4 text-right">Amount Credited (₦)</th>
                      <th className="py-3 px-4">Recorded By</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {filteredPayments.map((p) => {
                      const linkedSale = sales.find((s) => s.id === p.saleId);

                      return (
                        <tr key={p.id} className="hover:bg-[#fafaf7]/70 transition-colors">
                          <td className="py-3 px-4 font-mono tabular-nums text-[#181a19]/70 whitespace-nowrap">
                            {p.date}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-[#181a19] whitespace-nowrap">
                            {p.referenceNumber || 'REM-VERIFIED'}
                          </td>
                          <td className="py-3 px-4 font-mono whitespace-nowrap">
                            {linkedSale ? (
                              <button
                                onClick={() => setActiveInvoiceToView(linkedSale)}
                                className="text-[#16422b] hover:underline font-semibold"
                              >
                                {p.invoiceNumber}
                              </button>
                            ) : (
                              <span className="text-[#181a19]/70">{p.invoiceNumber}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#181a19]">
                            {p.customerName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-[#181a19] block">{p.paymentMethod}</span>
                            {p.bankName && (
                              <span className="text-[10px] text-[#181a19]/50 block">
                                {p.bankName}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-800 whitespace-nowrap">
                            +{formatNaira(p.amount)}
                          </td>
                          <td className="py-3 px-4 text-[#181a19]/70 text-[11px]">
                            {p.receivedBy}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => deleteSalePayment(p.id)}
                              className="text-[#181a19]/30 hover:text-rose-600 transition-colors p-1"
                              title="Delete remittance entry"
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
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ALL MODALS                                               */}
      {/* ========================================================= */}

      {/* 1. Official Printable Agribusiness Invoice Modal */}
      {activeInvoiceToView && (
        <InvoiceDetailModal
          onClose={() => setActiveInvoiceToView(null)}
          onRecordPayment={() => {
            setPaymentModalSaleId(activeInvoiceToView.id);
            setActiveInvoiceToView(null);
            setIsPaymentModalOpen(true);
          }}
        />
      )}

      {/* 2. Customer Profile Dossier Modal */}
      {activeCustomerToView && (
        <CustomerDetailModal
          onClose={() => setActiveCustomerToView(null)}
          onNewInvoice={() => {
            setSelectedCustomerForSale(activeCustomerToView.id);
            setActiveCustomerToView(null);
            setIsSaleModalOpen(true);
          }}
          onRecordPayment={(saleId) => {
            setPaymentModalSaleId(saleId);
            setActiveCustomerToView(null);
            setIsPaymentModalOpen(true);
          }}
        />
      )}

      {/* 3. Register or Edit Customer Modal */}
      {isCustomerModalOpen && (
        <CustomerModal
          customerToEdit={customerToEdit}
          onClose={() => {
            setIsCustomerModalOpen(false);
            setCustomerToEdit(null);
          }}
        />
      )}

      {/* 4. Record Produce Sale Modal */}
      {isSaleModalOpen && (
        <RecordProduceSaleModal
          defaultCropId={selectedCropForAction}
          defaultCustomerId={selectedCustomerForSale}
          onClose={() => {
            setIsSaleModalOpen(false);
            setSelectedCropForAction(undefined);
            setSelectedCustomerForSale(undefined);
          }}
        />
      )}

      {/* 5. Record Harvest Modal */}
      {isHarvestModalOpen && (
        <RecordHarvestModal
          defaultCropId={selectedCropForAction}
          onClose={() => {
            setIsHarvestModalOpen(false);
            setSelectedCropForAction(undefined);
          }}
        />
      )}

      {/* 6. Adjust Produce Stock Modal */}
      {isAdjustStockModalOpen && (
        <AdjustProduceStockModal
          defaultCropId={selectedCropForAction}
          onClose={() => {
            setIsAdjustStockModalOpen(false);
            setSelectedCropForAction(undefined);
          }}
        />
      )}

      {/* 7. Record Inward Payment Remittance Modal */}
      {isPaymentModalOpen && (
        <RecordCustomerPaymentModal
          defaultSaleId={paymentModalSaleId}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentModalSaleId(undefined);
          }}
        />
      )}
    </div>
  );
};
