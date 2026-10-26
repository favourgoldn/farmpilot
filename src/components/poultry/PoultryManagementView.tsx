import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Egg,
  Feather,
  Filter,
  HeartPulse,
  Home,
  Info,
  Layers,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Syringe,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Wheat,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  AdministrationRoute,
  BirdPurpose,
  EggProductionRecord,
  FeedCategory,
  FeedConsumptionRecord,
  FeedInventoryItem,
  Flock,
  FlockHealthRecord,
  FlockMovement,
  FlockMovementType,
  FlockStatus,
  HousingSystemType,
  PoultryHouse,
  PoultryProductType,
  PoultrySaleRecord,
  PoultryType,
} from '../../types/farm';
import { formatNaira, formatWeight } from '../../utils/finance';
import { Modal } from '../common/Modal';

type PoultryTab =
  | 'flocks'
  | 'housing'
  | 'feed'
  | 'health'
  | 'eggs'
  | 'sales'
  | 'profitability';

export const PoultryManagementView: React.FC = () => {
  const {
    selectedFarm,
    farms,
    flocks,
    flockMovements,
    poultryHouses,
    feedInventory,
    feedConsumption,
    flockHealthRecords,
    eggProductionRecords,
    poultrySales,
    flockProfitability,
    addFlock,
    updateFlock,
    deleteFlock,
    addFlockMovement,
    addPoultryHouse,
    updatePoultryHouse,
    deletePoultryHouse,
    addFeedInventory,
    updateFeedInventory,
    deleteFeedInventory,
    addFeedConsumption,
    addFlockHealth,
    addEggProduction,
    addPoultrySale,
    deletePoultrySale,
    addTask,
    showToast,
  } = useFarm();

  const [activeTab, setActiveTab] = useState<PoultryTab>('flocks');
  const [selectedFlockFilter, setSelectedFlockFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals visibility
  const [isAddFlockOpen, setIsAddFlockOpen] = useState(false);
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);
  const [isAddHouseOpen, setIsAddHouseOpen] = useState(false);
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);
  const [isLogFeedConsumptionOpen, setIsLogFeedConsumptionOpen] = useState(false);
  const [isAddHealthOpen, setIsAddHealthOpen] = useState(false);
  const [isLogEggOpen, setIsLogEggOpen] = useState(false);
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);

  // Selected flock for movement modal
  const [movementFlockId, setMovementFlockId] = useState<string>('');

  // Forms state
  // 1. Flock Form
  const [flockForm, setFlockForm] = useState({
    farmId: selectedFarm?.id || farms[0]?.id || 'farm-001',
    houseId: poultryHouses[0]?.id || '',
    name: '',
    poultryType: 'Broilers' as PoultryType,
    breed: 'Cobb 500',
    purpose: 'Meat (Broiler)' as BirdPurpose,
    initialBirdCount: '1000',
    acquisitionDate: new Date().toISOString().split('T')[0],
    supplier: 'CHI Farms Hatchery',
    unitPurchasePrice: '850',
    status: 'active' as FlockStatus,
    targetWeightKg: '2.4',
    notes: '',
  });

  // 2. Movement Form
  const [movementForm, setMovementForm] = useState({
    flockId: flocks[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    type: 'mortality' as FlockMovementType,
    quantity: '10',
    reason: '',
    causeOfDeath: '',
    performedBy: 'Flock Supervisor',
    notes: '',
  });

  // 3. Housing Form
  const [houseForm, setHouseForm] = useState({
    farmId: selectedFarm?.id || farms[0]?.id || 'farm-001',
    name: '',
    capacity: '2000',
    housingType: 'Deep Litter System' as HousingSystemType,
    locationDetails: 'Sector B, Poultry Block 1',
    status: 'active' as PoultryHouse['status'],
    notes: '',
  });

  // 4. Feed Inventory Form
  const [feedForm, setFeedForm] = useState({
    farmId: selectedFarm?.id || farms[0]?.id || 'farm-001',
    feedName: '',
    brand: 'TopFeeds',
    category: 'Starter' as FeedCategory,
    quantityBags: '40',
    bagWeightKg: '25',
    costPerBag: '18500',
    reorderLevelBags: '15',
    supplier: 'Premier Feed Mills',
    dateReceived: new Date().toISOString().split('T')[0],
    location: 'Central Feed Shed 1',
    notes: '',
  });

  // 5. Feed Consumption Form
  const [feedConsForm, setFeedConsForm] = useState({
    farmId: selectedFarm?.id || farms[0]?.id || 'farm-001',
    flockId: flocks[0]?.id || '',
    feedInventoryItemId: feedInventory[0]?.id || '',
    feedName: feedInventory[0]?.feedName || 'Starter Mash',
    feedCategory: (feedInventory[0]?.category || 'Starter') as FeedCategory,
    date: new Date().toISOString().split('T')[0],
    quantityBags: '4',
    bagWeightKg: '25',
    costPerKg: '740',
    recordedBy: 'Flock Manager',
    notes: '',
  });

  // 6. Health & Vaccination Form
  const [healthForm, setHealthForm] = useState({
    farmId: selectedFarm?.id || farms[0]?.id || 'farm-001',
    flockId: flocks[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    recordType: 'vaccination' as FlockHealthRecord['recordType'],
    diseaseOrPurpose: 'Gumboro (IBD) Vaccine 1st Dose',
    medicationOrVaccineName: 'Nobilis Gumboro D78',
    route: 'Drinking Water' as AdministrationRoute,
    cost: '20000',
    administeredBy: 'Dr. Retainer Vet',
    mortalityRecordedOnDate: '0',
    nextFollowUpDate: '',
    notes: '',
    scheduleAsTask: true,
  });

  // 7. Egg Production Form
  const [eggForm, setEggForm] = useState({
    farmId: selectedFarm?.id || farms[0]?.id || 'farm-001',
    flockId: flocks.find((f) => f.poultryType === 'Layers')?.id || flocks[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    totalEggsCollected: '1250',
    saleableEggs: '1230',
    brokenCrackedEggs: '15',
    internalConsumption: '5',
    crateSize: '30',
    recordedBy: 'Egg Collection Lead',
    notes: '',
  });

  // 8. Poultry Sale Form
  const [saleForm, setSaleForm] = useState({
    farmId: selectedFarm?.id || farms[0]?.id || 'farm-001',
    flockId: flocks[0]?.id || '',
    invoiceNumber: `INV-PLT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    productType: 'live_birds' as PoultryProductType,
    productDescription: 'Grade A Live Commercial Broilers (2.2kg avg)',
    buyerName: '',
    buyerPhone: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '100',
    unit: 'birds' as PoultrySaleRecord['unit'],
    unitPrice: '4800',
    discount: '0',
    amountPaid: '',
    paymentMethod: 'Bank Transfer' as PoultrySaleRecord['paymentMethod'],
    notes: '',
  });

  // KPI Aggregates
  const totalBirds = useMemo(() => {
    return flocks.reduce((sum, f) => sum + (f.currentBirdCount || 0), 0);
  }, [flocks]);

  const activeFlocksCount = useMemo(() => {
    return flocks.filter((f) => f.status === 'active').length;
  }, [flocks]);

  const totalPoultryRevenue = useMemo(() => {
    return poultrySales.reduce((sum, s) => sum + (s.netAmount || s.totalAmount || 0), 0);
  }, [poultrySales]);

  const totalPoultryCashReceived = useMemo(() => {
    return poultrySales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
  }, [poultrySales]);

  const totalPoultryDebt = useMemo(() => {
    return poultrySales.reduce((sum, s) => sum + (s.outstandingAmount || 0), 0);
  }, [poultrySales]);

  const totalFeedStockKg = useMemo(() => {
    return feedInventory.reduce((sum, f) => sum + (f.totalWeightKg || f.quantityBags * f.bagWeightKg), 0);
  }, [feedInventory]);

  const totalFeedStockBags = useMemo(() => {
    return feedInventory.reduce((sum, f) => sum + (f.quantityBags || 0), 0);
  }, [feedInventory]);

  const lowFeedAlerts = useMemo(() => {
    return feedInventory.filter((f) => f.quantityBags <= f.reorderLevelBags);
  }, [feedInventory]);

  const totalMortalities = useMemo(() => {
    return flockMovements
      .filter((m) => m.type === 'mortality')
      .reduce((sum, m) => sum + m.quantity, 0);
  }, [flockMovements]);

  const totalInitialBirds = useMemo(() => {
    return flocks.reduce((sum, f) => sum + (f.initialBirdCount || 0), 0);
  }, [flocks]);

  const overallMortalityRate = useMemo(() => {
    return totalInitialBirds > 0 ? (totalMortalities / totalInitialBirds) * 100 : 0;
  }, [totalInitialBirds, totalMortalities]);

  const totalEggsToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return eggProductionRecords
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + e.totalEggsCollected, 0);
  }, [eggProductionRecords]);

  const totalEggStockPieces = useMemo(() => {
    const totalCollected = eggProductionRecords.reduce((sum, e) => sum + e.saleableEggs, 0);
    const eggsSoldPieces = poultrySales
      .filter((s) => s.productType === 'eggs_crates' || s.productType === 'eggs_pieces')
      .reduce((sum, s) => {
        if (s.unit === 'crates_30') return sum + s.quantity * 30;
        return sum + s.quantity;
      }, 0);
    return Math.max(0, totalCollected - eggsSoldPieces);
  }, [eggProductionRecords, poultrySales]);

  // Form Submissions
  const handleFlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flockForm.name || !flockForm.initialBirdCount) return;

    await addFlock({
      farmId: flockForm.farmId,
      houseId: flockForm.houseId || undefined,
      name: flockForm.name,
      poultryType: flockForm.poultryType,
      breed: flockForm.breed,
      purpose: flockForm.purpose,
      initialBirdCount: parseInt(flockForm.initialBirdCount, 10),
      currentBirdCount: parseInt(flockForm.initialBirdCount, 10),
      acquisitionDate: flockForm.acquisitionDate,
      supplier: flockForm.supplier,
      unitPurchasePrice: parseFloat(flockForm.unitPurchasePrice) || 0,
      totalAcquisitionCost:
        (parseInt(flockForm.initialBirdCount, 10) || 0) * (parseFloat(flockForm.unitPurchasePrice) || 0),
      status: flockForm.status,
      targetWeightKg: parseFloat(flockForm.targetWeightKg) || undefined,
      notes: flockForm.notes,
    });

    setIsAddFlockOpen(false);
    setFlockForm({
      ...flockForm,
      name: '',
      notes: '',
    });
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(movementForm.quantity, 10);
    if (!movementForm.flockId || !qty || qty <= 0) return;

    const target = flocks.find((f) => f.id === movementForm.flockId);
    if (movementForm.type !== 'addition' && target && qty > target.currentBirdCount) {
      showToast({
        type: 'error',
        title: 'Insufficient Birds',
        message: `Cannot record ${qty} ${movementForm.type} on flock ${target.name} which has only ${target.currentBirdCount} live birds.`,
      });
      return;
    }

    await addFlockMovement({
      farmId: target?.farmId || selectedFarm?.id || 'farm-001',
      flockId: movementForm.flockId,
      date: movementForm.date,
      type: movementForm.type,
      quantity: qty,
      reason: movementForm.reason,
      causeOfDeath: movementForm.causeOfDeath,
      performedBy: movementForm.performedBy,
      notes: movementForm.notes,
    });

    setIsAddMovementOpen(false);
    setMovementForm({ ...movementForm, quantity: '', reason: '', causeOfDeath: '', notes: '' });
  };

  const handleHouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseForm.name || !houseForm.capacity) return;

    await addPoultryHouse({
      farmId: houseForm.farmId,
      name: houseForm.name,
      capacity: parseInt(houseForm.capacity, 10) || 1000,
      housingType: houseForm.housingType,
      locationDetails: houseForm.locationDetails,
      status: houseForm.status,
      notes: houseForm.notes,
    });

    setIsAddHouseOpen(false);
    setHouseForm({ ...houseForm, name: '', notes: '' });
  };

  const handleFeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedForm.feedName || !feedForm.quantityBags) return;

    await addFeedInventory({
      farmId: feedForm.farmId,
      feedName: feedForm.feedName,
      brand: feedForm.brand,
      category: feedForm.category,
      quantityBags: parseInt(feedForm.quantityBags, 10) || 0,
      bagWeightKg: parseFloat(feedForm.bagWeightKg) || 25,
      totalWeightKg: (parseInt(feedForm.quantityBags, 10) || 0) * (parseFloat(feedForm.bagWeightKg) || 25),
      costPerBag: parseFloat(feedForm.costPerBag) || 0,
      costPerKg: Math.round((parseFloat(feedForm.costPerBag) || 0) / (parseFloat(feedForm.bagWeightKg) || 25)),
      reorderLevelBags: parseInt(feedForm.reorderLevelBags, 10) || 10,
      supplier: feedForm.supplier,
      dateReceived: feedForm.dateReceived,
      location: feedForm.location,
      notes: feedForm.notes,
    });

    setIsAddFeedOpen(false);
    setFeedForm({ ...feedForm, feedName: '', notes: '' });
  };

  const handleFeedConsumptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyBags = parseFloat(feedConsForm.quantityBags) || 0;
    if (!feedConsForm.flockId || qtyBags <= 0) return;

    const chosenFeed = feedInventory.find((f) => f.id === feedConsForm.feedInventoryItemId);
    const bagWeight = chosenFeed ? chosenFeed.bagWeightKg : parseFloat(feedConsForm.bagWeightKg) || 25;
    const costKg = chosenFeed ? chosenFeed.costPerKg : parseFloat(feedConsForm.costPerKg) || 740;

    if (chosenFeed && qtyBags > chosenFeed.quantityBags) {
      showToast({
        type: 'error',
        title: 'Insufficient Feed Inventory',
        message: `Warehouse only has ${chosenFeed.quantityBags} bags of ${chosenFeed.feedName} available.`,
      });
      return;
    }

    await addFeedConsumption({
      farmId: selectedFarm?.id || 'farm-001',
      flockId: feedConsForm.flockId,
      feedInventoryItemId: chosenFeed?.id,
      feedName: chosenFeed?.feedName || feedConsForm.feedName,
      feedCategory: chosenFeed?.category || feedConsForm.feedCategory,
      date: feedConsForm.date,
      quantityBags: qtyBags,
      bagWeightKg: bagWeight,
      quantityKg: qtyBags * bagWeight,
      costPerKg: costKg,
      recordedBy: feedConsForm.recordedBy,
      notes: feedConsForm.notes,
    });

    setIsLogFeedConsumptionOpen(false);
  };

  const handleHealthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthForm.flockId || !healthForm.medicationOrVaccineName) return;

    const costNum = parseFloat(healthForm.cost) || 0;
    const mortalityNum = parseInt(healthForm.mortalityRecordedOnDate, 10) || 0;

    await addFlockHealth({
      farmId: selectedFarm?.id || 'farm-001',
      flockId: healthForm.flockId,
      date: healthForm.date,
      recordType: healthForm.recordType,
      diseaseOrPurpose: healthForm.diseaseOrPurpose,
      medicationOrVaccineName: healthForm.medicationOrVaccineName,
      route: healthForm.route,
      cost: costNum,
      administeredBy: healthForm.administeredBy,
      mortalityRecordedOnDate: mortalityNum,
      nextFollowUpDate: healthForm.nextFollowUpDate || undefined,
      notes: healthForm.notes,
    });

    if (healthForm.scheduleAsTask && healthForm.nextFollowUpDate) {
      const flock = flocks.find((f) => f.id === healthForm.flockId);
      await addTask({
        title: `Follow-up Health / Booster: ${healthForm.medicationOrVaccineName}`,
        description: `Flock: ${flock?.name || 'Poultry Batch'}. Purpose: ${healthForm.diseaseOrPurpose}. Route: ${healthForm.route}`,
        dueDate: healthForm.nextFollowUpDate,
        priority: 'high',
        status: 'pending',
        assignedTo: healthForm.administeredBy,
        category: 'General',
        isReminderActive: true,
        reminderDate: healthForm.nextFollowUpDate,
        reminderTime: '08:30',
      });
    }

    setIsAddHealthOpen(false);
  };

  const handleEggSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalCollected = parseInt(eggForm.totalEggsCollected, 10) || 0;
    if (!eggForm.flockId || totalCollected <= 0) return;

    await addEggProduction({
      farmId: selectedFarm?.id || 'farm-001',
      flockId: eggForm.flockId,
      date: eggForm.date,
      totalEggsCollected: totalCollected,
      saleableEggs: parseInt(eggForm.saleableEggs, 10) || totalCollected,
      brokenCrackedEggs: parseInt(eggForm.brokenCrackedEggs, 10) || 0,
      internalConsumption: parseInt(eggForm.internalConsumption, 10) || 0,
      cratesCount: Math.floor(totalCollected / (parseInt(eggForm.crateSize, 10) || 30)),
      crateSize: parseInt(eggForm.crateSize, 10) || 30,
      recordedBy: eggForm.recordedBy,
      notes: eggForm.notes,
    });

    setIsLogEggOpen(false);
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(saleForm.quantity) || 0;
    const unitPrice = parseFloat(saleForm.unitPrice) || 0;
    const discount = parseFloat(saleForm.discount) || 0;
    const amountPaid = parseFloat(saleForm.amountPaid) || 0;
    const totalAmount = qty * unitPrice;
    const netAmount = Math.max(0, totalAmount - discount);

    if (qty <= 0 || unitPrice <= 0 || !saleForm.buyerName) return;

    // Guard against selling more birds than live flock count
    if (saleForm.productType === 'live_birds' || saleForm.productType === 'dressed_birds') {
      const flock = flocks.find((f) => f.id === saleForm.flockId);
      if (flock && qty > flock.currentBirdCount) {
        showToast({
          type: 'error',
          title: 'Stock Exceeded',
          message: `Cannot sell ${qty} birds. Active flock ${flock.name} only has ${flock.currentBirdCount} birds available!`,
        });
        return;
      }
    }

    // Guard against selling more eggs than available
    if (saleForm.productType === 'eggs_crates') {
      const cratesRequested = qty;
      const cratesAvailable = Math.floor(totalEggStockPieces / 30);
      if (cratesRequested > cratesAvailable && cratesAvailable > 0) {
        showToast({
          type: 'warning',
          title: 'Egg Inventory Warning',
          message: `Requested ${cratesRequested} crates exceeds current available stock of ${cratesAvailable} crates.`,
        });
      }
    }

    await addPoultrySale({
      farmId: selectedFarm?.id || 'farm-001',
      flockId: saleForm.flockId || undefined,
      invoiceNumber: saleForm.invoiceNumber,
      productType: saleForm.productType,
      productDescription: saleForm.productDescription,
      buyerName: saleForm.buyerName,
      buyerPhone: saleForm.buyerPhone,
      date: saleForm.date,
      quantity: qty,
      unit: saleForm.unit,
      unitPrice,
      totalAmount,
      discount,
      netAmount,
      amountPaid,
      outstandingAmount: Math.max(0, netAmount - amountPaid),
      paymentStatus: Math.max(0, netAmount - amountPaid) === 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'outstanding',
      paymentMethod: saleForm.paymentMethod,
      notes: saleForm.notes,
    });

    setIsAddSaleOpen(false);
    setSaleForm({
      ...saleForm,
      invoiceNumber: `INV-PLT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      buyerName: '',
      buyerPhone: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Enterprise Title & Farm Selector Header */}
      <div className="bg-white border border-[#181a19]/10 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#16422b] uppercase tracking-wider mb-1">
            <Feather className="w-4 h-4 text-emerald-700" />
            <span>Commercial Poultry Section</span>
            <span className="text-[#181a19]/30">·</span>
            <span className="font-mono text-[11px] text-[#181a19]/60">
              {selectedFarm?.name || 'Poultry Estate'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181a19]">
            Poultry Flocks & Production Command
          </h2>
          <p className="text-xs sm:text-sm text-[#181a19]/65 mt-0.5">
            Monitor bird populations, feed conversion, vaccination schedules, egg yields, and batch profit margins.
          </p>
        </div>

        {/* Quick Action Button Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddFlockOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Flock</span>
          </button>

          <button
            onClick={() => {
              setMovementFlockId(flocks[0]?.id || '');
              setIsAddMovementOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-xl transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Log Mortality/Cull</span>
          </button>

          <button
            onClick={() => setIsLogFeedConsumptionOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-xl transition-colors"
          >
            <Wheat className="w-3.5 h-3.5 text-amber-600" />
            <span>Log Feed Intake</span>
          </button>

          <button
            onClick={() => setIsAddSaleOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* 6 Top KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Live Bird Population */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Bird Population</span>
            <Feather className="w-4 h-4 text-[#16422b]" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-[#181a19]">
            {totalBirds.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-[#181a19]/60">
            Across {activeFlocksCount} active flocks
          </div>
        </div>

        {/* 2. Feed Warehouse Stock */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Feed Stock</span>
            <Wheat className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-[#181a19]">
            {totalFeedStockBags}{' '}
            <span className="text-xs font-normal text-[#181a19]/50">bags</span>
          </div>
          <div className="mt-1 text-[11px] text-[#181a19]/60">
            {formatWeight(totalFeedStockKg)} available
          </div>
        </div>

        {/* 3. Egg Production */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Egg Inventory</span>
            <Egg className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-[#181a19]">
            {Math.floor(totalEggStockPieces / 30)}{' '}
            <span className="text-xs font-normal text-[#181a19]/50">crates</span>
          </div>
          <div className="mt-1 text-[11px] text-[#181a19]/60">
            {totalEggsToday > 0 ? `+${totalEggsToday.toLocaleString()} today` : `${totalEggStockPieces.toLocaleString()} pieces`}
          </div>
        </div>

        {/* 4. Mortality Rate */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Flock Mortality</span>
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-rose-700">
            {overallMortalityRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-[#181a19]/60">
            {totalMortalities.toLocaleString()} birds recorded
          </div>
        </div>

        {/* 5. Poultry Sales Recognized */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Poultry Revenue</span>
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-[#16422b]">
            {formatNaira(totalPoultryRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-[#181a19]/60">
            Cash: {formatNaira(totalPoultryCashReceived)}
          </div>
        </div>

        {/* 6. Outstanding Receivables */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/60 mb-1">
            <span>Customer Debt</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-amber-800">
            {formatNaira(totalPoultryDebt)}
          </div>
          <div className="mt-1 text-[11px] text-[#181a19]/60">
            Unpaid buyer balances
          </div>
        </div>
      </div>

      {/* Low Feed Warnings Banner */}
      {lowFeedAlerts.length > 0 && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Low Feed Reorder Alert:</strong> The following feed items are below safe buffer:{' '}
              {lowFeedAlerts.map((f) => `${f.feedName} (${f.quantityBags} bags left, reorder at ${f.reorderLevelBags})`).join(', ')}.
            </span>
          </div>
          <button
            onClick={() => {
              setActiveTab('feed');
              setIsAddFeedOpen(true);
            }}
            className="font-semibold underline hover:text-amber-900 shrink-0"
          >
            Restock Warehouse &rarr;
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-[#181a19]/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('flocks')}
          className={`px-3 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'flocks'
              ? 'bg-[#16422b] text-white font-semibold shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#181a19]/5'
          }`}
        >
          <Feather className="w-3.5 h-3.5" />
          <span>Flocks & Population ({flocks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('housing')}
          className={`px-3 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'housing'
              ? 'bg-[#16422b] text-white font-semibold shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#181a19]/5'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Poultry Houses & Pens ({poultryHouses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`px-3 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'feed'
              ? 'bg-[#16422b] text-white font-semibold shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#181a19]/5'
          }`}
        >
          <Wheat className="w-3.5 h-3.5" />
          <span>Feed Inventory & Intake ({feedInventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`px-3 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'health'
              ? 'bg-[#16422b] text-white font-semibold shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#181a19]/5'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Health, Vaccines & Mortality</span>
        </button>

        <button
          onClick={() => setActiveTab('eggs')}
          className={`px-3 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'eggs'
              ? 'bg-[#16422b] text-white font-semibold shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#181a19]/5'
          }`}
        >
          <Egg className="w-3.5 h-3.5" />
          <span>Egg Production</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`px-3 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sales'
              ? 'bg-[#16422b] text-white font-semibold shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#181a19]/5'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Poultry Sales ({poultrySales.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profitability')}
          className={`px-3 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'profitability'
              ? 'bg-[#16422b] text-white font-semibold shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#181a19]/5'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Batch Profitability Engine</span>
        </button>
      </div>

      {/* TAB 1: FLOCKS & POPULATION */}
      {activeTab === 'flocks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">Registered Poultry Flocks</h3>
              <p className="text-xs text-[#181a19]/60">
                Track breed lines, acquisition costs, current live counts, and movements.
              </p>
            </div>

            <button
              onClick={() => setIsAddFlockOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Flock</span>
            </button>
          </div>

          {flocks.length === 0 ? (
            <div className="p-8 bg-white border border-[#181a19]/10 rounded-2xl text-center shadow-xs">
              <Feather className="w-10 h-10 text-[#181a19]/30 mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#181a19]">No Poultry Flocks Registered</h4>
              <p className="text-xs text-[#181a19]/60 max-w-md mx-auto mt-1 mb-4">
                Register your first flock of broilers, layers, cockerels, or turkeys to track mortality, feed intake, and profit margins.
              </p>
              <button
                onClick={() => setIsAddFlockOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl shadow-xs"
              >
                + Register First Flock
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flocks.map((flock) => {
                const house = poultryHouses.find((h) => h.id === flock.houseId);
                const flockMovementsForThis = flockMovements.filter((m) => m.flockId === flock.id);
                const mortalities = flockMovementsForThis
                  .filter((m) => m.type === 'mortality')
                  .reduce((s, m) => s + m.quantity, 0);
                const mortalityPct =
                  flock.initialBirdCount > 0 ? (mortalities / flock.initialBirdCount) * 100 : 0;

                return (
                  <div
                    key={flock.id}
                    className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {flock.poultryType}
                          </span>
                          <h4 className="text-base font-bold text-[#181a19] mt-1.5">{flock.name}</h4>
                          <p className="text-xs text-[#181a19]/60">
                            {flock.breed} · {flock.purpose}
                          </p>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm capitalize ${
                            flock.status === 'active'
                              ? 'bg-emerald-100/80 text-emerald-900'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {flock.status}
                        </span>
                      </div>

                      {/* Population Stats */}
                      <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/5 text-xs">
                        <div>
                          <span className="text-[11px] text-[#181a19]/50 block">Live Count</span>
                          <span className="text-base font-bold font-mono text-[#16422b]">
                            {flock.currentBirdCount?.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#181a19]/50 block">Initial Received</span>
                          <span className="font-mono font-medium text-[#181a19]">
                            {flock.initialBirdCount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#181a19]/50 block">Mortality Rate</span>
                          <span className="font-mono text-rose-700 font-semibold">
                            {mortalityPct.toFixed(1)}% ({mortalities})
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#181a19]/50 block">Pen / House</span>
                          <span className="truncate font-medium text-[#181a19]">
                            {house?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-[#181a19]/70">
                        <div className="flex justify-between">
                          <span>Hatchery:</span>
                          <span className="font-medium text-[#181a19]">{flock.supplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Acquisition Date:</span>
                          <span className="font-mono text-[11px]">{flock.acquisitionDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Acquisition Cost:</span>
                          <span className="font-mono font-semibold text-[#181a19]">
                            {formatNaira(flock.totalAcquisitionCost)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#181a19]/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setMovementFlockId(flock.id);
                          setMovementForm({ ...movementForm, flockId: flock.id });
                          setIsAddMovementOpen(true);
                        }}
                        className="text-xs font-semibold text-[#16422b] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log Movement / Mortality</span>
                      </button>

                      <button
                        onClick={() => deleteFlock(flock.id)}
                        className="text-xs text-[#181a19]/40 hover:text-rose-600 transition-colors p-1"
                        title="Delete flock record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Movement History Table */}
          {flockMovements.length > 0 && (
            <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#181a19]">Recorded Bird Movements</h4>
                  <p className="text-xs text-[#181a19]/60">
                    Audit trail of all mortalities, culls, transfers, and additions.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fafaf7] border-y border-[#181a19]/10 text-[#181a19]/60">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Flock</th>
                      <th className="py-2.5 px-3 font-semibold">Type</th>
                      <th className="py-2.5 px-3 font-semibold">Birds</th>
                      <th className="py-2.5 px-3 font-semibold">Reason / Cause</th>
                      <th className="py-2.5 px-3 font-semibold">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {flockMovements.map((m) => {
                      const flk = flocks.find((f) => f.id === m.flockId);
                      return (
                        <tr key={m.id} className="hover:bg-[#fafaf7]/50">
                          <td className="py-2.5 px-3 font-mono">{m.date}</td>
                          <td className="py-2.5 px-3 font-medium text-[#181a19]">{flk?.name || 'Batch'}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-sm capitalize font-semibold text-[10px] ${
                                m.type === 'mortality'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : m.type === 'cull'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : m.type === 'sale'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {m.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#181a19]">
                            {m.type === 'addition' ? `+${m.quantity}` : `-${m.quantity}`}
                          </td>
                          <td className="py-2.5 px-3 text-[#181a19]/70">
                            {m.causeOfDeath || m.reason || 'Routine movement'}
                          </td>
                          <td className="py-2.5 px-3 text-[#181a19]/60">{m.performedBy}</td>
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

      {/* TAB 2: POULTRY HOUSING & PENS */}
      {activeTab === 'housing' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">Poultry Houses & Pens</h3>
              <p className="text-xs text-[#181a19]/60">
                Manage deep litter sheds, California cages, and brooder pens with strict capacity monitoring.
              </p>
            </div>

            <button
              onClick={() => setIsAddHouseOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Housing Pen</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {poultryHouses.map((house) => {
              const assignedFlocks = flocks.filter((f) => f.houseId === house.id && f.status === 'active');
              const currentBirdsInHouse = assignedFlocks.reduce(
                (sum, f) => sum + (f.currentBirdCount || 0),
                0
              );
              const capacityPct = Math.round((currentBirdsInHouse / (house.capacity || 1)) * 100);
              const isOverCapacity = currentBirdsInHouse > house.capacity;

              return (
                <div
                  key={house.id}
                  className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#16422b] font-medium">
                          <Home className="w-3.5 h-3.5" />
                          <span>{house.housingType}</span>
                        </div>
                        <h4 className="text-base font-bold text-[#181a19] mt-0.5">{house.name}</h4>
                        <p className="text-xs text-[#181a19]/60">{house.locationDetails}</p>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm capitalize ${
                          house.status === 'active'
                            ? 'bg-emerald-100/80 text-emerald-900'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {house.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Capacity Indicator Meter */}
                    <div className="p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#181a19]/60">Pen Occupancy:</span>
                        <span className="font-bold text-[#181a19]">
                          {currentBirdsInHouse.toLocaleString()} / {house.capacity.toLocaleString()} birds
                        </span>
                      </div>

                      <div className="w-full bg-[#181a19]/10 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isOverCapacity
                              ? 'bg-rose-600'
                              : capacityPct > 85
                              ? 'bg-amber-500'
                              : 'bg-[#16422b]'
                          }`}
                          style={{ width: `${Math.min(100, capacityPct)}%` }}
                        />
                      </div>

                      {isOverCapacity && (
                        <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-semibold bg-rose-50 p-2 rounded-md border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Over capacity by {(currentBirdsInHouse - house.capacity).toLocaleString()} birds!
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Assigned Flocks */}
                    <div className="text-xs space-y-1">
                      <span className="text-[11px] font-semibold text-[#181a19]/50 uppercase tracking-wider block">
                        Assigned Flocks
                      </span>
                      {assignedFlocks.length > 0 ? (
                        assignedFlocks.map((f) => (
                          <div
                            key={f.id}
                            className="flex justify-between items-center text-xs py-1 border-b border-[#181a19]/5"
                          >
                            <span className="font-medium text-[#181a19]">{f.name}</span>
                            <span className="font-mono text-[#16422b]">
                              {f.currentBirdCount.toLocaleString()} birds
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#181a19]/40 italic">No flock currently assigned.</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#181a19]/5 flex justify-end">
                    <button
                      onClick={() => deletePoultryHouse(house.id)}
                      className="text-[#181a19]/40 hover:text-rose-600 p-1 transition-colors"
                      title="Delete pen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FEED INVENTORY & CONSUMPTION */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">Feed Inventory & Intake Records</h3>
              <p className="text-xs text-[#181a19]/60">
                Track bag purchases in warehouse and daily flock consumption without double-counting costs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddFeedOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Restock Feed</span>
              </button>

              <button
                onClick={() => setIsLogFeedConsumptionOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-xl transition-colors"
              >
                <Wheat className="w-3.5 h-3.5 text-amber-600" />
                <span>Log Flock Intake</span>
              </button>
            </div>
          </div>

          {/* Feed Warehouse Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedInventory.map((feed) => {
              const isLow = feed.quantityBags <= feed.reorderLevelBags;
              return (
                <div
                  key={feed.id}
                  className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 ${
                    isLow ? 'border-amber-400/80 bg-amber-50/20' : 'border-[#181a19]/10'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#16422b]/10 text-[#16422b]">
                          {feed.category}
                        </span>
                        <h4 className="text-base font-bold text-[#181a19] mt-1">{feed.feedName}</h4>
                        <p className="text-xs text-[#181a19]/60">
                          {feed.brand} · {feed.bagWeightKg}kg bags
                        </p>
                      </div>

                      {isLow && (
                        <span className="text-[10px] font-semibold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-sm flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Low
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/5 text-xs">
                      <div>
                        <span className="text-[11px] text-[#181a19]/50 block">Available Bags</span>
                        <span className="text-base font-bold font-mono text-[#181a19]">
                          {feed.quantityBags} bags
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#181a19]/50 block">Total Weight</span>
                        <span className="font-mono font-medium text-[#181a19]">
                          {feed.totalWeightKg.toLocaleString()} kg
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#181a19]/50 block">Cost / Bag</span>
                        <span className="font-mono text-[#16422b] font-semibold">
                          {formatNaira(feed.costPerBag)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#181a19]/50 block">Cost / Kg</span>
                        <span className="font-mono font-medium text-[#181a19]">
                          {formatNaira(feed.costPerKg)}/kg
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-[#181a19]/60 flex justify-between">
                      <span>Supplier: {feed.supplier}</span>
                      <span>Received: {feed.dateReceived}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#181a19]/5 flex justify-end">
                    <button
                      onClick={() => deleteFeedInventory(feed.id)}
                      className="text-[#181a19]/40 hover:text-rose-600 p-1 transition-colors"
                      title="Delete feed item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consumption History Table */}
          <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#181a19]">Flock Feed Consumption History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafaf7] border-y border-[#181a19]/10 text-[#181a19]/60">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Flock</th>
                    <th className="py-2.5 px-3 font-semibold">Feed Type</th>
                    <th className="py-2.5 px-3 font-semibold">Quantity</th>
                    <th className="py-2.5 px-3 font-semibold">Cost / Kg</th>
                    <th className="py-2.5 px-3 font-semibold">Calculated Cost</th>
                    <th className="py-2.5 px-3 font-semibold">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181a19]/5">
                  {feedConsumption.map((rec) => {
                    const flock = flocks.find((f) => f.id === rec.flockId);
                    return (
                      <tr key={rec.id} className="hover:bg-[#fafaf7]/50">
                        <td className="py-2.5 px-3 font-mono">{rec.date}</td>
                        <td className="py-2.5 px-3 font-medium text-[#181a19]">{flock?.name || 'Batch'}</td>
                        <td className="py-2.5 px-3">{rec.feedName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#181a19]">
                          {rec.quantityBags} bags ({rec.quantityKg} kg)
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#181a19]/70">{formatNaira(rec.costPerKg)}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#16422b]">
                          {formatNaira(rec.calculatedCost)}
                        </td>
                        <td className="py-2.5 px-3 text-[#181a19]/60">{rec.recordedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HEALTH, VACCINES & MORTALITY */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">Health, Vaccination & Veterinary Log</h3>
              <p className="text-xs text-[#181a19]/60">
                Track scheduled vaccinations, clinical treatments, and disease incident mortality.
              </p>
            </div>

            <button
              onClick={() => setIsAddHealthOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Vaccination / Treatment</span>
            </button>
          </div>

          {/* Veterinary Disclaimer */}
          <div className="p-3 bg-blue-50/80 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <strong>Veterinary Record Keeping Disclaimer:</strong> FarmPilot assists in flock record keeping and reminder schedules. It does not provide veterinary medical diagnoses or replace consultations with a registered veterinary practitioner.
            </span>
          </div>

          <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafaf7] border-y border-[#181a19]/10 text-[#181a19]/60">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Flock</th>
                    <th className="py-2.5 px-3 font-semibold">Event Type</th>
                    <th className="py-2.5 px-3 font-semibold">Vaccine / Medication</th>
                    <th className="py-2.5 px-3 font-semibold">Route</th>
                    <th className="py-2.5 px-3 font-semibold">Treatment Cost</th>
                    <th className="py-2.5 px-3 font-semibold">Administered By</th>
                    <th className="py-2.5 px-3 font-semibold">Next Follow-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181a19]/5">
                  {flockHealthRecords.map((rec) => {
                    const flock = flocks.find((f) => f.id === rec.flockId);
                    return (
                      <tr key={rec.id} className="hover:bg-[#fafaf7]/50">
                        <td className="py-2.5 px-3 font-mono">{rec.date}</td>
                        <td className="py-2.5 px-3 font-medium text-[#181a19]">{flock?.name || 'Batch'}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-sm capitalize text-[10px] font-semibold ${
                              rec.recordType === 'vaccination'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {rec.recordType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-medium text-[#181a19]">{rec.medicationOrVaccineName}</p>
                          <p className="text-[11px] text-[#181a19]/50">{rec.diseaseOrPurpose}</p>
                        </td>
                        <td className="py-2.5 px-3 text-[#181a19]/70">{rec.route}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#181a19]">
                          {formatNaira(rec.cost)}
                        </td>
                        <td className="py-2.5 px-3 text-[#181a19]/60">{rec.administeredBy}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-amber-700">
                          {rec.nextFollowUpDate || 'None'}
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

      {/* TAB 5: EGG PRODUCTION */}
      {activeTab === 'eggs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">Egg Collection & Laying Rate</h3>
              <p className="text-xs text-[#181a19]/60">
                Daily collection counts, crate conversions (30 eggs/crate), and hen-day laying rate tracking.
              </p>
            </div>

            <button
              onClick={() => setIsLogEggOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Daily Egg Collection</span>
            </button>
          </div>

          <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafaf7] border-y border-[#181a19]/10 text-[#181a19]/60">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Flock</th>
                    <th className="py-2.5 px-3 font-semibold">Total Eggs</th>
                    <th className="py-2.5 px-3 font-semibold">Saleable</th>
                    <th className="py-2.5 px-3 font-semibold">Cracked / Broken</th>
                    <th className="py-2.5 px-3 font-semibold">Crates (30)</th>
                    <th className="py-2.5 px-3 font-semibold">Laying Rate %</th>
                    <th className="py-2.5 px-3 font-semibold">Collector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181a19]/5">
                  {eggProductionRecords.map((egg) => {
                    const flock = flocks.find((f) => f.id === egg.flockId);
                    return (
                      <tr key={egg.id} className="hover:bg-[#fafaf7]/50">
                        <td className="py-2.5 px-3 font-mono">{egg.date}</td>
                        <td className="py-2.5 px-3 font-medium text-[#181a19]">{flock?.name || 'Layers'}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#181a19]">
                          {egg.totalEggsCollected.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-800">
                          {egg.saleableEggs.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-rose-700">
                          {egg.brokenCrackedEggs.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#16422b]">
                          {egg.cratesCount} crates
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                          {egg.layingRatePercent.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-[#181a19]/60">{egg.recordedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: POULTRY SALES */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">Poultry Sales & Off-taker Invoices</h3>
              <p className="text-xs text-[#181a19]/60">
                Sales invoices for live broilers, spent layers, crates of eggs, and bagged organic manure.
              </p>
            </div>

            <button
              onClick={() => setIsAddSaleOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Poultry Sale</span>
            </button>
          </div>

          <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafaf7] border-y border-[#181a19]/10 text-[#181a19]/60">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Invoice #</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Buyer</th>
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    <th className="py-2.5 px-3 font-semibold">Quantity</th>
                    <th className="py-2.5 px-3 font-semibold">Unit Price</th>
                    <th className="py-2.5 px-3 font-semibold">Recognized Revenue</th>
                    <th className="py-2.5 px-3 font-semibold">Cash Collected</th>
                    <th className="py-2.5 px-3 font-semibold">Balance</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181a19]/5">
                  {poultrySales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#fafaf7]/50">
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#181a19]">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{sale.date}</td>
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-[#181a19]">{sale.buyerName}</p>
                        <p className="text-[11px] text-[#181a19]/50 font-mono">{sale.buyerPhone}</p>
                      </td>
                      <td className="py-2.5 px-3 capitalize">
                        {sale.productType.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#181a19]">
                        {sale.quantity} {sale.unit.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{formatNaira(sale.unitPrice)}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#16422b]">
                        {formatNaira(sale.netAmount)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-800">
                        {formatNaira(sale.amountPaid)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-800">
                        {formatNaira(sale.outstandingAmount)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-sm capitalize text-[10px] font-semibold ${
                            sale.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : sale.paymentStatus === 'partial'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {sale.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: BATCH PROFITABILITY */}
      {activeTab === 'profitability' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">Flock Batch Profitability Analysis</h3>
              <p className="text-xs text-[#181a19]/60">
                Audited margins per flock batch comparing sales revenues against feed, chick, and veterinary costs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flockProfitability.map((summary) => (
              <div
                key={summary.flockId}
                className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {summary.poultryType}
                    </span>
                    <h4 className="text-lg font-bold text-[#181a19] mt-1">{summary.flockName}</h4>
                    <p className="text-xs text-[#181a19]/60">
                      {summary.breed} {summary.houseName ? `· ${summary.houseName}` : ''}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-[#181a19]/60 block">Net Result</span>
                    <span
                      className={`text-lg font-bold font-mono ${
                        summary.netOperatingResultNgn >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                      }`}
                    >
                      {summary.netOperatingResultNgn >= 0 ? '+' : ''}
                      {formatNaira(summary.netOperatingResultNgn)}
                    </span>
                  </div>
                </div>

                {/* Key Cost & Performance Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/5 text-xs">
                  <div>
                    <span className="text-[10px] text-[#181a19]/50 block">Feed Cost / Bird</span>
                    <span className="font-mono font-bold text-[#181a19]">
                      {formatNaira(summary.feedCostPerBird)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#181a19]/50 block">Rev / Bird Sold</span>
                    <span className="font-mono font-bold text-[#16422b]">
                      {summary.revenuePerBirdSold > 0 ? formatNaira(summary.revenuePerBirdSold) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#181a19]/50 block">Mortality %</span>
                    <span className="font-mono font-bold text-rose-700">
                      {summary.mortalityRatePercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#181a19]/50 block">Chick Cost</span>
                    <span className="font-mono text-[#181a19]">
                      {formatNaira(summary.chickAcquisitionCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#181a19]/50 block">Feed Consumed</span>
                    <span className="font-mono text-[#181a19]">
                      {formatNaira(summary.feedConsumedCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#181a19]/50 block">Vet & Med Cost</span>
                    <span className="font-mono text-[#181a19]">
                      {formatNaira(summary.vetMedicationCost)}
                    </span>
                  </div>
                </div>

                {/* Egg metrics if layer */}
                {summary.totalEggsCollected && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-amber-900 block">Layer Production Summary</span>
                      <span className="text-[11px] text-amber-800/80">
                        Total {summary.totalEggsCollected.toLocaleString()} eggs collected · Avg laying rate:{' '}
                        {summary.layingRateAveragePercent}%
                      </span>
                    </div>
                    {summary.costPerEggNgn && (
                      <div className="text-right">
                        <span className="text-[10px] text-amber-900/60 block">Cost / Egg</span>
                        <span className="font-mono font-bold text-amber-950">
                          {formatNaira(summary.costPerEggNgn, true)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* 1. Add Flock Modal */}
      <Modal
        isOpen={isAddFlockOpen}
        onClose={() => setIsAddFlockOpen(false)}
        title="Register New Poultry Flock"
        subtitle="Acquisition details, breed, purpose, and housing assignment"
      >
        <form onSubmit={handleFlockSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#181a19] mb-1">Flock Name / Batch ID *</label>
            <input
              type="text"
              required
              placeholder="e.g. Broiler Batch 24-C or Isa Brown Layers Q2"
              value={flockForm.name}
              onChange={(e) => setFlockForm({ ...flockForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Poultry Type *</label>
              <select
                value={flockForm.poultryType}
                onChange={(e) =>
                  setFlockForm({ ...flockForm, poultryType: e.target.value as PoultryType })
                }
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="Broilers">Broilers (Meat)</option>
                <option value="Layers">Layers (Eggs)</option>
                <option value="Cockerels">Cockerels</option>
                <option value="Noilers">Noilers (Dual Purpose)</option>
                <option value="Turkeys">Turkeys</option>
                <option value="Ducks">Ducks</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Breed Line *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cobb 500, Ross 308, Isa Brown, Marshall"
                value={flockForm.breed}
                onChange={(e) => setFlockForm({ ...flockForm, breed: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Bird Purpose</label>
              <select
                value={flockForm.purpose}
                onChange={(e) =>
                  setFlockForm({ ...flockForm, purpose: e.target.value as BirdPurpose })
                }
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="Meat (Broiler)">Meat (Broiler)</option>
                <option value="Egg Production (Layer)">Egg Production (Layer)</option>
                <option value="Dual Purpose">Dual Purpose</option>
                <option value="Breeding">Breeding</option>
                <option value="Rearing / Point of Lay">Rearing / Point of Lay</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Housing Pen / Shed</label>
              <select
                value={flockForm.houseId}
                onChange={(e) => setFlockForm({ ...flockForm, houseId: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="">-- Unassigned --</option>
                {poultryHouses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.capacity.toLocaleString()} bird capacity)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Number Acquired *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="1000"
                value={flockForm.initialBirdCount}
                onChange={(e) => setFlockForm({ ...flockForm, initialBirdCount: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Price per Bird (₦) *</label>
              <input
                type="number"
                required
                placeholder="850"
                value={flockForm.unitPurchasePrice}
                onChange={(e) => setFlockForm({ ...flockForm, unitPurchasePrice: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Acquisition Date *</label>
              <input
                type="date"
                required
                value={flockForm.acquisitionDate}
                onChange={(e) => setFlockForm({ ...flockForm, acquisitionDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Hatchery / Supplier</label>
              <input
                type="text"
                placeholder="e.g. CHI Farms, Zartech, Animal Care"
                value={flockForm.supplier}
                onChange={(e) => setFlockForm({ ...flockForm, supplier: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Target Liveweight (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="2.4"
                value={flockForm.targetWeightKg}
                onChange={(e) => setFlockForm({ ...flockForm, targetWeightKg: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setIsAddFlockOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl shadow-xs"
            >
              Save Flock
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Record Movement Modal (Mortality, Cull, Transfer) */}
      <Modal
        isOpen={isAddMovementOpen}
        onClose={() => setIsAddMovementOpen(false)}
        title="Record Flock Movement / Mortality"
        subtitle="Deduct mortalities or culls to keep live bird counts strictly synchronized"
      >
        <form onSubmit={handleMovementSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#181a19] mb-1">Select Flock *</label>
            <select
              value={movementForm.flockId}
              onChange={(e) => setMovementForm({ ...movementForm, flockId: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              {flocks.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.currentBirdCount?.toLocaleString()} live birds)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Movement Type *</label>
              <select
                value={movementForm.type}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, type: e.target.value as FlockMovementType })
                }
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="mortality">Mortality (Bird Death)</option>
                <option value="cull">Cull (Runted / Non-laying)</option>
                <option value="addition">Addition (Restocking)</option>
                <option value="transfer">Transfer to Pen</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Number of Birds *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="10"
                value={movementForm.quantity}
                onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Date *</label>
              <input
                type="date"
                required
                value={movementForm.date}
                onChange={(e) => setMovementForm({ ...movementForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#181a19] mb-1">
              Cause / Observed Condition
            </label>
            <input
              type="text"
              placeholder="e.g. Heat stress, dehydration, coccidiosis suspicion, natural culling"
              value={movementForm.causeOfDeath}
              onChange={(e) => setMovementForm({ ...movementForm, causeOfDeath: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#181a19] mb-1">Logged By</label>
            <input
              type="text"
              value={movementForm.performedBy}
              onChange={(e) => setMovementForm({ ...movementForm, performedBy: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setIsAddMovementOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl shadow-xs"
            >
              Update Flock Size
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Add Housing Modal */}
      <Modal
        isOpen={isAddHouseOpen}
        onClose={() => setIsAddHouseOpen(false)}
        title="Register Poultry House / Pen"
        subtitle="Establish housing structures with capacity boundaries"
      >
        <form onSubmit={handleHouseSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#181a19] mb-1">House / Pen Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Pen House 1 (Deep Litter Brooding)"
              value={houseForm.name}
              onChange={(e) => setHouseForm({ ...houseForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Housing System *</label>
              <select
                value={houseForm.housingType}
                onChange={(e) =>
                  setHouseForm({ ...houseForm, housingType: e.target.value as HousingSystemType })
                }
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="Deep Litter System">Deep Litter System</option>
                <option value="Battery Cage System">Battery Cage System</option>
                <option value="Brooder Pen">Brooder Pen (Chicks)</option>
                <option value="Free Range / Pastured">Free Range / Pastured</option>
                <option value="Semi-Intensive System">Semi-Intensive System</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">
                Maximum Bird Capacity *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="2000"
                value={houseForm.capacity}
                onChange={(e) => setHouseForm({ ...houseForm, capacity: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#181a19] mb-1">Location Details</label>
            <input
              type="text"
              placeholder="e.g. East Sector, Building A, equipped with automated bell drinkers"
              value={houseForm.locationDetails}
              onChange={(e) => setHouseForm({ ...houseForm, locationDetails: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setIsAddHouseOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl shadow-xs"
            >
              Create Pen
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Add Feed Inventory Modal */}
      <Modal
        isOpen={isAddFeedOpen}
        onClose={() => setIsAddFeedOpen(false)}
        title="Restock Feed Inventory"
        subtitle="Warehouse stock in bags with explicit conversion to kilograms"
      >
        <form onSubmit={handleFeedSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#181a19] mb-1">Feed Formulation Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. TopFeeds Broiler Finisher Pellets"
              value={feedForm.feedName}
              onChange={(e) => setFeedForm({ ...feedForm, feedName: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Feed Category *</label>
              <select
                value={feedForm.category}
                onChange={(e) =>
                  setFeedForm({ ...feedForm, category: e.target.value as FeedCategory })
                }
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="Starter">Starter</option>
                <option value="Grower">Grower</option>
                <option value="Finisher">Finisher</option>
                <option value="Layer Mash">Layer Mash</option>
                <option value="Pre-Layer">Pre-Layer</option>
                <option value="Broiler Super Starter">Broiler Super Starter</option>
                <option value="Concentrate">Concentrate</option>
                <option value="Custom Farm Formulation">Custom Farm Formulation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Brand</label>
              <input
                type="text"
                placeholder="e.g. TopFeeds, Vital Feed, Chikun"
                value={feedForm.brand}
                onChange={(e) => setFeedForm({ ...feedForm, brand: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Quantity (Bags) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="40"
                value={feedForm.quantityBags}
                onChange={(e) => setFeedForm({ ...feedForm, quantityBags: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Bag Weight (kg) *</label>
              <select
                value={feedForm.bagWeightKg}
                onChange={(e) => setFeedForm({ ...feedForm, bagWeightKg: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              >
                <option value="25">25 kg standard bag</option>
                <option value="50">50 kg large bag</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Cost per Bag (₦) *</label>
              <input
                type="number"
                required
                placeholder="18500"
                value={feedForm.costPerBag}
                onChange={(e) => setFeedForm({ ...feedForm, costPerBag: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setIsAddFeedOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl shadow-xs"
            >
              Add to Feed Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Log Feed Consumption Modal */}
      <Modal
        isOpen={isLogFeedConsumptionOpen}
        onClose={() => setIsLogFeedConsumptionOpen(false)}
        title="Log Flock Feed Consumption"
        subtitle="Trace feed costs to specific flocks without double-counting"
      >
        <form onSubmit={handleFeedConsumptionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#181a19] mb-1">Flock Receiving Feed *</label>
            <select
              value={feedConsForm.flockId}
              onChange={(e) => setFeedConsForm({ ...feedConsForm, flockId: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              {flocks.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.currentBirdCount?.toLocaleString()} birds)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#181a19] mb-1">Select Feed from Stock *</label>
            <select
              value={feedConsForm.feedInventoryItemId}
              onChange={(e) => {
                const item = feedInventory.find((f) => f.id === e.target.value);
                setFeedConsForm({
                  ...feedConsForm,
                  feedInventoryItemId: e.target.value,
                  feedName: item?.feedName || '',
                  feedCategory: item?.category || 'Starter',
                  bagWeightKg: item?.bagWeightKg?.toString() || '25',
                  costPerKg: item?.costPerKg?.toString() || '740',
                });
              }}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              {feedInventory.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.feedName} ({f.quantityBags} bags left · ₦{f.costPerKg}/kg)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Quantity (Bags) *</label>
              <input
                type="number"
                step="0.5"
                required
                min="0.5"
                placeholder="4"
                value={feedConsForm.quantityBags}
                onChange={(e) => setFeedConsForm({ ...feedConsForm, quantityBags: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Feeding Date *</label>
              <input
                type="date"
                required
                value={feedConsForm.date}
                onChange={(e) => setFeedConsForm({ ...feedConsForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setIsLogFeedConsumptionOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl shadow-xs"
            >
              Record Feed Intake
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Health & Vaccination Modal */}
      <Modal
        isOpen={isAddHealthOpen}
        onClose={() => setIsAddHealthOpen(false)}
        title="Flock Vaccination / Health Record"
        subtitle="Log disease observations, vaccines, and automatic calendar reminders"
      >
        <form onSubmit={handleHealthSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#181a19] mb-1">Target Flock *</label>
            <select
              value={healthForm.flockId}
              onChange={(e) => setHealthForm({ ...healthForm, flockId: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              {flocks.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.poultryType} · {f.currentBirdCount?.toLocaleString()} birds)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Event Type *</label>
              <select
                value={healthForm.recordType}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, recordType: e.target.value as FlockHealthRecord['recordType'] })
                }
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="vaccination">Vaccination</option>
                <option value="medication_treatment">Medication / Treatment</option>
                <option value="routine_deworming">Routine Deworming</option>
                <option value="vet_inspection">Veterinary Clinical Visit</option>
                <option value="biosecurity_disinfection">Biosecurity & Footbath Disinfection</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Administration Route</label>
              <select
                value={healthForm.route}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, route: e.target.value as AdministrationRoute })
                }
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="Drinking Water">Drinking Water</option>
                <option value="Eye Drop">Eye Drop</option>
                <option value="Intramuscular Injection">Intramuscular Injection</option>
                <option value="Wing Web Stab">Wing Web Stab (Fowl Pox)</option>
                <option value="Spray / Aerosol">Spray / Aerosol</option>
                <option value="Feed Mix">Feed Mix</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">
                Vaccine / Medicine Commercial Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nobilis Gumboro D78 or Lasota"
                value={healthForm.medicationOrVaccineName}
                onChange={(e) => setHealthForm({ ...healthForm, medicationOrVaccineName: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Target Disease / Purpose *</label>
              <input
                type="text"
                required
                placeholder="e.g. Infectious Bursal Disease 1st Dose"
                value={healthForm.diseaseOrPurpose}
                onChange={(e) => setHealthForm({ ...healthForm, diseaseOrPurpose: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Total Cost (₦)</label>
              <input
                type="number"
                placeholder="20000"
                value={healthForm.cost}
                onChange={(e) => setHealthForm({ ...healthForm, cost: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Administered By</label>
              <input
                type="text"
                value={healthForm.administeredBy}
                onChange={(e) => setHealthForm({ ...healthForm, administeredBy: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={healthForm.nextFollowUpDate}
                onChange={(e) => setHealthForm({ ...healthForm, nextFollowUpDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="scheduleTask"
              checked={healthForm.scheduleAsTask}
              onChange={(e) => setHealthForm({ ...healthForm, scheduleAsTask: e.target.checked })}
              className="rounded-sm text-[#16422b] focus:ring-[#16422b]"
            />
            <label htmlFor="scheduleTask" className="text-xs text-[#181a19]/80 cursor-pointer">
              Automatically create an operational task reminder for the follow-up date
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setIsAddHealthOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl shadow-xs"
            >
              Save Health Record
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Egg Production Modal */}
      <Modal
        isOpen={isLogEggOpen}
        onClose={() => setIsLogEggOpen(false)}
        title="Record Daily Egg Production"
        subtitle="Calculates laying percentage and crate inventory"
      >
        <form onSubmit={handleEggSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#181a19] mb-1">Layer Flock *</label>
            <select
              value={eggForm.flockId}
              onChange={(e) => setEggForm({ ...eggForm, flockId: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              {flocks
                .filter((f) => f.poultryType === 'Layers' || f.purpose.includes('Egg'))
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.currentBirdCount?.toLocaleString()} layers)
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Date Collected *</label>
              <input
                type="date"
                required
                value={eggForm.date}
                onChange={(e) => setEggForm({ ...eggForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">
                Total Eggs Collected (pieces) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="1250"
                value={eggForm.totalEggsCollected}
                onChange={(e) => setEggForm({ ...eggForm, totalEggsCollected: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Saleable Eggs</label>
              <input
                type="number"
                value={eggForm.saleableEggs}
                onChange={(e) => setEggForm({ ...eggForm, saleableEggs: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Cracked / Broken</label>
              <input
                type="number"
                value={eggForm.brokenCrackedEggs}
                onChange={(e) => setEggForm({ ...eggForm, brokenCrackedEggs: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Crate Conversion Unit</label>
              <select
                value={eggForm.crateSize}
                onChange={(e) => setEggForm({ ...eggForm, crateSize: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              >
                <option value="30">30 eggs / standard crate (Paper tray)</option>
                <option value="24">24 eggs / retail carton</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setIsLogEggOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl shadow-xs"
            >
              Log Egg Collection
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. Record Poultry Sale Modal */}
      <Modal
        isOpen={isAddSaleOpen}
        onClose={() => setIsAddSaleOpen(false)}
        title="Record Poultry Sales Transaction"
        subtitle="Reduce live bird or egg inventory while recognizing sales revenue"
      >
        <form onSubmit={handleSaleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Product Category *</label>
              <select
                value={saleForm.productType}
                onChange={(e) => {
                  const val = e.target.value as PoultryProductType;
                  setSaleForm({
                    ...saleForm,
                    productType: val,
                    unit:
                      val === 'live_birds' || val === 'dressed_birds'
                        ? 'birds'
                        : val === 'eggs_crates'
                        ? 'crates_30'
                        : val === 'poultry_manure'
                        ? 'bags_50kg'
                        : 'pieces',
                  });
                }}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="live_birds">Live Commercial Birds</option>
                <option value="eggs_crates">Fresh Farm Eggs (30-egg crates)</option>
                <option value="dressed_birds">Dressed Poultry Meat</option>
                <option value="poultry_manure">Dried Cured Poultry Pen Manure</option>
                <option value="spent_layers">Culled / Spent Layers</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Source Flock</label>
              <select
                value={saleForm.flockId}
                onChange={(e) => setSaleForm({ ...saleForm, flockId: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="">-- No specific flock --</option>
                {flocks.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.currentBirdCount?.toLocaleString()} available)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Buyer / Off-taker Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Premier Hotel & Suites, Bodija Egg Merchant"
                value={saleForm.buyerName}
                onChange={(e) => setSaleForm({ ...saleForm, buyerName: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Buyer Phone</label>
              <input
                type="text"
                placeholder="+234 803 000 0000"
                value={saleForm.buyerPhone}
                onChange={(e) => setSaleForm({ ...saleForm, buyerPhone: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="100"
                value={saleForm.quantity}
                onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Unit Price (₦) *</label>
              <input
                type="number"
                required
                placeholder="4800"
                value={saleForm.unitPrice}
                onChange={(e) => setSaleForm({ ...saleForm, unitPrice: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#181a19] mb-1">Cash Received Now (₦) *</label>
              <input
                type="number"
                placeholder="Full or partial amount"
                value={saleForm.amountPaid}
                onChange={(e) => setSaleForm({ ...saleForm, amountPaid: e.target.value })}
                className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setIsAddSaleOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl shadow-xs"
            >
              Confirm Sale & Deduct Stock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
