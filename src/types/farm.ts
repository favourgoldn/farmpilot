export type MeasurementUnit = 'hectares' | 'acres';
export type QuantityUnit = 'kg' | 'metric_tons' | 'bags_50kg' | 'crates_25kg' | 'tubers';

export type PermissionKey =
  | 'manage_farms_fields'
  | 'manage_crops'
  | 'manage_poultry'
  | 'manage_finances'
  | 'manage_inventory'
  | 'manage_tasks'
  | 'manage_team'
  | 'manage_billing';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'Operations' | 'Agronomy' | 'Poultry' | 'Finance' | 'Administration';
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'manage_farms_fields',
    label: 'Farms & Fields Management',
    description: 'Add, edit, or archive farm estate parcels and field plots',
    category: 'Operations',
  },
  {
    key: 'manage_crops',
    label: 'Agronomy & Crop Cycles',
    description: 'Plan planting seasons, advance phenological stages, and record harvest yields',
    category: 'Agronomy',
  },
  {
    key: 'manage_poultry',
    label: 'Poultry Flocks & Production',
    description: 'Register flocks, log feed intake, record egg production, track mortality, and log poultry sales',
    category: 'Poultry',
  },
  {
    key: 'manage_finances',
    label: 'Expenses, Sales & Profit Intelligence',
    description: 'Log disbursements, issue off-taker invoices, track debt collections, and view net profit audits',
    category: 'Finance',
  },
  {
    key: 'manage_inventory',
    label: 'Agrochemical, Feed & Warehouse',
    description: 'Procure farm inputs, log stock movements, and adjust warehouse inventory levels',
    category: 'Operations',
  },
  {
    key: 'manage_tasks',
    label: 'Operational Tasks & Calendar',
    description: 'Assign duties to farmhands, set spraying/irrigation deadlines, and sign off on tasks',
    category: 'Operations',
  },
  {
    key: 'manage_team',
    label: 'Team Permissions & Access Control',
    description: 'Invite collaborators, assign operational roles, and customize granular permissions',
    category: 'Administration',
  },
  {
    key: 'manage_billing',
    label: 'Subscription, Paystack & Billing',
    description: 'Upgrade commercial plans, initiate Paystack checkout, and access tax receipts',
    category: 'Administration',
  },
];

export type TeamRole =
  | 'Owner / Director'
  | 'Farm Operations Lead'
  | 'Chief Agronomist'
  | 'Poultry Section Manager'
  | 'Field Supervisor'
  | 'Irrigation Technician'
  | 'Accounts Officer'
  | 'General Farm Hand';

export const ROLE_DEFAULT_PERMISSIONS: Record<TeamRole, PermissionKey[]> = {
  'Owner / Director': [
    'manage_farms_fields',
    'manage_crops',
    'manage_poultry',
    'manage_finances',
    'manage_inventory',
    'manage_tasks',
    'manage_team',
    'manage_billing',
  ],
  'Farm Operations Lead': [
    'manage_farms_fields',
    'manage_crops',
    'manage_poultry',
    'manage_inventory',
    'manage_tasks',
    'manage_team',
  ],
  'Chief Agronomist': [
    'manage_farms_fields',
    'manage_crops',
    'manage_inventory',
    'manage_tasks',
  ],
  'Poultry Section Manager': [
    'manage_farms_fields',
    'manage_poultry',
    'manage_inventory',
    'manage_tasks',
  ],
  'Accounts Officer': [
    'manage_finances',
    'manage_inventory',
  ],
  'Field Supervisor': [
    'manage_crops',
    'manage_tasks',
    'manage_inventory',
  ],
  'Irrigation Technician': [
    'manage_tasks',
    'manage_farms_fields',
  ],
  'General Farm Hand': [
    'manage_tasks',
  ],
};

export type PlanTier = 'starter' | 'growth' | 'enterprise';

export interface PlanLimits {
  maxFarms: number;
  maxFields: number;
  maxActiveCrops: number;
  maxTeamMembers: number;
  maxMonthlySales: number;
  canExportReports: boolean;
  customPermissions: boolean;
  prioritySupport: boolean;
}

export interface PlanDetails {
  id: PlanTier;
  name: string;
  tagline: string;
  monthlyPriceNgn: number;
  annualPriceNgn: number;
  popular?: boolean;
  limits: PlanLimits;
  highlightFeatures: string[];
}

export const SUBSCRIPTION_PLANS: Record<PlanTier, PlanDetails> = {
  starter: {
    id: 'starter',
    name: 'Starter Pilot',
    tagline: 'Ideal for smallholder farmers and pilot plot testing',
    monthlyPriceNgn: 0,
    annualPriceNgn: 0,
    limits: {
      maxFarms: 1,
      maxFields: 2,
      maxActiveCrops: 2,
      maxTeamMembers: 2,
      maxMonthlySales: 5,
      canExportReports: false,
      customPermissions: false,
      prioritySupport: false,
    },
    highlightFeatures: [
      '1 Farm Estate parcel',
      'Up to 2 Field blocks',
      'Up to 2 Active crop production cycles',
      'Up to 2 Team member accounts',
      'Basic input & expense recording',
      'Harvest log & yield metrics',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Commercial Grower',
    tagline: 'For mid-size commercial crop producers and multi-field farming',
    monthlyPriceNgn: 15000,
    annualPriceNgn: 150000,
    popular: true,
    limits: {
      maxFarms: 5,
      maxFields: 20,
      maxActiveCrops: 15,
      maxTeamMembers: 8,
      maxMonthlySales: 100,
      canExportReports: true,
      customPermissions: true,
      prioritySupport: false,
    },
    highlightFeatures: [
      'Up to 5 Farm Estates',
      'Up to 20 Field blocks',
      'Up to 15 Active crop production cycles',
      'Up to 8 Team members with custom RBAC permissions',
      'Real-time Net Profit & Crop Margin Analytics',
      'Warehouse inventory & reorder threshold alerts',
      'Customer debts, off-taker invoices & receipts',
      'Data export to Excel / CSV',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Agro-Allied Enterprise',
    tagline: 'Complete intelligence platform for large-scale estates and aggregators',
    monthlyPriceNgn: 45000,
    annualPriceNgn: 450000,
    limits: {
      maxFarms: Infinity,
      maxFields: Infinity,
      maxActiveCrops: Infinity,
      maxTeamMembers: Infinity,
      maxMonthlySales: Infinity,
      canExportReports: true,
      customPermissions: true,
      prioritySupport: true,
    },
    highlightFeatures: [
      'Unlimited Farm Estates & Field Blocks',
      'Unlimited Active Crop Production Cycles',
      'Unlimited Team Members & Granular Permission Matrix',
      'Multi-Estate Consolidated Financial Audit Rollups',
      'Full Waybill, Purchase & Produce Adjustment Tracking',
      'Dedicated Agronomy & Priority WhatsApp Technical Support',
      'Enterprise SLA & Custom Data Exports',
    ],
  },
};

export interface SubscriptionInfo {
  planId: PlanTier;
  billingCycle: 'monthly' | 'annual';
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  lastPaymentReference?: string;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
  paystackCustomerCode?: string;
  paystackPlanCode?: string;
  autoRenew: boolean;
}

export interface BillingTransaction {
  id: string;
  organizationId?: string;
  reference: string;
  amountNgn: number;
  planId: PlanTier;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  channel: 'card' | 'bank_transfer' | 'ussd' | 'mobile_money' | 'paystack_inline';
  status: 'success' | 'failed' | 'pending';
  paidAt: string;
  customerEmail: string;
  customerName: string;
  farmName: string;
  description: string;
  receiptNumber: string;
  cardLast4?: string;
  bankName?: string;
}

export interface UserProfile {
  id: string; // Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  organizationId: string;
  role: 'owner' | 'manager' | 'agronomist' | 'member';
  createdAt: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  state: string;
  createdAt: string;
  updatedAt?: string;
  subscription?: SubscriptionInfo;
}

export type FarmType = 'crop' | 'poultry' | 'mixed';

export interface Farm {
  id: string;
  organizationId?: string;
  name: string;
  farmType?: FarmType; // defaults to 'crop' if not set
  state: string;
  lga: string;
  locationDetails: string;
  totalArea: number;
  unit: MeasurementUnit;
  soilProfile: string;
  ownership: 'Owned' | 'Leased' | 'Outgrower Scheme';
  createdAt: string;
}

export interface Field {
  id: string;
  organizationId?: string;
  farmId: string;
  name: string;
  code: string;
  size: number;
  unit: MeasurementUnit;
  irrigation: 'Rain-fed' | 'Drip Irrigation' | 'Borehole Sprinkler' | 'Canal Furrow';
  currentCropId?: string;
  status: 'active' | 'fallow' | 'preparing' | 'harvested';
  notes?: string;
}

export type CropStage =
  | 'land_preparation'
  | 'planting'
  | 'vegetative'
  | 'flowering_fruiting'
  | 'maturing'
  | 'harvesting'
  | 'completed';

export type CropCategory =
  | 'Cereal / Grain'
  | 'Root & Tuber'
  | 'Horticulture / Veg'
  | 'Legume'
  | 'Cash Crop';

export interface Crop {
  id: string;
  organizationId?: string;
  farmId: string;
  fieldId: string;
  name: string;
  variety: string;
  category: CropCategory;
  plantingDate: string;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  targetYieldKg: number;
  stage: CropStage;
  seedSupplier: string;
  spacingNotes?: string;
  activeStatus: boolean;
}

export type ExpenseCategory =
  | 'seeds_seedlings'
  | 'fertilizer_chemicals'
  | 'mechanization_fuel'
  | 'labor'
  | 'logistics_packaging'
  | 'lease_utilities'
  | 'day_old_chicks'
  | 'poultry_feed'
  | 'veterinary_vaccines'
  | 'poultry_medication'
  | 'poultry_bedding_litter'
  | 'heating_brooding_fuel'
  | 'biosecurity_cleaning'
  | 'poultry_equipment'
  | 'poultry_labor'
  | 'poultry_packaging'
  | 'other';

export interface Expense {
  id: string;
  organizationId?: string;
  farmId: string;
  fieldId?: string;
  cropId?: string;
  flockId?: string; // Direct link to poultry flock for flock-level profitability
  supplierId?: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number; // in Naira ₦
  vendor: string;
  receiptNumber?: string;
  receiptUrl?: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Mobile Money' | 'Supplier Credit';
  paymentStatus: 'paid' | 'pending';
  notes?: string;
}

// ==================== POULTRY FARMING SYSTEM TYPES ====================

export type PoultryType =
  | 'Broilers'
  | 'Layers'
  | 'Cockerels'
  | 'Noilers'
  | 'Turkeys'
  | 'Ducks'
  | 'Other';

export type BirdPurpose =
  | 'Meat (Broiler)'
  | 'Egg Production (Layer)'
  | 'Dual Purpose'
  | 'Breeding'
  | 'Rearing / Point of Lay';

export type FlockStatus = 'active' | 'quarantined' | 'completed' | 'culled';

export interface Flock {
  id: string;
  organizationId?: string;
  farmId: string;
  houseId?: string;
  name: string; // e.g. "Broiler Batch 24-B" or "Isa Brown Layers 2024"
  poultryType: PoultryType;
  breed: string; // e.g. "Cobb 500", "Ross 308", "Isa Brown", "Lohmann Brown"
  purpose: BirdPurpose;
  initialBirdCount: number;
  currentBirdCount: number; // calculated from recorded additions, deaths, culls, sales, transfers
  acquisitionDate: string;
  supplier: string; // e.g. "CHI Farms Hatchery", "Zartech Hatchery"
  unitPurchasePrice: number; // in Naira ₦ per chick/bird
  totalAcquisitionCost: number; // initialBirdCount * unitPurchasePrice
  status: FlockStatus;
  currentAgeWeeks?: number;
  targetWeightKg?: number;
  notes?: string;
  createdAt: string;
}

export type FlockMovementType =
  | 'addition'
  | 'mortality'
  | 'cull'
  | 'sale'
  | 'transfer';

export interface FlockMovement {
  id: string;
  organizationId?: string;
  farmId: string;
  flockId: string;
  date: string;
  type: FlockMovementType;
  quantity: number;
  reason?: string;
  causeOfDeath?: string;
  referenceId?: string; // e.g. saleId or transfer destination
  performedBy: string;
  notes?: string;
  createdAt: string;
}

export type HousingSystemType =
  | 'Deep Litter System'
  | 'Battery Cage System'
  | 'Free Range / Pastured'
  | 'Semi-Intensive System'
  | 'Brooder Pen';

export interface PoultryHouse {
  id: string;
  organizationId?: string;
  farmId: string;
  name: string; // e.g. "Pen House 1 (Brooding)"
  capacity: number; // Maximum bird capacity
  housingType: HousingSystemType;
  locationDetails: string;
  status: 'active' | 'cleaning_disinfection' | 'maintenance' | 'empty';
  notes?: string;
  createdAt: string;
}

export type FeedCategory =
  | 'Starter'
  | 'Grower'
  | 'Finisher'
  | 'Layer Mash'
  | 'Pre-Layer'
  | 'Broiler Super Starter'
  | 'Concentrate'
  | 'Custom Farm Formulation';

export interface FeedInventoryItem {
  id: string;
  organizationId?: string;
  farmId: string;
  feedName: string;
  brand: string; // e.g. "TopFeeds", "Vital Feed", "Chikun Feed", "Animal Care"
  category: FeedCategory;
  quantityBags: number;
  bagWeightKg: number; // standard 25kg or 50kg bag
  totalWeightKg: number; // quantityBags * bagWeightKg
  costPerBag: number; // in Naira ₦
  costPerKg: number; // costPerBag / bagWeightKg
  reorderLevelBags: number;
  supplier: string;
  supplierId?: string;
  dateReceived: string;
  location?: string;
  notes?: string;
}

export interface FeedConsumptionRecord {
  id: string;
  organizationId?: string;
  farmId: string;
  flockId: string;
  feedInventoryItemId?: string;
  feedName: string;
  feedCategory: FeedCategory;
  date: string;
  quantityBags: number;
  bagWeightKg: number;
  quantityKg: number; // quantityBags * bagWeightKg
  costPerKg: number; // Unit cost from inventory purchase
  calculatedCost: number; // quantityKg * costPerKg (traceable without double-counting)
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export type HealthRecordType =
  | 'vaccination'
  | 'medication_treatment'
  | 'routine_deworming'
  | 'vet_inspection'
  | 'biosecurity_disinfection';

export type AdministrationRoute =
  | 'Drinking Water'
  | 'Eye Drop'
  | 'Intramuscular Injection'
  | 'Wing Web Stab'
  | 'Spray / Aerosol'
  | 'Feed Mix';

export interface FlockHealthRecord {
  id: string;
  organizationId?: string;
  farmId: string;
  flockId: string;
  date: string;
  recordType: HealthRecordType;
  diseaseOrPurpose: string; // e.g. "Gumboro (IBD) Vaccine 1st Dose", "Lasota (Newcastle)", "Coccidiosis Treatment"
  medicationOrVaccineName: string;
  route: AdministrationRoute;
  cost: number; // in Naira ₦
  administeredBy: string;
  mortalityRecordedOnDate?: number;
  nextFollowUpDate?: string;
  notes?: string;
  createdAt: string;
}

export interface EggProductionRecord {
  id: string;
  organizationId?: string;
  farmId: string;
  flockId: string;
  date: string;
  totalEggsCollected: number; // in pieces
  saleableEggs: number; // in pieces
  brokenCrackedEggs: number; // in pieces
  internalConsumption: number; // in pieces
  cratesCount: number; // crates (standard 30 eggs/crate)
  crateSize: number; // default 30
  layingRatePercent: number; // (totalEggsCollected / flockBirdCountAtDate) * 100
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export type PoultryProductType =
  | 'live_birds'
  | 'dressed_birds'
  | 'eggs_crates'
  | 'eggs_pieces'
  | 'poultry_manure'
  | 'spent_layers'
  | 'day_old_chicks'
  | 'other_byproducts';

export interface PoultrySaleRecord {
  id: string;
  organizationId?: string;
  farmId: string;
  flockId?: string;
  invoiceNumber: string;
  productType: PoultryProductType;
  productDescription: string;
  buyerName: string;
  buyerPhone: string;
  date: string;
  quantity: number;
  unit: 'birds' | 'crates_30' | 'pieces' | 'bags_50kg' | 'kg';
  unitPrice: number; // in Naira ₦ per unit
  totalAmount: number; // Gross amount
  discount: number; // in Naira ₦
  netAmount: number; // Recognized sales revenue (totalAmount - discount)
  amountPaid: number; // Cash received
  outstandingAmount: number; // netAmount - amountPaid
  paymentStatus: 'paid' | 'partial' | 'outstanding';
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Mobile Money' | 'POS';
  notes?: string;
  createdAt: string;
}

export interface FlockProfitabilitySummary {
  flockId: string;
  flockName: string;
  poultryType: PoultryType;
  breed: string;
  houseName?: string;
  initialBirds: number;
  currentBirds: number;
  totalMortality: number;
  mortalityRatePercent: number; // (totalMortality / initialBirds) * 100
  totalSalesRevenue: number;
  chickAcquisitionCost: number;
  feedConsumedCost: number;
  feedConsumedKg: number;
  vetMedicationCost: number;
  otherOperatingExpenses: number;
  totalOperatingCosts: number;
  grossMarginNgn: number; // totalSalesRevenue - (feedConsumedCost + chickAcquisitionCost)
  netOperatingResultNgn: number; // totalSalesRevenue - totalOperatingCosts
  netMarginPercent: number; // (netOperatingResultNgn / totalSalesRevenue) * 100
  feedCostPerBird: number;
  revenuePerBirdSold: number;
  totalEggsCollected?: number;
  layingRateAveragePercent?: number;
  costPerEggNgn?: number;
}

export type BuyerCategory =
  | 'Off-taker Processor'
  | 'Wholesale Aggregator'
  | 'Open Market Trader'
  | 'Retail Buyer'
  | 'Export Merchant';

export interface Customer {
  id: string;
  organizationId?: string;
  name: string;
  buyerType: BuyerCategory;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  state: string;
  marketHub?: string;
  paymentTerms:
    | 'Cash on Delivery'
    | '7 Days Net'
    | '14 Days Net'
    | '30 Days Net'
    | '50% Advance & Balance on Delivery';
  creditLimit: number; // in Naira ₦
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
}

export interface HarvestRecord {
  id: string;
  organizationId?: string;
  cropId: string;
  fieldId: string;
  date: string;
  quantity: number;
  unit: QuantityUnit;
  normalizedKg: number;
  gradeQuality: 'Grade A Premium' | 'Grade B Standard' | 'Industrial Processing';
  storageLocation: string;
  batchNumber?: string;
  moisturePercent?: number; // e.g. 12.5%
  estimatedMarketPricePerUnit?: number;
  remainingQuantity?: number;
  notes?: string;
}

export interface SaleRecord {
  id: string;
  organizationId?: string;
  cropId: string;
  harvestId?: string;
  customerId?: string;
  invoiceNumber: string;
  buyerName: string;
  buyerPhone: string;
  buyerType: BuyerCategory;
  date: string;
  dueDate?: string;
  quantitySold: number;
  unit: QuantityUnit;
  normalizedKg: number;
  unitPrice: number; // Naira per unit
  totalAmount: number; // recognized revenue
  amountPaid: number; // cash collected
  outstandingAmount: number; // receivables
  paymentStatus: 'paid' | 'outstanding' | 'partial';
  paymentMethod?: 'Bank Transfer' | 'Cash' | 'Mobile Money' | 'Cheque' | 'Credit Terms';
  deliveryAddress?: string;
  waybillNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  bankDetails?: string;
  notes?: string;
}

export interface SalePayment {
  id: string;
  organizationId?: string;
  saleId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  date: string;
  amount: number; // in Naira ₦
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Mobile Money' | 'Cheque' | 'POS';
  referenceNumber?: string;
  bankName?: string;
  accountCredited?: string;
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export type ProduceAdjustmentReason =
  | 'moisture_loss_shrinkage'
  | 'sorting_reject'
  | 'seed_retention'
  | 'internal_consumption'
  | 'spoilage_damage'
  | 'physical_audit_reconciliation';

export interface ProduceAdjustment {
  id: string;
  organizationId?: string;
  cropId: string;
  harvestId?: string;
  date: string;
  quantity: number;
  unit: QuantityUnit;
  normalizedKg: number;
  reason: ProduceAdjustmentReason;
  notes?: string;
  performedBy: string;
  createdAt: string;
}

export interface ProduceStockSummary {
  cropId: string;
  cropName: string;
  category: CropCategory;
  variety: string;
  totalHarvestedQuantity: number;
  totalHarvestedKg: number;
  totalSoldQuantity: number;
  totalSoldKg: number;
  totalAdjustedQuantity: number;
  totalAdjustedKg: number;
  availableQuantity: number;
  availableKg: number;
  unit: QuantityUnit;
  storageLocations: string[];
  gradeQualities: string[];
  averageSalePricePerUnit: number;
  estimatedValuation: number;
  stockStatus: 'in_stock' | 'low_stock' | 'depleted';
}

export interface InventoryItem {
  id: string;
  organizationId?: string;
  farmId: string;
  name: string;
  category: 'Fertilizer' | 'Agrochemical' | 'Seed' | 'Fuel / Diesel' | 'Equipment Spares';
  currentStock: number;
  unit: string;
  reorderLevel: number;
  costPerUnit: number;
  lastRestocked: string;
  supplier: string;
  supplierId?: string;
  location?: string;
  notes?: string;
}

export type SupplierCategory =
  | 'Fertilizer & Chemicals'
  | 'Seeds & Seedlings'
  | 'Machinery & Tractor Hire'
  | 'Labor & Farm Hands'
  | 'Fuel & Utilities'
  | 'Packaging & Logistics'
  | 'Irrigation & Hardware'
  | 'General Farm Inputs';

export interface Supplier {
  id: string;
  organizationId?: string;
  name: string;
  category: SupplierCategory;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  state: string;
  paymentTerms: 'Cash on Delivery' | 'Net 15 Days' | 'Net 30 Days' | 'Advance Payment' | 'Supplier Credit';
  rating?: number;
  status: 'active' | 'inactive';
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  inventoryItemId?: string;
}

export interface PurchaseRecord {
  id: string;
  organizationId?: string;
  farmId: string;
  purchaseOrderNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  deliveryDate?: string;
  items: PurchaseItem[];
  subtotal: number;
  taxOrDeliveryFee: number;
  totalAmount: number;
  amountPaid: number;
  outstandingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Mobile Money' | 'Supplier Credit';
  deliveryStatus: 'received' | 'pending' | 'partially_received';
  receiptNumber?: string;
  notes?: string;
  autoRestocked?: boolean;
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';

export interface StockMovement {
  id: string;
  organizationId?: string;
  farmId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  type: StockMovementType;
  quantity: number;
  unit: string;
  previousStock: number;
  newStock: number;
  date: string;
  cropId?: string;
  fieldId?: string;
  performedBy: string;
  reason: string;
  referenceType?: 'purchase' | 'field_application' | 'spoilage_damage' | 'audit_reconciliation' | 'transfer';
  referenceId?: string;
  notes?: string;
}

export interface ReceiptRecord {
  id: string;
  organizationId?: string;
  farmId: string;
  receiptNumber: string;
  title: string;
  vendor: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Mobile Money' | 'Supplier Credit';
  linkedExpenseId?: string;
  linkedPurchaseId?: string;
  auditStatus: 'verified' | 'pending_audit' | 'flagged';
  fileUrl?: string;
  verifiedBy?: string;
  notes?: string;
}

export type TaskCategory =
  | 'Agronomic'
  | 'Spraying / Chemical'
  | 'Irrigation'
  | 'Machinery'
  | 'Harvest'
  | 'Financial & Billing'
  | 'General';

export interface FarmTask {
  id: string;
  organizationId?: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  fieldId?: string;
  cropId?: string;
  category?: TaskCategory;
  reminderDate?: string;
  reminderTime?: string;
  isReminderActive?: boolean;
  notes?: string;
}

export interface TeamMember {
  id: string;
  organizationId?: string;
  name: string;
  role: TeamRole;
  phone: string;
  email: string;
  state: string;
  assignedFarms: string[];
  activeStatus: boolean;
  avatarUrl?: string;
  permissions?: PermissionKey[];
  isOwner?: boolean;
  invitedAt?: string;
  lastActiveAt?: string;
}

export interface CropSeason {
  id: string;
  organizationId?: string;
  farmId: string;
  name: string;
  seasonType: 'Early Rains (Main)' | 'Late Rains (Minor)' | 'Dry Season (Irrigation)' | 'All-Year Perennial';
  startDate: string;
  endDate: string;
  targetAcreage: number;
  unit: MeasurementUnit;
  budget: number;
  status: 'planning' | 'active' | 'completed';
  linkedCropIds?: string[];
  notes?: string;
}

export interface FarmSettings {
  farmName: string;
  managerName: string;
  email: string;
  phone: string;
  primaryState: string;
  defaultUnit: MeasurementUnit;
  currency: 'NGN';
  fiscalYearStart: string;
  demoMode: boolean;
  paystackPublicKey?: string;
}
