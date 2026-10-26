import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { CropCategory, CropStage, ExpenseCategory, FarmType, QuantityUnit, TaskCategory } from '../../types/farm';
import { NIGERIAN_VARIETY_CATALOG } from '../crops/CropManagementView';
import { Modal } from './Modal';
import { RecordSupplierModal } from '../expenses/RecordSupplierModal';
import { RecordPurchaseModal } from '../expenses/RecordPurchaseModal';
import { RecordStockMovementModal } from '../expenses/RecordStockMovementModal';
import { ReceiptVoucherModal } from '../expenses/ReceiptVoucherModal';
import { EditExpenseModal } from '../expenses/EditExpenseModal';
import { AddInventoryItemModal } from '../expenses/AddInventoryItemModal';
import { RecordHarvestModal } from '../harvest/RecordHarvestModal';
import { RecordProduceSaleModal } from '../harvest/RecordProduceSaleModal';
import { CustomerModal } from '../harvest/CustomerModal';
import { RecordCustomerPaymentModal } from '../harvest/RecordCustomerPaymentModal';
import { AdjustProduceStockModal } from '../harvest/AdjustProduceStockModal';
import { InvoiceDetailModal } from '../harvest/InvoiceDetailModal';
import { UpgradePlanModal } from '../commercial/UpgradePlanModal';
import { PaystackCheckoutModal } from '../commercial/PaystackCheckoutModal';
import { SubscriptionReceiptModal } from '../commercial/SubscriptionReceiptModal';
import { EditTeamMemberModal } from '../team/EditTeamMemberModal';
import { RoleMatrixModal } from '../team/RoleMatrixModal';

export const QuickActionModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    activeReceipt,
    activeExpenseToEdit,
    upgradeModalLimitFeature,
    openPaystackCheckout,
    selectedPlanForCheckout,
    openSubscriptionReceipt,
    activeSubscriptionReceipt,
    activeMemberForEdit,
    updateTeamMemberPermissions,
    isRoleMatrixOpen,
    setIsRoleMatrixOpen,
    farms,
    fields,
    crops,
    addExpense,
    addCrop,
    addHarvest,
    addSale,
    addTask,
    addField,
    addFarm,
    addSeason,
    addTeamMember,
  } = useFarm();

  // Form states
  // 1. Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    farmId: farms[0]?.id || '',
    fieldId: fields[0]?.id || '',
    cropId: crops[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    category: 'fertilizer_chemicals' as ExpenseCategory,
    description: '',
    amount: '',
    vendor: '',
    receiptNumber: '',
    paymentMethod: 'Bank Transfer' as const,
    paymentStatus: 'paid' as const,
  });

  // 2. Crop Form State
  const [cropForm, setCropForm] = useState({
    farmId: farms[0]?.id || '',
    fieldId: fields[0]?.id || '',
    name: '',
    variety: '',
    category: 'Cereal / Grain' as CropCategory,
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    targetYieldKg: '',
    stage: 'land_preparation' as CropStage,
    seedSupplier: '',
    spacingNotes: '',
  });

  // 3. Harvest Form State
  const [harvestForm, setHarvestForm] = useState({
    cropId: crops[0]?.id || '',
    fieldId: fields[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'bags_50kg' as QuantityUnit,
    gradeQuality: 'Grade A Premium' as const,
    storageLocation: 'Central Farm Store',
    notes: '',
  });

  // 4. Sale Form State
  const [saleForm, setSaleForm] = useState({
    cropId: crops[0]?.id || '',
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    buyerName: '',
    buyerPhone: '',
    buyerType: 'Off-taker Processor' as const,
    date: new Date().toISOString().split('T')[0],
    quantitySold: '',
    unit: 'bags_50kg' as QuantityUnit,
    unitPrice: '',
    amountPaid: '',
    notes: '',
  });

  // 5. Task Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: 'Agronomic' as TaskCategory,
    assignedTo: 'Adebayo Ogunlesi',
    fieldId: fields[0]?.id || '',
    cropId: crops[0]?.id || '',
    isReminderActive: true,
    reminderDate: new Date().toISOString().split('T')[0],
    reminderTime: '08:00',
  });

  // 6. Field Form State
  const [fieldForm, setFieldForm] = useState({
    farmId: farms[0]?.id || '',
    name: '',
    code: '',
    size: '',
    unit: 'hectares' as const,
    irrigation: 'Drip Irrigation' as const,
    notes: '',
  });

  // 7. Team Member Form State
  const [teamForm, setTeamForm] = useState({
    name: '',
    role: 'Field Supervisor' as const,
    phone: '',
    email: '',
    state: 'Oyo State',
    assignedFarms: [farms[0]?.name || 'Commercial Farm'],
    activeStatus: true,
  });

  // 8. Farm Estate Form State
  const [farmForm, setFarmForm] = useState({
    name: '',
    farmType: 'mixed' as FarmType,
    state: 'Oyo State',
    lga: '',
    locationDetails: '',
    totalArea: '',
    unit: 'hectares' as 'hectares' | 'acres',
    soilProfile: 'Deep loamy sand with high organic matter, pH 6.4',
    ownership: 'Owned' as 'Owned' | 'Leased' | 'Outgrower Scheme',
  });

  // 9. Crop Season Form State
  const [seasonForm, setSeasonForm] = useState({
    farmId: farms[0]?.id || '',
    name: '',
    seasonType: 'Early Rains (Main)' as 'Early Rains (Main)' | 'Late Rains (Minor)' | 'Dry Season (Irrigation)' | 'All-Year Perennial',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 150 * 86400000).toISOString().split('T')[0],
    targetAcreage: '',
    unit: 'hectares' as 'hectares' | 'acres',
    budget: '',
    status: 'planning' as 'planning' | 'active' | 'completed',
    linkedCropIds: [] as string[],
    notes: '',
  });

  // Handlers
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.description) return;
    await addExpense({
      farmId: expenseForm.farmId || farms[0]?.id || 'farm-001',
      fieldId: expenseForm.fieldId || undefined,
      cropId: expenseForm.cropId || undefined,
      date: expenseForm.date,
      category: expenseForm.category,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      vendor: expenseForm.vendor || 'Local Agro Dealer',
      receiptNumber: expenseForm.receiptNumber || undefined,
      paymentMethod: expenseForm.paymentMethod,
      paymentStatus: expenseForm.paymentStatus,
    });
    setExpenseForm({ ...expenseForm, description: '', amount: '', vendor: '' });
  };

  const handleCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropForm.name || !cropForm.variety) return;
    await addCrop({
      farmId: cropForm.farmId || farms[0]?.id || 'farm-001',
      fieldId: cropForm.fieldId || fields[0]?.id || 'field-01',
      name: cropForm.name,
      variety: cropForm.variety,
      category: cropForm.category,
      plantingDate: cropForm.plantingDate,
      expectedHarvestDate:
        cropForm.expectedHarvestDate ||
        new Date(Date.now() + 100 * 86400000).toISOString().split('T')[0],
      targetYieldKg: parseFloat(cropForm.targetYieldKg) || 10000,
      stage: cropForm.stage,
      seedSupplier: cropForm.seedSupplier || 'Certified Seed Depot',
      spacingNotes: cropForm.spacingNotes,
      activeStatus: true,
    });
    setCropForm({ ...cropForm, name: '', variety: '', targetYieldKg: '' });
  };

  const handleHarvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvestForm.quantity) return;
    await addHarvest({
      cropId: harvestForm.cropId,
      fieldId: harvestForm.fieldId,
      date: harvestForm.date,
      quantity: parseFloat(harvestForm.quantity),
      unit: harvestForm.unit,
      gradeQuality: harvestForm.gradeQuality,
      storageLocation: harvestForm.storageLocation,
      notes: harvestForm.notes,
    });
    setHarvestForm({ ...harvestForm, quantity: '', notes: '' });
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(saleForm.quantitySold);
    const price = parseFloat(saleForm.unitPrice);
    if (!qty || !price || !saleForm.buyerName) return;

    const totalAmount = qty * price;
    const amountPaid = saleForm.amountPaid ? parseFloat(saleForm.amountPaid) : totalAmount;

    await addSale({
      cropId: saleForm.cropId,
      invoiceNumber: saleForm.invoiceNumber,
      buyerName: saleForm.buyerName,
      buyerPhone: saleForm.buyerPhone || '+234 800 000 0000',
      buyerType: saleForm.buyerType,
      date: saleForm.date,
      quantitySold: qty,
      unit: saleForm.unit,
      unitPrice: price,
      totalAmount,
      amountPaid,
      paymentStatus: 'paid',
      notes: saleForm.notes,
    });
    setSaleForm({
      ...saleForm,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      buyerName: '',
      buyerPhone: '',
      quantitySold: '',
      unitPrice: '',
      amountPaid: '',
    });
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    await addTask({
      title: taskForm.title,
      description: taskForm.description,
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      status: 'pending',
      assignedTo: taskForm.assignedTo,
      fieldId: taskForm.fieldId || undefined,
      cropId: taskForm.cropId || undefined,
      category: taskForm.category,
      reminderDate: taskForm.isReminderActive ? taskForm.reminderDate : undefined,
      reminderTime: taskForm.isReminderActive ? taskForm.reminderTime : undefined,
      isReminderActive: taskForm.isReminderActive,
    });
    setTaskForm({ ...taskForm, title: '', description: '' });
  };

  const handleFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldForm.name || !fieldForm.size) return;
    await addField({
      farmId: fieldForm.farmId || farms[0]?.id || 'farm-001',
      name: fieldForm.name,
      code: fieldForm.code || `FLD-${Math.floor(10 + Math.random() * 90)}`,
      size: parseFloat(fieldForm.size),
      unit: fieldForm.unit,
      irrigation: fieldForm.irrigation,
      status: 'active',
      notes: fieldForm.notes,
    });
    setFieldForm({ ...fieldForm, name: '', code: '', size: '', notes: '' });
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name) return;
    await addTeamMember({
      name: teamForm.name,
      role: teamForm.role,
      phone: teamForm.phone || '+234 800 000 0000',
      email: teamForm.email || `${teamForm.name.toLowerCase().replace(/\s+/g, '.')}@farm.ng`,
      state: teamForm.state,
      assignedFarms: teamForm.assignedFarms,
      activeStatus: true,
    });
    setTeamForm({ ...teamForm, name: '', phone: '', email: '' });
  };

  const handleFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmForm.name || !farmForm.totalArea) return;
    await addFarm({
      name: farmForm.name,
      farmType: farmForm.farmType,
      state: farmForm.state,
      lga: farmForm.lga || 'Commercial Agricultural District',
      locationDetails: farmForm.locationDetails || `${farmForm.state}, Nigeria`,
      totalArea: parseFloat(farmForm.totalArea),
      unit: farmForm.unit,
      soilProfile: farmForm.soilProfile || 'Loamy soil suitable for commercial cultivation',
      ownership: farmForm.ownership,
    });
    setFarmForm({
      name: '',
      farmType: 'mixed',
      state: 'Oyo State',
      lga: '',
      locationDetails: '',
      totalArea: '',
      unit: 'hectares',
      soilProfile: 'Deep loamy sand with high organic matter, pH 6.4',
      ownership: 'Owned',
    });
  };

  const handleSeasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonForm.name || !seasonForm.startDate || !seasonForm.endDate) return;
    await addSeason({
      farmId: seasonForm.farmId || farms[0]?.id || 'farm-001',
      name: seasonForm.name,
      seasonType: seasonForm.seasonType,
      startDate: seasonForm.startDate,
      endDate: seasonForm.endDate,
      targetAcreage: parseFloat(seasonForm.targetAcreage) || 10,
      unit: seasonForm.unit,
      budget: parseFloat(seasonForm.budget) || 0,
      status: seasonForm.status,
      linkedCropIds: seasonForm.linkedCropIds,
      notes: seasonForm.notes,
    });
    setSeasonForm({
      farmId: farms[0]?.id || '',
      name: '',
      seasonType: 'Early Rains (Main)',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 150 * 86400000).toISOString().split('T')[0],
      targetAcreage: '',
      unit: 'hectares',
      budget: '',
      status: 'planning',
      linkedCropIds: [],
      notes: '',
    });
  };

  return (
    <>
      {/* 1. Add Expense Modal */}
      <Modal
        isOpen={activeModal === 'add_expense'}
        onClose={closeModal}
        title="Record Operating Expense"
        subtitle="Log farm input, labor, mechanization, or logistics cost"
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Expense Category
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="seeds_seedlings">Certified Seeds & Nursery</option>
                <option value="fertilizer_chemicals">Fertilizer & Crop Protection</option>
                <option value="mechanization_fuel">Mechanization, Tillage & Fuel</option>
                <option value="labor">Field & Seasonal Labor</option>
                <option value="logistics_packaging">Logistics, Sacks & Haulage</option>
                <option value="lease_utilities">Land Lease & Water/Power</option>
                <option value="other">Other / Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Amount (Naira ₦) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 450000"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Description / Items Purchased *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 20 Bags NPK 15-15-15 + 5L Glyphosate"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Allocate to Crop Enterprise
              </label>
              <select
                value={expenseForm.cropId}
                onChange={(e) => setExpenseForm({ ...expenseForm, cropId: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="">General Overhead (Not crop-specific)</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.variety})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Target Field Block
              </label>
              <select
                value={expenseForm.fieldId}
                onChange={(e) => setExpenseForm({ ...expenseForm, fieldId: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="">Whole Farm</option>
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
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Vendor / Payee
              </label>
              <input
                type="text"
                placeholder="e.g. Golden Fertilizer Depot"
                value={expenseForm.vendor}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Payment Channel
              </label>
              <select
                value={expenseForm.paymentMethod}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    paymentMethod: e.target.value as typeof expenseForm.paymentMethod,
                  })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash Voucher</option>
                <option value="Mobile Money">Mobile Money (POS)</option>
                <option value="Supplier Credit">Supplier Credit</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Save Expense Entry
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Add Crop Modal */}
      <Modal
        isOpen={activeModal === 'add_crop'}
        onClose={closeModal}
        title="Register Planted Crop"
        subtitle="Track growth cycle, expected yield, and input costs"
      >
        <form onSubmit={handleCropSubmit} className="space-y-4 text-sm">
          {/* Quick Preset Selector */}
          <div className="p-2.5 rounded-lg bg-[#fafaf7] border border-[#181a19]/10 space-y-1">
            <label className="block text-[11px] font-semibold text-[#16422b]">
              Quick Select Certified Nigerian Variety (Optional)
            </label>
            <select
              onChange={(e) => {
                const preset = NIGERIAN_VARIETY_CATALOG.find((p) => p.key === e.target.value);
                if (preset) {
                  const planting = cropForm.plantingDate ? new Date(cropForm.plantingDate) : new Date();
                  const harvest = new Date(planting.getTime() + preset.maturityDays * 86400000);
                  const selectedField = fields.find((f) => f.id === cropForm.fieldId) || fields[0];
                  const fieldSizeHa = selectedField
                    ? selectedField.unit === 'acres'
                      ? selectedField.size / 2.47105
                      : selectedField.size
                    : 10;
                  const estimatedTargetKg = Math.round(preset.typicalYieldKgPerHa * fieldSizeHa);

                  setCropForm({
                    ...cropForm,
                    name: preset.cropName,
                    variety: preset.variety,
                    category: preset.category,
                    seedSupplier: preset.supplier,
                    spacingNotes: preset.spacingNotes,
                    expectedHarvestDate: harvest.toISOString().split('T')[0],
                    targetYieldKg: estimatedTargetKg.toString(),
                  });
                }
              }}
              defaultValue=""
              className="w-full bg-white border border-[#181a19]/15 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#16422b]"
            >
              <option value="">-- Choose from Nigerian Catalog Presets or enter below --</option>
              {NIGERIAN_VARIETY_CATALOG.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.cropName} — {p.variety} ({p.maturityDays} days maturity)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Crop Common Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Yellow Maize, Cassava, Tomato"
                value={cropForm.name}
                onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Variety / Seed Strain *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SeedCo SC 719, TME-419, Roma VF"
                value={cropForm.variety}
                onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Crop Enterprise Category
              </label>
              <select
                value={cropForm.category}
                onChange={(e) =>
                  setCropForm({ ...cropForm, category: e.target.value as typeof cropForm.category })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Cereal / Grain">Cereal / Grain (Maize, Rice, Sorghum)</option>
                <option value="Root & Tuber">Root & Tuber (Cassava, Yam, Sweet Potato)</option>
                <option value="Horticulture / Veg">Horticulture / Veg (Tomato, Pepper, Cucumber)</option>
                <option value="Legume">Legume (Soybeans, Cowpea, Groundnut)</option>
                <option value="Cash Crop">Cash Crop (Oil Palm, Cocoa, Cashew)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Allocated Field Block
              </label>
              <select
                value={cropForm.fieldId}
                onChange={(e) => setCropForm({ ...cropForm, fieldId: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
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
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Planting Date
              </label>
              <input
                type="date"
                value={cropForm.plantingDate}
                onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Expected Harvest Date
              </label>
              <input
                type="date"
                value={cropForm.expectedHarvestDate}
                onChange={(e) =>
                  setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Target Yield (kg)
              </label>
              <input
                type="number"
                placeholder="e.g. 35000"
                value={cropForm.targetYieldKg}
                onChange={(e) => setCropForm({ ...cropForm, targetYieldKg: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Current Growth Stage
              </label>
              <select
                value={cropForm.stage}
                onChange={(e) =>
                  setCropForm({ ...cropForm, stage: e.target.value as CropStage })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="land_preparation">Land Preparation & Tillage</option>
                <option value="planting">Direct Seeding / Transplanting</option>
                <option value="vegetative">Vegetative Canopy Growth</option>
                <option value="flowering_fruiting">Flowering & Fruiting / Tasseling</option>
                <option value="maturing">Pod / Cob Maturation & Drying</option>
                <option value="harvesting">Active Harvesting</option>
                <option value="completed">Cycle Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Certified Seed Supplier
              </label>
              <input
                type="text"
                placeholder="e.g. Seed Co Nigeria, Premier Seed, IITA"
                value={cropForm.seedSupplier}
                onChange={(e) => setCropForm({ ...cropForm, seedSupplier: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Register Crop
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Record Harvest Modal */}
      {activeModal === 'record_harvest' && (
        <RecordHarvestModal onClose={closeModal} />
      )}

      {/* 4. Record Sale Modal */}
      {activeModal === 'record_sale' && (
        <RecordProduceSaleModal onClose={closeModal} />
      )}

      {/* 4b. Customer & Payment Modals */}
      {activeModal === 'add_customer' && (
        <CustomerModal onClose={closeModal} />
      )}

      {activeModal === 'record_payment' && (
        <RecordCustomerPaymentModal onClose={closeModal} />
      )}

      {activeModal === 'adjust_produce_stock' && (
        <AdjustProduceStockModal onClose={closeModal} />
      )}

      {activeModal === 'view_invoice' && (
        <InvoiceDetailModal onClose={closeModal} />
      )}


      {/* 5. Create Task Modal */}
      <Modal
        isOpen={activeModal === 'create_task'}
        onClose={closeModal}
        title="Schedule Operational Task"
        subtitle="Assign field action, maintenance, or financial follow-up"
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apply top-dressing Urea on Maize Block A"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Detailed Action Notes
            </label>
            <textarea
              rows={2}
              placeholder="Dosage rate, equipment needed, safety precautions..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Operation Category
              </label>
              <select
                value={taskForm.category}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, category: e.target.value as TaskCategory })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Agronomic">Agronomic (Scouting, Planting, Weeding)</option>
                <option value="Spraying / Chemical">Spraying / Agrochemical Application</option>
                <option value="Irrigation">Irrigation & Water Management</option>
                <option value="Machinery">Machinery & Tractor Maintenance</option>
                <option value="Harvest">Harvest & Silo Storage</option>
                <option value="Financial & Billing">Financial & Buyer Billing Follow-up</option>
                <option value="General">General Farm Estate Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Priority Level
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value as typeof taskForm.priority })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="high">High (Urgent field intervention)</option>
                <option value="medium">Medium (Standard operation)</option>
                <option value="low">Low (Routine maintenance)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Target Field Block
              </label>
              <select
                value={taskForm.fieldId}
                onChange={(e) => setTaskForm({ ...taskForm, fieldId: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="">General (Whole Estate)</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Assignee
              </label>
              <input
                type="text"
                placeholder="e.g. Adebayo Ogunlesi"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          {/* Reminder Alert Section */}
          <div className="p-3 bg-[#fafaf7] border border-[#181a19]/10 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#181a19]">
              <input
                type="checkbox"
                checked={taskForm.isReminderActive}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, isReminderActive: e.target.checked })
                }
                className="accent-[#16422b] rounded w-3.5 h-3.5"
              />
              <span>Schedule Smart Reminder Alert</span>
            </label>

            {taskForm.isReminderActive && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-[#181a19]/70 mb-1">
                    Reminder Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.reminderDate}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, reminderDate: e.target.value })
                    }
                    className="w-full bg-white border border-[#181a19]/15 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#16422b]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#181a19]/70 mb-1">
                    Alert Time
                  </label>
                  <input
                    type="time"
                    value={taskForm.reminderTime}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, reminderTime: e.target.value })
                    }
                    className="w-full bg-white border border-[#181a19]/15 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#16422b]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Add Field Modal */}
      <Modal
        isOpen={activeModal === 'add_field'}
        onClose={closeModal}
        title="Delineate Field Block"
        subtitle="Add a new plot or block for crop rotation and input tracking"
      >
        <form onSubmit={handleFieldSubmit} className="space-y-4 text-sm">
          {farms.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Farm Estate *
              </label>
              <select
                value={fieldForm.farmId}
                onChange={(e) => setFieldForm({ ...fieldForm, farmId: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name} ({farm.state})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Field Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. North Ridge Block A"
                value={fieldForm.name}
                onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Field Code / Identifier
              </label>
              <input
                type="text"
                placeholder="e.g. NR-01"
                value={fieldForm.code}
                onChange={(e) => setFieldForm({ ...fieldForm, code: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Area Size *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 15"
                value={fieldForm.size}
                onChange={(e) => setFieldForm({ ...fieldForm, size: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Unit
              </label>
              <select
                value={fieldForm.unit}
                onChange={(e) =>
                  setFieldForm({ ...fieldForm, unit: e.target.value as typeof fieldForm.unit })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="hectares">Hectares (ha)</option>
                <option value="acres">Acres</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Irrigation System
              </label>
              <select
                value={fieldForm.irrigation}
                onChange={(e) =>
                  setFieldForm({
                    ...fieldForm,
                    irrigation: e.target.value as typeof fieldForm.irrigation,
                  })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Rain-fed">Rain-fed</option>
                <option value="Borehole Sprinkler">Borehole Sprinkler</option>
                <option value="Canal Furrow">Canal Furrow</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Topography & Soil Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Sandy loam with solar pump borehole access"
              value={fieldForm.notes}
              onChange={(e) => setFieldForm({ ...fieldForm, notes: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Create Field Block
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Add Team Member Modal */}
      <Modal
        isOpen={activeModal === 'add_team'}
        onClose={closeModal}
        title="Invite Farm Team Member"
        subtitle="Grant operational role to supervisors, agronomists, or accountants"
      >
        <form onSubmit={handleTeamSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ibrahim Danladi"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Role Responsibility
              </label>
              <select
                value={teamForm.role}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, role: e.target.value as typeof teamForm.role })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Field Supervisor">Field Supervisor</option>
                <option value="Chief Agronomist">Chief Agronomist</option>
                <option value="Farm Operations Lead">Farm Operations Lead</option>
                <option value="Irrigation Technician">Irrigation Technician</option>
                <option value="Accounts Officer">Accounts Officer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+234 803 000 0000"
                value={teamForm.phone}
                onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="ibrahim@farm.ng"
                value={teamForm.email}
                onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Add Member
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. Add Farm Estate Modal */}
      <Modal
        isOpen={activeModal === 'add_farm'}
        onClose={closeModal}
        title="Register Farm Estate"
        subtitle="Record agricultural landholding parcel, tenure, and soil profile"
      >
        <form onSubmit={handleFarmSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Farm Estate Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alafia Agro Holdings (Oyo Commercial Estate)"
              value={farmForm.name}
              onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1.5">
              Farming Enterprise Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-all flex flex-col gap-1 ${
                  farmForm.farmType === 'crop'
                    ? 'border-[#16422b] bg-emerald-50/50 text-[#16422b] font-medium'
                    : 'border-[#181a19]/15 bg-[#fafaf7] text-[#181a19]/80 hover:bg-[#fafaf7]/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Crop Farm</span>
                  <input
                    type="radio"
                    name="farmType"
                    value="crop"
                    checked={farmForm.farmType === 'crop'}
                    onChange={() => setFarmForm({ ...farmForm, farmType: 'crop' })}
                    className="accent-[#16422b]"
                  />
                </div>
                <span className="text-[10px] text-[#181a19]/60 leading-tight">
                  Grains, tubers, roots, and horticulture plots
                </span>
              </label>

              <label
                className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-all flex flex-col gap-1 ${
                  farmForm.farmType === 'poultry'
                    ? 'border-[#16422b] bg-emerald-50/50 text-[#16422b] font-medium'
                    : 'border-[#181a19]/15 bg-[#fafaf7] text-[#181a19]/80 hover:bg-[#fafaf7]/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Poultry Farm</span>
                  <input
                    type="radio"
                    name="farmType"
                    value="poultry"
                    checked={farmForm.farmType === 'poultry'}
                    onChange={() => setFarmForm({ ...farmForm, farmType: 'poultry' })}
                    className="accent-[#16422b]"
                  />
                </div>
                <span className="text-[10px] text-[#181a19]/60 leading-tight">
                  Broilers, layers, cockerels, eggs, and housing pens
                </span>
              </label>

              <label
                className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-all flex flex-col gap-1 ${
                  farmForm.farmType === 'mixed'
                    ? 'border-[#16422b] bg-emerald-50/50 text-[#16422b] font-medium'
                    : 'border-[#181a19]/15 bg-[#fafaf7] text-[#181a19]/80 hover:bg-[#fafaf7]/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Mixed Farm</span>
                  <input
                    type="radio"
                    name="farmType"
                    value="mixed"
                    checked={farmForm.farmType === 'mixed'}
                    onChange={() => setFarmForm({ ...farmForm, farmType: 'mixed' })}
                    className="accent-[#16422b]"
                  />
                </div>
                <span className="text-[10px] text-[#181a19]/60 leading-tight">
                  Integrated crop fields & poultry livestock
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                State *
              </label>
              <select
                value={farmForm.state}
                onChange={(e) => setFarmForm({ ...farmForm, state: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Oyo State">Oyo State</option>
                <option value="Ogun State">Ogun State</option>
                <option value="Osun State">Osun State</option>
                <option value="Ondo State">Ondo State</option>
                <option value="Ekiti State">Ekiti State</option>
                <option value="Lagos State">Lagos State</option>
                <option value="Edo State">Edo State</option>
                <option value="Delta State">Delta State</option>
                <option value="Benue State">Benue State</option>
                <option value="Niger State">Niger State</option>
                <option value="Kaduna State">Kaduna State</option>
                <option value="Kano State">Kano State</option>
                <option value="Plateau State">Plateau State</option>
                <option value="Nasarawa State">Nasarawa State</option>
                <option value="Taraba State">Taraba State</option>
                <option value="Kebbi State">Kebbi State</option>
                <option value="Kwara State">Kwara State</option>
                <option value="Kogi State">Kogi State</option>
                <option value="Enugu State">Enugu State</option>
                <option value="Anambra State">Anambra State</option>
                <option value="Cross River State">Cross River State</option>
                <option value="FCT Abuja">FCT Abuja</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                LGA / District
              </label>
              <input
                type="text"
                placeholder="e.g. Afijio / Chikun / Mokwa"
                value={farmForm.lga}
                onChange={(e) => setFarmForm({ ...farmForm, lga: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Total Estate Area *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 45"
                value={farmForm.totalArea}
                onChange={(e) => setFarmForm({ ...farmForm, totalArea: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Measurement Unit
              </label>
              <select
                value={farmForm.unit}
                onChange={(e) =>
                  setFarmForm({ ...farmForm, unit: e.target.value as typeof farmForm.unit })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="hectares">Hectares (ha)</option>
                <option value="acres">Acres</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Tenure / Ownership
              </label>
              <select
                value={farmForm.ownership}
                onChange={(e) =>
                  setFarmForm({ ...farmForm, ownership: e.target.value as typeof farmForm.ownership })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Owned">Owned (Title Deed / C of O)</option>
                <option value="Leased">Leased (Agricultural Lease)</option>
                <option value="Outgrower Scheme">Outgrower Scheme</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Location Details & Access Route
            </label>
            <input
              type="text"
              placeholder="e.g. KM 14 Ibadan-Oyo Expressway, near Fiditi town"
              value={farmForm.locationDetails}
              onChange={(e) => setFarmForm({ ...farmForm, locationDetails: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Soil Profile & Topography
            </label>
            <input
              type="text"
              placeholder="e.g. Deep loamy sand with high organic matter, pH 6.4, gentle slope"
              value={farmForm.soilProfile}
              onChange={(e) => setFarmForm({ ...farmForm, soilProfile: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Register Farm Estate
            </button>
          </div>
        </form>
      </Modal>

      {/* 9. Add Crop Season Modal */}
      <Modal
        isOpen={activeModal === 'add_season'}
        onClose={closeModal}
        title="Plan Agricultural Crop Season"
        subtitle="Establish seasonal cropping targets, capital budget, and crop cycles"
      >
        <form onSubmit={handleSeasonSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Target Farm Estate *
              </label>
              <select
                value={seasonForm.farmId}
                onChange={(e) => setSeasonForm({ ...seasonForm, farmId: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name} ({farm.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Season Type *
              </label>
              <select
                value={seasonForm.seasonType}
                onChange={(e) =>
                  setSeasonForm({ ...seasonForm, seasonType: e.target.value as typeof seasonForm.seasonType })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Early Rains (Main)">Early Rains (Main Season: March–August)</option>
                <option value="Late Rains (Minor)">Late Rains (Minor Season: August–November)</option>
                <option value="Dry Season (Irrigation)">Dry Season (Irrigation / Drip: Oct–March)</option>
                <option value="All-Year Perennial">All-Year Perennial (12-month cycle)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Season Campaign Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2026 Main Early Rains (Grain & Legume)"
              value={seasonForm.name}
              onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Start Date (Planting prep) *
              </label>
              <input
                type="date"
                required
                value={seasonForm.startDate}
                onChange={(e) => setSeasonForm({ ...seasonForm, startDate: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Expected Completion Date *
              </label>
              <input
                type="date"
                required
                value={seasonForm.endDate}
                onChange={(e) => setSeasonForm({ ...seasonForm, endDate: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Target Acreage *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 25"
                value={seasonForm.targetAcreage}
                onChange={(e) => setSeasonForm({ ...seasonForm, targetAcreage: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Unit
              </label>
              <select
                value={seasonForm.unit}
                onChange={(e) =>
                  setSeasonForm({ ...seasonForm, unit: e.target.value as typeof seasonForm.unit })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="hectares">Hectares</option>
                <option value="acres">Acres</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Planned Budget (₦)
              </label>
              <input
                type="number"
                placeholder="e.g. 6500000"
                value={seasonForm.budget}
                onChange={(e) => setSeasonForm({ ...seasonForm, budget: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Execution Status
            </label>
            <div className="flex items-center gap-3">
              {(['planning', 'active', 'completed'] as const).map((st) => (
                <label key={st} className="flex items-center gap-1.5 text-xs text-[#181a19]/80 cursor-pointer">
                  <input
                    type="radio"
                    name="season_status"
                    checked={seasonForm.status === st}
                    onChange={() => setSeasonForm({ ...seasonForm, status: st })}
                    className="accent-[#16422b]"
                  />
                  <span className="capitalize">{st}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Agronomic Strategy & Rotation Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Hybrid maize intercropped with soybeans for nitrogen fixing; early planting after 3 steady rainfall events."
              value={seasonForm.notes}
              onChange={(e) => setSeasonForm({ ...seasonForm, notes: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Create Season Cycle
            </button>
          </div>
        </form>
      </Modal>

      {/* 10. Record / Edit Supplier Modal */}
      <RecordSupplierModal
        isOpen={activeModal === 'add_supplier'}
        onClose={closeModal}
      />

      {/* 11. Record Purchase Order Modal */}
      <RecordPurchaseModal
        isOpen={activeModal === 'add_purchase'}
        onClose={closeModal}
      />

      {/* 12. Log Stock Movement Modal */}
      <RecordStockMovementModal
        isOpen={activeModal === 'add_stock_movement'}
        onClose={closeModal}
      />

      {/* 13. Receipt / Voucher Modal */}
      <ReceiptVoucherModal
        isOpen={activeModal === 'add_receipt' || activeModal === 'view_receipt'}
        onClose={closeModal}
        receipt={activeReceipt}
        mode={activeModal === 'add_receipt' ? 'create' : 'view'}
      />

      {/* 14. Edit Expense Modal */}
      <EditExpenseModal
        isOpen={activeModal === 'edit_expense'}
        onClose={closeModal}
        expense={activeExpenseToEdit}
      />

      {/* 15. Add Warehouse Inventory Item Modal */}
      <AddInventoryItemModal
        isOpen={activeModal === 'add_inventory'}
        onClose={closeModal}
      />

      {/* 16. Upgrade Subscription Plan Modal */}
      <UpgradePlanModal
        isOpen={activeModal === 'upgrade_plan'}
        onClose={closeModal}
        limitFeature={upgradeModalLimitFeature}
        onSelectPlanToCheckout={(planId, cycle) => openPaystackCheckout(planId, cycle)}
      />

      {/* 17. Paystack Checkout Gateway Modal */}
      <PaystackCheckoutModal
        isOpen={activeModal === 'paystack_checkout'}
        onClose={closeModal}
        targetPlanId={selectedPlanForCheckout.planId}
        billingCycle={selectedPlanForCheckout.cycle}
        onPaymentSuccess={(tx) => {
          openSubscriptionReceipt(tx);
        }}
      />

      {/* 18. Official Paystack Payment Receipt Modal */}
      <SubscriptionReceiptModal
        isOpen={activeModal === 'view_subscription_receipt'}
        onClose={closeModal}
        transaction={activeSubscriptionReceipt}
      />

      {/* 19. Edit Team Member Role & Granular Permissions Modal */}
      <EditTeamMemberModal
        isOpen={activeModal === 'edit_team_permissions'}
        onClose={closeModal}
        member={activeMemberForEdit}
        onSave={updateTeamMemberPermissions}
      />

      {/* 20. Role-Based Access Control Permissions Matrix Modal */}
      <RoleMatrixModal
        isOpen={activeModal === 'role_matrix' || isRoleMatrixOpen}
        onClose={() => {
          setIsRoleMatrixOpen(false);
          if (activeModal === 'role_matrix') closeModal();
        }}
      />
    </>
  );
};
