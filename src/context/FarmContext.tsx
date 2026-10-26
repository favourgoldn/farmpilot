import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  defaultSettings,
  demoCrops,
  demoCustomers,
  demoExpenses,
  demoFarm,
  demoFarms,
  demoFields,
  demoHarvests,
  demoInventory,
  demoProduceAdjustments,
  demoPurchases,
  demoReceipts,
  demoSalePayments,
  demoSales,
  demoSeasons,
  demoStockMovements,
  demoSuppliers,
  demoTasks,
  demoTeam,
  demoBillingTransactions,
  demoFlocks,
  demoFlockMovements,
  demoPoultryHouses,
  demoFeedInventory,
  demoFeedConsumption,
  demoFlockHealthRecords,
  demoEggProductionRecords,
  demoPoultrySales,
} from '../data/mockData';
import { auth, testFirestoreConnection } from '../lib/firebase';
import {
  logoutUser,
  requestPasswordReset,
  resendEmailVerificationEmail,
  signInUser,
  signInWithGooglePopup,
  signUpUser,
} from '../services/authService';
import {
  addCropToFirestore,
  addCustomerToFirestore,
  addExpenseToFirestore,
  addFieldToFirestore,
  addFarmToFirestore,
  addHarvestToFirestore,
  addInventoryToFirestore,
  addProduceAdjustmentToFirestore,
  addPurchaseToFirestore,
  addReceiptToFirestore,
  addSalePaymentToFirestore,
  addSaleToFirestore,
  addSeasonToFirestore,
  addStockMovementToFirestore,
  addSupplierToFirestore,
  addTaskToFirestore,
  addTeamMemberToFirestore,
  deleteCropFromFirestore,
  deleteCustomerFromFirestore,
  deleteExpenseFromFirestore,
  deleteFieldFromFirestore,
  deleteFarmFromFirestore,
  deleteHarvestFromFirestore,
  deleteInventoryFromFirestore,
  deleteProduceAdjustmentFromFirestore,
  deletePurchaseFromFirestore,
  deleteReceiptFromFirestore,
  deleteSaleFromFirestore,
  deleteSalePaymentFromFirestore,
  deleteSeasonFromFirestore,
  deleteStockMovementFromFirestore,
  deleteSupplierFromFirestore,
  deleteTaskFromFirestore,
  deleteTeamMemberFromFirestore,
  fetchOrganization,
  fetchUserProfile,
  recordSalePaymentInFirestore,
  saveBillingTransaction,
  subscribeToBillingTransactions,
  subscribeToCrops,
  subscribeToCustomers,
  subscribeToExpenses,
  subscribeToFields,
  subscribeToFarms,
  subscribeToHarvests,
  subscribeToInventory,
  subscribeToProduceAdjustments,
  subscribeToPurchases,
  subscribeToReceipts,
  subscribeToSalePayments,
  subscribeToSales,
  subscribeToSeasons,
  subscribeToStockMovements,
  subscribeToSuppliers,
  subscribeToTasks,
  subscribeToTeam,
  updateCropInFirestore,
  updateCropStageInFirestore,
  updateCustomerInFirestore,
  updateExpenseInFirestore,
  updateFarmInFirestore,
  updateFieldInFirestore,
  updateInventoryInFirestore,
  updateOrganizationSubscription,
  updatePurchaseInFirestore,
  updateReceiptInFirestore,
  updateSeasonInFirestore,
  updateSupplierInFirestore,
  updateTaskInFirestore,
  updateTaskStatusInFirestore,
  updateTeamMemberInFirestore,
  subscribeToFlocks,
  addFlockToFirestore,
  updateFlockInFirestore,
  deleteFlockFromFirestore,
  subscribeToFlockMovements,
  addFlockMovementToFirestore,
  subscribeToPoultryHouses,
  addPoultryHouseToFirestore,
  updatePoultryHouseInFirestore,
  deletePoultryHouseFromFirestore,
  subscribeToFeedInventory,
  addFeedInventoryToFirestore,
  updateFeedInventoryInFirestore,
  deleteFeedInventoryFromFirestore,
  subscribeToFeedConsumption,
  addFeedConsumptionToFirestore,
  subscribeToFlockHealth,
  addFlockHealthToFirestore,
  subscribeToEggProduction,
  addEggProductionToFirestore,
  subscribeToPoultrySales,
  addPoultrySaleToFirestore,
  deletePoultrySaleFromFirestore,
} from '../services/firestoreService';
import {
  BillingTransaction,
  Crop,
  CropSeason,
  Customer,
  EggProductionRecord,
  Expense,
  Farm,
  FarmSettings,
  FarmTask,
  FeedConsumptionRecord,
  FeedInventoryItem,
  Field,
  Flock,
  FlockHealthRecord,
  FlockMovement,
  FlockProfitabilitySummary,
  HarvestRecord,
  InventoryItem,
  Organization,
  PERMISSION_DEFINITIONS,
  PermissionKey,
  PlanDetails,
  PlanLimits,
  PlanTier,
  PoultryHouse,
  PoultrySaleRecord,
  ProduceAdjustment,
  ProduceStockSummary,
  PurchaseRecord,
  ReceiptRecord,
  ROLE_DEFAULT_PERMISSIONS,
  SUBSCRIPTION_PLANS,
  SubscriptionInfo,
  SalePayment,
  SaleRecord,
  StockMovement,
  Supplier,
  TeamMember,
  TeamRole,
  UserProfile,
} from '../types/farm';
import {
  calculatePeriodDates,
  generatePaystackReference,
  generateReceiptNumber,
} from '../services/paystackService';
import {
  calculateCropProfitability,
  calculateFieldProfitability,
  calculateFinancialSummary,
  calculateFlockProfitability,
  CropProfitMetric,
  FieldProfitMetric,
  FinancialSummary,
  normalizeToKg,
} from '../utils/finance';

export type AppView = 'landing' | 'signup' | 'signin' | 'onboarding' | 'app';
export type AppSection =
  | 'dashboard'
  | 'farms'
  | 'crops'
  | 'poultry'
  | 'expenses'
  | 'harvests'
  | 'reports'
  | 'tasks'
  | 'team'
  | 'settings';

export type ModalType =
  | null
  | 'add_expense'
  | 'edit_expense'
  | 'add_crop'
  | 'record_harvest'
  | 'record_sale'
  | 'create_task'
  | 'add_field'
  | 'add_farm'
  | 'add_inventory'
  | 'add_team'
  | 'add_season'
  | 'add_supplier'
  | 'add_purchase'
  | 'add_stock_movement'
  | 'add_receipt'
  | 'view_receipt'
  | 'add_customer'
  | 'edit_customer'
  | 'view_customer'
  | 'view_invoice'
  | 'record_payment'
  | 'adjust_produce_stock'
  | 'upgrade_plan'
  | 'paystack_checkout'
  | 'view_subscription_receipt'
  | 'edit_team_permissions'
  | 'role_matrix'
  | 'add_flock'
  | 'record_flock_movement'
  | 'add_poultry_house'
  | 'add_feed_inventory'
  | 'record_feed_consumption'
  | 'record_flock_health'
  | 'record_egg_production'
  | 'record_poultry_sale';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface FarmContextType {
  // Navigation & views
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;

  // Selected item modal helpers
  activeReceipt: ReceiptRecord | null;
  setActiveReceipt: (receipt: ReceiptRecord | null) => void;
  activeExpenseToEdit: Expense | null;
  setActiveExpenseToEdit: (expense: Expense | null) => void;
  activeInvoiceToView: SaleRecord | null;
  setActiveInvoiceToView: (sale: SaleRecord | null) => void;
  activeCustomerToView: Customer | null;
  setActiveCustomerToView: (customer: Customer | null) => void;
  activeCustomerToEdit: Customer | null;
  setActiveCustomerToEdit: (customer: Customer | null) => void;
  activeSaleForPayment: SaleRecord | null;
  setActiveSaleForPayment: (sale: SaleRecord | null) => void;

  // Commercial Subscription & Paystack
  currentPlan: PlanTier;
  planLimits: PlanLimits;
  billingTransactions: BillingTransaction[];
  activeSubscriptionReceipt: BillingTransaction | null;
  selectedPlanForCheckout: { planId: PlanTier; cycle: 'monthly' | 'annual' };
  upgradeModalLimitFeature: 'farms' | 'fields' | 'crops' | 'team' | null;
  openUpgradeModal: (feature?: 'farms' | 'fields' | 'crops' | 'team') => void;
  openPaystackCheckout: (planId: PlanTier, cycle: 'monthly' | 'annual') => void;
  openSubscriptionReceipt: (tx: BillingTransaction) => void;
  upgradeSubscription: (
    targetPlan: PlanTier,
    cycle: 'monthly' | 'annual',
    reference: string,
    amount: number,
    channel: BillingTransaction['channel']
  ) => Promise<BillingTransaction>;
  checkPlanLimit: (feature: 'farms' | 'fields' | 'crops' | 'team') => {
    allowed: boolean;
    current: number;
    max: number;
    label: string;
  };

  // Team RBAC & Permissions
  activeSimulatedRole: TeamRole;
  setActiveSimulatedRole: (role: TeamRole) => void;
  hasPermission: (permission: PermissionKey) => boolean;
  activeMemberForEdit: TeamMember | null;
  openEditTeamMember: (member: TeamMember) => void;
  updateTeamMemberPermissions: (memberId: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (memberId: string) => Promise<void>;
  isRoleMatrixOpen: boolean;
  setIsRoleMatrixOpen: (open: boolean) => void;

  // Auth state
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  organization: Organization | null;
  isAuthLoading: boolean;
  isDataLoading: boolean;
  dbError: string | null;

  // Mode
  isDemoMode: boolean;
  setIsDemoMode: (enabled: boolean) => void;

  // Farm Selection
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  selectedFarm: Farm | null;

  // Farm Data
  farms: Farm[];
  fields: Field[];
  crops: Crop[];
  seasons: CropSeason[];
  expenses: Expense[];
  harvests: HarvestRecord[];
  sales: SaleRecord[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  purchases: PurchaseRecord[];
  stockMovements: StockMovement[];
  receipts: ReceiptRecord[];
  customers: Customer[];
  salePayments: SalePayment[];
  produceAdjustments: ProduceAdjustment[];
  produceStockSummaries: ProduceStockSummary[];
  tasks: FarmTask[];
  team: TeamMember[];
  settings: FarmSettings;

  // Poultry Farming Data
  flocks: Flock[];
  flockMovements: FlockMovement[];
  poultryHouses: PoultryHouse[];
  feedInventory: FeedInventoryItem[];
  feedConsumption: FeedConsumptionRecord[];
  flockHealthRecords: FlockHealthRecord[];
  eggProductionRecords: EggProductionRecord[];
  poultrySales: PoultrySaleRecord[];
  flockProfitability: FlockProfitabilitySummary[];

  // Calculated Metrics
  financialSummary: FinancialSummary;
  cropProfitability: CropProfitMetric[];
  fieldProfitability: FieldProfitMetric[];

  // Data mutators
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCrop: (crop: Omit<Crop, 'id'>) => Promise<void>;
  updateCrop: (id: string, updates: Partial<Crop>) => Promise<void>;
  updateCropStage: (id: string, stage: Crop['stage']) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
  addHarvest: (harvest: Omit<HarvestRecord, 'id' | 'normalizedKg'>) => Promise<void>;
  deleteHarvest: (id: string) => Promise<void>;
  addSale: (sale: Omit<SaleRecord, 'id' | 'normalizedKg' | 'outstandingAmount'>) => Promise<void>;
  recordSalePayment: (id: string, amountReceived: number, paymentDetails?: Partial<SalePayment>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addField: (field: Omit<Field, 'id'>) => Promise<void>;
  updateField: (id: string, updates: Partial<Field>) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  addFarm: (farm: Omit<Farm, 'id' | 'createdAt'>) => Promise<void>;
  updateFarm: (id: string, updates: Partial<Farm>) => Promise<void>;
  deleteFarm: (id: string) => Promise<void>;
  addSeason: (season: Omit<CropSeason, 'id'>) => Promise<void>;
  updateSeason: (id: string, updates: Partial<CropSeason>) => Promise<void>;
  deleteSeason: (id: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addPurchase: (purchase: Omit<PurchaseRecord, 'id'>) => Promise<void>;
  updatePurchase: (id: string, updates: Partial<PurchaseRecord>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  addStockMovement: (movement: Omit<StockMovement, 'id'>) => Promise<void>;
  deleteStockMovement: (id: string) => Promise<void>;
  addReceipt: (receipt: Omit<ReceiptRecord, 'id'>) => Promise<void>;
  updateReceipt: (id: string, updates: Partial<ReceiptRecord>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addSalePayment: (payment: Omit<SalePayment, 'id' | 'createdAt'>) => Promise<void>;
  deleteSalePayment: (id: string) => Promise<void>;
  addProduceAdjustment: (adjustment: Omit<ProduceAdjustment, 'id' | 'normalizedKg' | 'createdAt'>) => Promise<void>;
  deleteProduceAdjustment: (id: string) => Promise<void>;
  addTask: (task: Omit<FarmTask, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<FarmTask>) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  updateSettings: (newSettings: Partial<FarmSettings>) => void;

  // Poultry Mutators
  addFlock: (flock: Omit<Flock, 'id' | 'createdAt'>) => Promise<void>;
  updateFlock: (id: string, updates: Partial<Flock>) => Promise<void>;
  deleteFlock: (id: string) => Promise<void>;
  addFlockMovement: (movement: Omit<FlockMovement, 'id' | 'createdAt'>) => Promise<void>;
  addPoultryHouse: (house: Omit<PoultryHouse, 'id' | 'createdAt'>) => Promise<void>;
  updatePoultryHouse: (id: string, updates: Partial<PoultryHouse>) => Promise<void>;
  deletePoultryHouse: (id: string) => Promise<void>;
  addFeedInventory: (item: Omit<FeedInventoryItem, 'id'>) => Promise<void>;
  updateFeedInventory: (id: string, updates: Partial<FeedInventoryItem>) => Promise<void>;
  deleteFeedInventory: (id: string) => Promise<void>;
  addFeedConsumption: (record: Omit<FeedConsumptionRecord, 'id' | 'createdAt' | 'calculatedCost'>) => Promise<void>;
  addFlockHealth: (record: Omit<FlockHealthRecord, 'id' | 'createdAt'>) => Promise<void>;
  addEggProduction: (record: Omit<EggProductionRecord, 'id' | 'createdAt' | 'layingRatePercent'>) => Promise<void>;
  addPoultrySale: (sale: Omit<PoultrySaleRecord, 'id' | 'createdAt'>) => Promise<void>;
  deletePoultrySale: (id: string) => Promise<void>;

  // Auth actions
  signUp: (email: string, pass: string, name: string, farmName: string, state: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;

  // Data modes
  resetDemoData: () => void;
  clearToEmptyData: () => void;

  // Notifications
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [activeSection, setActiveSection] = useState<AppSection>('dashboard');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Demo Mode
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Selected Farm State
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-001');

  // Live Entity States
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [seasons, setSeasons] = useState<CropSeason[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salePayments, setSalePayments] = useState<SalePayment[]>([]);
  const [produceAdjustments, setProduceAdjustments] = useState<ProduceAdjustment[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptRecord | null>(null);
  const [activeExpenseToEdit, setActiveExpenseToEdit] = useState<Expense | null>(null);
  const [activeInvoiceToView, setActiveInvoiceToView] = useState<SaleRecord | null>(null);
  const [activeCustomerToView, setActiveCustomerToView] = useState<Customer | null>(null);
  const [activeCustomerToEdit, setActiveCustomerToEdit] = useState<Customer | null>(null);
  const [activeSaleForPayment, setActiveSaleForPayment] = useState<SaleRecord | null>(null);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<FarmSettings>(defaultSettings);

  // Live Poultry States
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [flockMovements, setFlockMovements] = useState<FlockMovement[]>([]);
  const [poultryHouses, setPoultryHouses] = useState<PoultryHouse[]>([]);
  const [feedInventory, setFeedInventory] = useState<FeedInventoryItem[]>([]);
  const [feedConsumption, setFeedConsumption] = useState<FeedConsumptionRecord[]>([]);
  const [flockHealthRecords, setFlockHealthRecords] = useState<FlockHealthRecord[]>([]);
  const [eggProductionRecords, setEggProductionRecords] = useState<EggProductionRecord[]>([]);
  const [poultrySales, setPoultrySales] = useState<PoultrySaleRecord[]>([]);

  // Commercial Subscription & Paystack States
  const [billingTransactions, setBillingTransactions] = useState<BillingTransaction[]>(demoBillingTransactions);
  const [activeSubscriptionReceipt, setActiveSubscriptionReceipt] = useState<BillingTransaction | null>(null);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<{ planId: PlanTier; cycle: 'monthly' | 'annual' }>({
    planId: 'growth',
    cycle: 'annual',
  });
  const [upgradeModalLimitFeature, setUpgradeModalLimitFeature] = useState<'farms' | 'fields' | 'crops' | 'team' | null>(null);

  // Team RBAC & Role Simulator
  const [activeSimulatedRole, setActiveSimulatedRole] = useState<TeamRole>('Owner / Director');
  const [activeMemberForEdit, setActiveMemberForEdit] = useState<TeamMember | null>(null);
  const [isRoleMatrixOpen, setIsRoleMatrixOpen] = useState(false);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Test connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setFirebaseUser(user);
        try {
          const profile = await fetchUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            const org = await fetchOrganization(profile.organizationId);
            setOrganization(org);
          }
          setIsDemoMode(false);
          // If on landing/signin/signup, route to app
          setCurrentView((prev) => (prev === 'landing' || prev === 'signin' || prev === 'signup' ? 'app' : prev));
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setFirebaseUser(null);
        setUserProfile(null);
        setOrganization(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Attach Firestore Subscriptions when user and organization exist
  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, load realistic demo data
      setFarms(demoFarms);
      setFields(demoFields);
      setCrops(demoCrops);
      setSeasons(demoSeasons);
      setExpenses(demoExpenses);
      setHarvests(demoHarvests);
      setSales(demoSales);
      setInventory(demoInventory);
      setSuppliers(demoSuppliers);
      setPurchases(demoPurchases);
      setStockMovements(demoStockMovements);
      setReceipts(demoReceipts);
      setCustomers(demoCustomers);
      setSalePayments(demoSalePayments);
      setProduceAdjustments(demoProduceAdjustments);
      setTasks(demoTasks);
      setTeam(demoTeam);
      setBillingTransactions(demoBillingTransactions);
      // Poultry Demo Data
      setFlocks(demoFlocks);
      setFlockMovements(demoFlockMovements);
      setPoultryHouses(demoPoultryHouses);
      setFeedInventory(demoFeedInventory);
      setFeedConsumption(demoFeedConsumption);
      setFlockHealthRecords(demoFlockHealthRecords);
      setEggProductionRecords(demoEggProductionRecords);
      setPoultrySales(demoPoultrySales);
      return;
    }

    if (!organization?.id) {
      // If not logged in and not in demo mode, start with empty list
      setFarms([]);
      setFields([]);
      setCrops([]);
      setSeasons([]);
      setExpenses([]);
      setHarvests([]);
      setSales([]);
      setInventory([]);
      setSuppliers([]);
      setPurchases([]);
      setStockMovements([]);
      setReceipts([]);
      setCustomers([]);
      setSalePayments([]);
      setProduceAdjustments([]);
      setTasks([]);
      setTeam([]);
      setBillingTransactions([]);
      // Poultry Clear
      setFlocks([]);
      setFlockMovements([]);
      setPoultryHouses([]);
      setFeedInventory([]);
      setFeedConsumption([]);
      setFlockHealthRecords([]);
      setEggProductionRecords([]);
      setPoultrySales([]);
      return;
    }

    const orgId = organization.id;
    setIsDataLoading(true);
    setDbError(null);

    const unsubFarms = subscribeToFarms(orgId, (data) => setFarms(data), (e) => setDbError(String(e)));
    const unsubFields = subscribeToFields(orgId, (data) => setFields(data), (e) => setDbError(String(e)));
    const unsubCrops = subscribeToCrops(orgId, (data) => setCrops(data), (e) => setDbError(String(e)));
    const unsubSeasons = subscribeToSeasons(orgId, (data) => setSeasons(data), (e) => setDbError(String(e)));
    const unsubExpenses = subscribeToExpenses(orgId, (data) => setExpenses(data), (e) => setDbError(String(e)));
    const unsubHarvests = subscribeToHarvests(orgId, (data) => setHarvests(data), (e) => setDbError(String(e)));
    const unsubSales = subscribeToSales(orgId, (data) => setSales(data), (e) => setDbError(String(e)));
    const unsubInventory = subscribeToInventory(orgId, (data) => setInventory(data), (e) => setDbError(String(e)));
    const unsubSuppliers = subscribeToSuppliers(orgId, (data) => setSuppliers(data), (e) => setDbError(String(e)));
    const unsubPurchases = subscribeToPurchases(orgId, (data) => setPurchases(data), (e) => setDbError(String(e)));
    const unsubStockMovements = subscribeToStockMovements(orgId, (data) => setStockMovements(data), (e) => setDbError(String(e)));
    const unsubReceipts = subscribeToReceipts(orgId, (data) => setReceipts(data), (e) => setDbError(String(e)));
    const unsubCustomers = subscribeToCustomers(orgId, (data) => setCustomers(data), (e) => setDbError(String(e)));
    const unsubSalePayments = subscribeToSalePayments(orgId, (data) => setSalePayments(data), (e) => setDbError(String(e)));
    const unsubProduceAdjustments = subscribeToProduceAdjustments(orgId, (data) => setProduceAdjustments(data), (e) => setDbError(String(e)));
    const unsubTasks = subscribeToTasks(orgId, (data) => setTasks(data), (e) => setDbError(String(e)));
    const unsubTeam = subscribeToTeam(orgId, (data) => setTeam(data), (e) => setDbError(String(e)));
    const unsubBilling = subscribeToBillingTransactions(orgId, (data) => setBillingTransactions(data), (e) => setDbError(String(e)));

    // Poultry Subscriptions
    const unsubFlocks = subscribeToFlocks(orgId, (data) => setFlocks(data), (e) => setDbError(String(e)));
    const unsubMovements = subscribeToFlockMovements(orgId, (data) => setFlockMovements(data), (e) => setDbError(String(e)));
    const unsubHouses = subscribeToPoultryHouses(orgId, (data) => setPoultryHouses(data), (e) => setDbError(String(e)));
    const unsubFeedInv = subscribeToFeedInventory(orgId, (data) => setFeedInventory(data), (e) => setDbError(String(e)));
    const unsubFeedCons = subscribeToFeedConsumption(orgId, (data) => setFeedConsumption(data), (e) => setDbError(String(e)));
    const unsubHealth = subscribeToFlockHealth(orgId, (data) => setFlockHealthRecords(data), (e) => setDbError(String(e)));
    const unsubEggs = subscribeToEggProduction(orgId, (data) => setEggProductionRecords(data), (e) => setDbError(String(e)));
    const unsubPSales = subscribeToPoultrySales(orgId, (data) => setPoultrySales(data), (e) => setDbError(String(e)));

    setIsDataLoading(false);

    return () => {
      unsubFarms();
      unsubFields();
      unsubCrops();
      unsubSeasons();
      unsubExpenses();
      unsubHarvests();
      unsubSales();
      unsubInventory();
      unsubSuppliers();
      unsubPurchases();
      unsubStockMovements();
      unsubReceipts();
      unsubCustomers();
      unsubSalePayments();
      unsubProduceAdjustments();
      unsubTasks();
      unsubTeam();
      unsubBilling();
      unsubFlocks();
      unsubMovements();
      unsubHouses();
      unsubFeedInv();
      unsubFeedCons();
      unsubHealth();
      unsubEggs();
      unsubPSales();
    };
  }, [organization?.id, isDemoMode]);

  // Produce Stock Calculation
  const produceStockSummaries = useMemo<ProduceStockSummary[]>(() => {
    return crops.map((crop) => {
      const cropHarvests = harvests.filter((h) => h.cropId === crop.id);
      const cropSales = sales.filter((s) => s.cropId === crop.id);
      const cropAdjustments = produceAdjustments.filter((a) => a.cropId === crop.id);

      const totalHarvestedQuantity = cropHarvests.reduce((sum, h) => sum + h.quantity, 0);
      const totalHarvestedKg = cropHarvests.reduce((sum, h) => sum + h.normalizedKg, 0);

      const totalSoldQuantity = cropSales.reduce((sum, s) => sum + s.quantitySold, 0);
      const totalSoldKg = cropSales.reduce((sum, s) => sum + s.normalizedKg, 0);

      const totalAdjustedQuantity = cropAdjustments.reduce((sum, a) => sum + a.quantity, 0);
      const totalAdjustedKg = cropAdjustments.reduce((sum, a) => sum + a.normalizedKg, 0);

      const availableQuantity = Math.max(0, totalHarvestedQuantity - totalSoldQuantity - totalAdjustedQuantity);
      const availableKg = Math.max(0, totalHarvestedKg - totalSoldKg - totalAdjustedKg);

      const unit =
        cropHarvests[0]?.unit ||
        (crop.category === 'Cereal / Grain'
          ? 'bags_50kg'
          : crop.category === 'Horticulture / Veg'
          ? 'crates_25kg'
          : 'metric_tons');

      const storageLocations = Array.from(new Set(cropHarvests.map((h) => h.storageLocation).filter(Boolean)));
      const gradeQualities = Array.from(new Set(cropHarvests.map((h) => h.gradeQuality).filter(Boolean)));

      const totalSalesRevenue = cropSales.reduce((sum, s) => sum + s.totalAmount, 0);
      const averageSalePricePerUnit =
        totalSoldQuantity > 0
          ? Math.round(totalSalesRevenue / totalSoldQuantity)
          : cropHarvests[0]?.estimatedMarketPricePerUnit ||
            (unit === 'bags_50kg' ? 24000 : unit === 'crates_25kg' ? 10500 : 110000);

      const estimatedValuation = availableQuantity * averageSalePricePerUnit;

      const stockStatus: ProduceStockSummary['stockStatus'] =
        availableQuantity <= 0
          ? 'depleted'
          : totalHarvestedQuantity > 0 && availableQuantity <= totalHarvestedQuantity * 0.15
          ? 'low_stock'
          : 'in_stock';

      return {
        cropId: crop.id,
        cropName: crop.name,
        category: crop.category,
        variety: crop.variety,
        totalHarvestedQuantity,
        totalHarvestedKg,
        totalSoldQuantity,
        totalSoldKg,
        totalAdjustedQuantity,
        totalAdjustedKg,
        availableQuantity,
        availableKg,
        unit,
        storageLocations,
        gradeQualities,
        averageSalePricePerUnit,
        estimatedValuation,
        stockStatus,
      };
    });
  }, [crops, harvests, sales, produceAdjustments]);

  // Selected active farm helper
  const selectedFarm = useMemo<Farm | null>(() => {
    return farms.find((f) => f.id === selectedFarmId) || farms[0] || null;
  }, [farms, selectedFarmId]);

  // Flock Profitability Summary (traceable, no double counting)
  const flockProfitability = useMemo<FlockProfitabilitySummary[]>(() => {
    return calculateFlockProfitability(
      flocks,
      flockMovements,
      feedConsumption,
      flockHealthRecords,
      poultrySales,
      expenses,
      eggProductionRecords,
      poultryHouses
    );
  }, [
    flocks,
    flockMovements,
    feedConsumption,
    flockHealthRecords,
    poultrySales,
    expenses,
    eggProductionRecords,
    poultryHouses,
  ]);

  // Financial calculations combining crop sales and recognized poultry sales
  const financialSummary = useMemo(() => {
    const baseSummary = calculateFinancialSummary(expenses, harvests, sales);
    const poultrySalesRevenue = poultrySales.reduce((sum, s) => sum + (s.netAmount || s.totalAmount || 0), 0);
    const poultryCashReceived = poultrySales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
    const poultryOutstanding = poultrySales.reduce((sum, s) => sum + (s.outstandingAmount || 0), 0);

    const combinedSalesRevenue = baseSummary.totalSalesRevenue + poultrySalesRevenue;
    const combinedCashReceived = baseSummary.totalCashReceived + poultryCashReceived;
    const combinedOutstanding = baseSummary.outstandingCustomerPayments + poultryOutstanding;
    const combinedNetOperatingResult = combinedSalesRevenue - baseSummary.totalOperatingExpenses;
    const combinedMarginPercent =
      combinedSalesRevenue > 0 ? (combinedNetOperatingResult / combinedSalesRevenue) * 100 : 0;
    const combinedCashRealization =
      combinedSalesRevenue > 0 ? (combinedCashReceived / combinedSalesRevenue) * 100 : 0;
    const combinedGrossProfit = combinedSalesRevenue - baseSummary.directInputCosts;
    const combinedGrossMargin =
      combinedSalesRevenue > 0 ? (combinedGrossProfit / combinedSalesRevenue) * 100 : 0;

    return {
      ...baseSummary,
      totalSalesRevenue: combinedSalesRevenue,
      totalCashReceived: combinedCashReceived,
      outstandingCustomerPayments: combinedOutstanding,
      cashRealizationRate: Math.round(combinedCashRealization * 10) / 10,
      grossProfit: combinedGrossProfit,
      grossMarginPercent: Math.round(combinedGrossMargin * 10) / 10,
      netOperatingResult: combinedNetOperatingResult,
      operatingMarginPercent: Math.round(combinedMarginPercent * 10) / 10,
      cashOperatingSurplus: combinedCashReceived - baseSummary.totalOperatingExpenses,
    };
  }, [expenses, harvests, sales, poultrySales]);

  const cropProfitability = useMemo(() => {
    return calculateCropProfitability(crops, expenses, harvests, sales, fields);
  }, [crops, expenses, harvests, sales, fields]);

  const fieldProfitability = useMemo(() => {
    return calculateFieldProfitability(fields, crops, expenses, harvests, sales);
  }, [fields, crops, expenses, harvests, sales]);

  // Commercial Plan & Limits
  const currentPlan: PlanTier = useMemo(() => {
    if (organization?.subscription?.planId) {
      return organization.subscription.planId;
    }
    return isDemoMode ? 'growth' : 'starter';
  }, [organization?.subscription?.planId, isDemoMode]);

  const planLimits: PlanLimits = useMemo(() => {
    return SUBSCRIPTION_PLANS[currentPlan].limits;
  }, [currentPlan]);

  const hasPermission = (permission: PermissionKey): boolean => {
    if (activeSimulatedRole === 'Owner / Director') return true;
    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[activeSimulatedRole] || [];
    return defaultPerms.includes(permission);
  };

  const checkPlanLimit = (feature: 'farms' | 'fields' | 'crops' | 'team') => {
    if (feature === 'farms') {
      const allowed = farms.length < planLimits.maxFarms;
      return { allowed, current: farms.length, max: planLimits.maxFarms, label: 'Farm Estates' };
    }
    if (feature === 'fields') {
      const allowed = fields.length < planLimits.maxFields;
      return { allowed, current: fields.length, max: planLimits.maxFields, label: 'Field Blocks' };
    }
    if (feature === 'crops') {
      const activeCount = crops.filter((c) => c.activeStatus).length;
      const allowed = activeCount < planLimits.maxActiveCrops;
      return { allowed, current: activeCount, max: planLimits.maxActiveCrops, label: 'Active Crops' };
    }
    if (feature === 'team') {
      const allowed = team.length < planLimits.maxTeamMembers;
      return { allowed, current: team.length, max: planLimits.maxTeamMembers, label: 'Team Members' };
    }
    return { allowed: true, current: 0, max: Infinity, label: '' };
  };

  const openUpgradeModal = (feature?: 'farms' | 'fields' | 'crops' | 'team') => {
    setUpgradeModalLimitFeature(feature || null);
    setActiveModal('upgrade_plan');
  };

  const openPaystackCheckout = (planId: PlanTier, cycle: 'monthly' | 'annual') => {
    setSelectedPlanForCheckout({ planId, cycle });
    setActiveModal('paystack_checkout');
  };

  const openSubscriptionReceipt = (tx: BillingTransaction) => {
    setActiveSubscriptionReceipt(tx);
    setActiveModal('view_subscription_receipt');
  };

  const openEditTeamMember = (member: TeamMember) => {
    setActiveMemberForEdit(member);
    setActiveModal('edit_team_permissions');
  };

  const upgradeSubscription = async (
    targetPlan: PlanTier,
    cycle: 'monthly' | 'annual',
    reference: string,
    amount: number,
    channel: BillingTransaction['channel']
  ): Promise<BillingTransaction> => {
    const dates = calculatePeriodDates(cycle);
    const newSubscription: SubscriptionInfo = {
      planId: targetPlan,
      billingCycle: cycle,
      status: 'active',
      currentPeriodStart: dates.currentPeriodStart,
      currentPeriodEnd: dates.currentPeriodEnd,
      lastPaymentReference: reference,
      lastPaymentAmount: amount,
      lastPaymentDate: new Date().toISOString(),
      autoRenew: true,
    };

    const tx: BillingTransaction = {
      id: `tx-${Date.now()}`,
      organizationId: organization?.id || 'demo-org',
      reference,
      amountNgn: amount,
      planId: targetPlan,
      planName: SUBSCRIPTION_PLANS[targetPlan].name,
      billingCycle: cycle,
      channel,
      status: 'success',
      paidAt: new Date().toISOString(),
      customerEmail: firebaseUser?.email || settings.email || 'billing@farmpilot.ng',
      customerName: userProfile?.displayName || settings.managerName || 'Adebayo Ogunlesi',
      farmName: organization?.name || settings.farmName || 'Commercial Farm',
      description: `FarmPilot ${SUBSCRIPTION_PLANS[targetPlan].name} ${cycle} Subscription`,
      receiptNumber: generateReceiptNumber(),
    };

    if (!isDemoMode && organization?.id) {
      await updateOrganizationSubscription(organization.id, newSubscription);
      await saveBillingTransaction(organization.id, tx);
      setOrganization((prev) => (prev ? { ...prev, subscription: newSubscription } : null));
    } else {
      if (organization) {
        setOrganization({ ...organization, subscription: newSubscription });
      }
    }

    setBillingTransactions((prev) => [tx, ...prev]);

    showToast({
      type: 'success',
      title: 'Commercial Plan Upgraded via Paystack',
      message: `${SUBSCRIPTION_PLANS[targetPlan].name} plan is now active for ${settings.farmName}!`,
    });

    return tx;
  };

  const updateTeamMemberPermissions = async (
    memberId: string,
    updates: Partial<TeamMember>
  ) => {
    if (!isDemoMode && organization?.id) {
      await updateTeamMemberInFirestore(organization.id, memberId, updates);
    }
    setTeam((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m))
    );
    showToast({
      type: 'success',
      title: 'Member Permissions Updated',
      message: 'Operational role & module access updated.',
    });
  };

  const deleteTeamMember = async (memberId: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteTeamMemberFromFirestore(organization.id, memberId);
    }
    setTeam((prev) => prev.filter((m) => m.id !== memberId));
    showToast({
      type: 'info',
      title: 'Member Removed',
      message: 'Team member account has been deleted.',
    });
  };


  // Auth Operations
  const signUp = async (
    email: string,
    pass: string,
    name: string,
    farmName: string,
    state: string
  ) => {
    try {
      const { user, profile, org } = await signUpUser(email, pass, name, farmName, state);
      setFirebaseUser(user);
      setUserProfile(profile);
      setOrganization(org);
      setIsDemoMode(false);
      showToast({
        type: 'success',
        title: 'Account Registered',
        message: 'Welcome! Verification email dispatched to ' + email,
      });
      setCurrentView('onboarding');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: err.message || 'Failed to create user account.',
      });
      throw err;
    }
  };

  const signIn = async (email: string, pass: string) => {
    try {
      const { user, profile, org } = await signInUser(email, pass);
      setFirebaseUser(user);
      setUserProfile(profile);
      setOrganization(org);
      setIsDemoMode(false);
      showToast({
        type: 'success',
        title: 'Welcome Back',
        message: `Signed in as ${user.displayName || user.email}`,
      });
      setCurrentView('app');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Sign In Failed',
        message: err.message || 'Invalid credentials provided.',
      });
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { user, profile, org } = await signInWithGooglePopup();
      setFirebaseUser(user);
      setUserProfile(profile);
      setOrganization(org);
      setIsDemoMode(false);
      showToast({
        type: 'success',
        title: 'Google Sign In',
        message: `Connected as ${user.displayName || user.email}`,
      });
      setCurrentView('app');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Google Auth Error',
        message: err.message || 'Could not complete Google authentication.',
      });
      throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await requestPasswordReset(email);
      showToast({
        type: 'info',
        title: 'Password Reset Email Sent',
        message: `Check your inbox at ${email} for reset instructions.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Reset Error',
        message: err.message || 'Unable to send password reset email.',
      });
      throw err;
    }
  };

  const resendVerification = async () => {
    try {
      await resendEmailVerificationEmail();
      showToast({
        type: 'info',
        title: 'Verification Link Dispatched',
        message: 'A fresh verification email was sent to your address.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Verification Error',
        message: err.message || 'Could not dispatch verification email.',
      });
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setFirebaseUser(null);
      setUserProfile(null);
      setOrganization(null);
      setCurrentView('landing');
      showToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been safely signed out of FarmPilot.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Logout Issue',
        message: err.message || 'Error logging out.',
      });
    }
  };

  // Mutators for Business Records
  const currentOrgId = organization?.id || 'demo-org';

  const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
    const id = `exp-${Date.now()}`;
    const expenseRecord: Expense = { ...newExpense, id, organizationId: currentOrgId };

    if (!isDemoMode && organization?.id) {
      await addExpenseToFirestore(organization.id, expenseRecord);
    } else {
      setExpenses((prev) => [expenseRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Expense Recorded',
      message: `${newExpense.description} for ₦${newExpense.amount.toLocaleString()} saved to Cloud Firestore.`,
    });
    closeModal();
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    if (!isDemoMode && organization?.id) {
      await updateExpenseInFirestore(organization.id, id, updates);
    } else {
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    }
    showToast({
      type: 'success',
      title: 'Expense Updated',
      message: 'Expense ledger entry revised successfully.',
    });
  };

  const deleteExpense = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteExpenseFromFirestore(organization.id, id);
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Expense Deleted',
      message: 'Expense removed from ledger.',
    });
  };

  const addCrop = async (newCrop: Omit<Crop, 'id'>) => {
    const limit = checkPlanLimit('crops');
    if (!limit.allowed) {
      showToast({
        type: 'warning',
        title: 'Active Crop Limit Reached',
        message: `Your current ${SUBSCRIPTION_PLANS[currentPlan].name} plan allows up to ${limit.max} active crops. Upgrade to plant more cycles.`,
      });
      openUpgradeModal('crops');
      return;
    }

    const id = `crop-${Date.now()}`;
    const cropRecord: Crop = { ...newCrop, id, organizationId: currentOrgId };

    if (!isDemoMode && organization?.id) {
      await addCropToFirestore(organization.id, cropRecord);
    } else {
      setCrops((prev) => [cropRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Crop Planted / Registered',
      message: `${newCrop.name} (${newCrop.variety}) saved to database.`,
    });
    closeModal();
  };

  const updateCrop = async (id: string, updates: Partial<Crop>) => {
    if (!isDemoMode && organization?.id) {
      await updateCropInFirestore(organization.id, id, updates);
    } else {
      setCrops((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
    showToast({
      type: 'success',
      title: 'Crop Cycle Updated',
      message: 'Crop parameters and milestones saved.',
    });
  };

  const updateCropStage = async (id: string, stage: Crop['stage']) => {
    if (!isDemoMode && organization?.id) {
      await updateCropStageInFirestore(organization.id, id, stage);
    } else {
      setCrops((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
    }
    showToast({
      type: 'info',
      title: 'Crop Stage Updated',
      message: `Crop stage updated to ${stage.replace('_', ' ')}.`,
    });
  };

  const deleteCrop = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteCropFromFirestore(organization.id, id);
    } else {
      setCrops((prev) => prev.filter((c) => c.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Crop Removed',
      message: 'Crop record deleted from database.',
    });
  };

  const addHarvest = async (newHarvest: Omit<HarvestRecord, 'id' | 'normalizedKg'>) => {
    const id = `harv-${Date.now()}`;
    const normalizedKg = normalizeToKg(newHarvest.quantity, newHarvest.unit);
    const harvestRecord: HarvestRecord = {
      ...newHarvest,
      id,
      normalizedKg,
      organizationId: currentOrgId,
    };

    if (!isDemoMode && organization?.id) {
      await addHarvestToFirestore(organization.id, harvestRecord);
    } else {
      setHarvests((prev) => [harvestRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Harvest Logged',
      message: `${newHarvest.quantity} ${newHarvest.unit.replace('_', ' ')} saved to inventory.`,
    });
    closeModal();
  };

  const deleteHarvest = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteHarvestFromFirestore(organization.id, id);
    } else {
      setHarvests((prev) => prev.filter((h) => h.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Harvest Deleted',
      message: 'Harvest record removed.',
    });
  };

  const addSale = async (newSale: Omit<SaleRecord, 'id' | 'normalizedKg' | 'outstandingAmount'>) => {
    const id = `sale-${Date.now()}`;
    const normalizedKg = normalizeToKg(newSale.quantitySold, newSale.unit);
    const outstandingAmount = Math.max(0, newSale.totalAmount - newSale.amountPaid);
    const paymentStatus: SaleRecord['paymentStatus'] =
      outstandingAmount === 0 ? 'paid' : newSale.amountPaid > 0 ? 'partial' : 'outstanding';

    const saleRecord: SaleRecord = {
      ...newSale,
      id,
      normalizedKg,
      outstandingAmount,
      paymentStatus,
      organizationId: currentOrgId,
    };

    if (!isDemoMode && organization?.id) {
      await addSaleToFirestore(organization.id, saleRecord);
    } else {
      setSales((prev) => [saleRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Sale Transaction Recorded',
      message: `Invoice #${newSale.invoiceNumber} logged for ₦${newSale.totalAmount.toLocaleString()}.`,
    });
    closeModal();
  };

  const recordSalePayment = async (
    saleId: string,
    additionalAmount: number,
    paymentDetails?: Partial<SalePayment>
  ) => {
    const existing = sales.find((s) => s.id === saleId);
    if (!existing) return;

    const newPaid = Math.min(existing.totalAmount, existing.amountPaid + additionalAmount);
    const newOutstanding = Math.max(0, existing.totalAmount - newPaid);
    const paymentStatus: SaleRecord['paymentStatus'] = newOutstanding === 0 ? 'paid' : 'partial';

    if (!isDemoMode && organization?.id) {
      await recordSalePaymentInFirestore(organization.id, saleId, additionalAmount, existing);
    } else {
      setSales((prev) =>
        prev.map((s) => {
          if (s.id !== saleId) return s;
          return {
            ...s,
            amountPaid: newPaid,
            outstandingAmount: newOutstanding,
            paymentStatus,
          };
        })
      );
    }

    // Automatically record payment remittance in salePayments
    const paymentRecord: SalePayment = {
      id: `pay-${Date.now()}`,
      organizationId: currentOrgId,
      saleId: existing.id,
      invoiceNumber: existing.invoiceNumber,
      customerId: existing.customerId,
      customerName: existing.buyerName,
      date: paymentDetails?.date || new Date().toISOString().split('T')[0],
      amount: additionalAmount,
      paymentMethod: paymentDetails?.paymentMethod || 'Bank Transfer',
      referenceNumber:
        paymentDetails?.referenceNumber ||
        `REM-${Math.floor(100000 + Math.random() * 900000)}`,
      bankName: paymentDetails?.bankName || 'Direct Wire Transfer',
      accountCredited: paymentDetails?.accountCredited || 'Primary Farm Account',
      receivedBy:
        paymentDetails?.receivedBy || userProfile?.displayName || 'Farm Manager',
      notes: paymentDetails?.notes || 'Customer invoice settlement installment.',
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (!isDemoMode && organization?.id) {
      await addSalePaymentToFirestore(organization.id, paymentRecord);
    } else {
      setSalePayments((prev) => [paymentRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Payment Credited',
      message: `₦${additionalAmount.toLocaleString()} credited against Invoice ${existing.invoiceNumber}.`,
    });
  };

  const deleteSale = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteSaleFromFirestore(organization.id, id);
    } else {
      setSales((prev) => prev.filter((s) => s.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Sale Removed',
      message: 'Sale record deleted.',
    });
  };

  const addField = async (newField: Omit<Field, 'id'>) => {
    const limit = checkPlanLimit('fields');
    if (!limit.allowed) {
      showToast({
        type: 'warning',
        title: 'Field Block Limit Reached',
        message: `Your current ${SUBSCRIPTION_PLANS[currentPlan].name} plan allows up to ${limit.max} field blocks. Upgrade to add more plots.`,
      });
      openUpgradeModal('fields');
      return;
    }

    const id = `field-${Date.now()}`;
    const fieldRecord: Field = { ...newField, id, organizationId: currentOrgId };

    if (!isDemoMode && organization?.id) {
      await addFieldToFirestore(organization.id, fieldRecord);
    } else {
      setFields((prev) => [...prev, fieldRecord]);
    }

    showToast({
      type: 'success',
      title: 'Field Block Created',
      message: `Field ${newField.name} saved to Cloud Firestore.`,
    });
    closeModal();
  };

  const updateField = async (id: string, updates: Partial<Field>) => {
    if (!isDemoMode && organization?.id) {
      await updateFieldInFirestore(organization.id, id, updates);
    } else {
      setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    }
    showToast({
      type: 'success',
      title: 'Field Updated',
      message: 'Field block specifications updated.',
    });
  };

  const deleteField = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteFieldFromFirestore(organization.id, id);
    } else {
      setFields((prev) => prev.filter((f) => f.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Field Removed',
      message: 'Field block removed.',
    });
  };

  const addFarm = async (newFarm: Omit<Farm, 'id' | 'createdAt'>) => {
    const limit = checkPlanLimit('farms');
    if (!limit.allowed) {
      showToast({
        type: 'warning',
        title: 'Farm Estate Limit Reached',
        message: `Your current ${SUBSCRIPTION_PLANS[currentPlan].name} plan allows up to ${limit.max} farm estates. Upgrade to add more estates.`,
      });
      openUpgradeModal('farms');
      return;
    }

    const id = `farm-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const farmRecord: Farm = { ...newFarm, id, createdAt, organizationId: currentOrgId };

    if (!isDemoMode && organization?.id) {
      await addFarmToFirestore(organization.id, farmRecord);
    } else {
      setFarms((prev) => [...prev, farmRecord]);
    }

    showToast({
      type: 'success',
      title: 'Farm Estate Registered',
      message: `${newFarm.name} saved in Cloud Firestore.`,
    });
    closeModal();
  };

  const updateFarm = async (id: string, updates: Partial<Farm>) => {
    if (!isDemoMode && organization?.id) {
      await updateFarmInFirestore(organization.id, id, updates);
    } else {
      setFarms((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    }
    showToast({
      type: 'success',
      title: 'Farm Estate Updated',
      message: 'Farm estate details saved.',
    });
  };

  const deleteFarm = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteFarmFromFirestore(organization.id, id);
    } else {
      setFarms((prev) => prev.filter((f) => f.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Farm Estate Removed',
      message: 'Farm estate record removed.',
    });
  };

  const addSeason = async (newSeason: Omit<CropSeason, 'id'>) => {
    const id = `season-${Date.now()}`;
    const seasonRecord: CropSeason = { ...newSeason, id, organizationId: currentOrgId };

    if (!isDemoMode && organization?.id) {
      await addSeasonToFirestore(organization.id, seasonRecord);
    } else {
      setSeasons((prev) => [seasonRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Crop Season Created',
      message: `${newSeason.name} registered in Cloud Firestore.`,
    });
    closeModal();
  };

  const updateSeason = async (id: string, updates: Partial<CropSeason>) => {
    if (!isDemoMode && organization?.id) {
      await updateSeasonInFirestore(organization.id, id, updates);
    } else {
      setSeasons((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    }
    showToast({
      type: 'success',
      title: 'Crop Season Updated',
      message: 'Agricultural cycle updated.',
    });
  };

  const deleteSeason = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteSeasonFromFirestore(organization.id, id);
    } else {
      setSeasons((prev) => prev.filter((s) => s.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Crop Season Removed',
      message: 'Agricultural cycle deleted.',
    });
  };

  const addInventoryItem = async (newItem: Omit<InventoryItem, 'id'>) => {
    const id = `inv-${Date.now()}`;
    const itemRecord: InventoryItem = { ...newItem, id, organizationId: currentOrgId };

    if (!isDemoMode && organization?.id) {
      await addInventoryToFirestore(organization.id, itemRecord);
    } else {
      setInventory((prev) => [...prev, itemRecord]);
    }

    showToast({
      type: 'success',
      title: 'Inventory Item Added',
      message: `${newItem.name} stock saved in Cloud Firestore.`,
    });
    closeModal();
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    if (!isDemoMode && organization?.id) {
      await updateInventoryInFirestore(organization.id, id, updates);
    } else {
      setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    }
    showToast({
      type: 'success',
      title: 'Inventory Item Updated',
      message: 'Warehouse item parameters saved.',
    });
  };

  const deleteInventoryItem = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteInventoryFromFirestore(organization.id, id);
    } else {
      setInventory((prev) => prev.filter((i) => i.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Inventory Item Removed',
      message: 'Warehouse stock item deleted.',
    });
  };

  const addSupplier = async (newSupplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    const id = `sup-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const supplierRecord: Supplier = { ...newSupplier, id, createdAt, organizationId: currentOrgId };

    if (!isDemoMode && organization?.id) {
      await addSupplierToFirestore(organization.id, supplierRecord);
    } else {
      setSuppliers((prev) => [...prev, supplierRecord]);
    }

    showToast({
      type: 'success',
      title: 'Supplier Registered',
      message: `${newSupplier.name} added to approved suppliers.`,
    });
    closeModal();
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    if (!isDemoMode && organization?.id) {
      await updateSupplierInFirestore(organization.id, id, updates);
    } else {
      setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    }
    showToast({
      type: 'success',
      title: 'Supplier Updated',
      message: 'Supplier information updated.',
    });
  };

  const deleteSupplier = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteSupplierFromFirestore(organization.id, id);
    } else {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Supplier Removed',
      message: 'Supplier deleted from directory.',
    });
  };

  const addPurchase = async (newPurchase: Omit<PurchaseRecord, 'id'>) => {
    const id = `pur-${Date.now()}`;
    const purchaseRecord: PurchaseRecord = { ...newPurchase, id, organizationId: currentOrgId };

    if (!isDemoMode && organization?.id) {
      await addPurchaseToFirestore(organization.id, purchaseRecord);
    } else {
      setPurchases((prev) => [purchaseRecord, ...prev]);
    }

    // Auto restock inventory if delivery received or autoRestocked
    if (newPurchase.deliveryStatus === 'received' || newPurchase.autoRestocked) {
      for (const item of newPurchase.items) {
        const existing = inventory.find(
          (inv) => inv.id === item.inventoryItemId || inv.name.toLowerCase() === item.name.toLowerCase()
        );
        const prevStock = existing ? existing.currentStock : 0;
        const newStock = prevStock + item.quantity;

        if (existing) {
          await updateInventoryItem(existing.id, {
            currentStock: newStock,
            lastRestocked: newPurchase.date,
            costPerUnit: item.unitPrice,
          });
        } else {
          await addInventoryItem({
            farmId: newPurchase.farmId || farms[0]?.id || 'farm-001',
            name: item.name,
            category: (item.category as any) || 'Fertilizer',
            currentStock: item.quantity,
            unit: item.unit,
            reorderLevel: Math.max(5, Math.floor(item.quantity * 0.2)),
            costPerUnit: item.unitPrice,
            lastRestocked: newPurchase.date,
            supplier: newPurchase.supplierName,
            supplierId: newPurchase.supplierId,
          });
        }

        // Add Stock Movement IN
        const movId = `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const movement: StockMovement = {
          id: movId,
          organizationId: currentOrgId,
          farmId: newPurchase.farmId || farms[0]?.id || 'farm-001',
          inventoryItemId: existing?.id || `inv-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
          inventoryItemName: item.name,
          type: 'IN',
          quantity: item.quantity,
          unit: item.unit,
          previousStock: prevStock,
          newStock: newStock,
          date: newPurchase.date,
          performedBy: userProfile?.displayName || 'Farm Manager',
          reason: `Procurement Order ${newPurchase.purchaseOrderNumber}`,
          referenceType: 'purchase',
          referenceId: id,
        };
        if (!isDemoMode && organization?.id) {
          await addStockMovementToFirestore(organization.id, movement);
        } else {
          setStockMovements((prev) => [movement, ...prev]);
        }
      }
    }

    // If receiptNumber provided, create a ReceiptRecord
    if (newPurchase.receiptNumber) {
      const rcptId = `rcpt-${Date.now()}`;
      const rcpt: ReceiptRecord = {
        id: rcptId,
        organizationId: currentOrgId,
        farmId: newPurchase.farmId || farms[0]?.id || 'farm-001',
        receiptNumber: newPurchase.receiptNumber,
        title: `Procurement Invoice: ${newPurchase.items.map((i) => i.name).join(', ')}`,
        vendor: newPurchase.supplierName,
        date: newPurchase.date,
        amount: newPurchase.totalAmount,
        category: (newPurchase.items[0]?.category.toLowerCase().includes('seed')
          ? 'seeds_seedlings'
          : newPurchase.items[0]?.category.toLowerCase().includes('fuel')
          ? 'mechanization_fuel'
          : 'fertilizer_chemicals') as any,
        paymentMethod: newPurchase.paymentMethod,
        linkedPurchaseId: id,
        auditStatus: newPurchase.paymentStatus === 'paid' ? 'verified' : 'pending_audit',
        verifiedBy: userProfile?.displayName,
        notes: newPurchase.notes,
      };
      if (!isDemoMode && organization?.id) {
        await addReceiptToFirestore(organization.id, rcpt);
      } else {
        setReceipts((prev) => [rcpt, ...prev]);
      }
    }

    // Automatically record an expense for the paid amount
    if (newPurchase.amountPaid > 0) {
      const expId = `exp-pur-${Date.now()}`;
      const expenseRec: Expense = {
        id: expId,
        organizationId: currentOrgId,
        farmId: newPurchase.farmId || farms[0]?.id || 'farm-001',
        supplierId: newPurchase.supplierId,
        date: newPurchase.date,
        category: (newPurchase.items[0]?.category.toLowerCase().includes('seed')
          ? 'seeds_seedlings'
          : newPurchase.items[0]?.category.toLowerCase().includes('fuel')
          ? 'mechanization_fuel'
          : 'fertilizer_chemicals') as any,
        description: `Purchase ${newPurchase.purchaseOrderNumber}: ${newPurchase.items.map((i) => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}`,
        amount: newPurchase.amountPaid,
        vendor: newPurchase.supplierName,
        receiptNumber: newPurchase.receiptNumber,
        paymentMethod: newPurchase.paymentMethod,
        paymentStatus: newPurchase.outstandingAmount === 0 ? 'paid' : 'pending',
        notes: newPurchase.notes,
      };
      if (!isDemoMode && organization?.id) {
        await addExpenseToFirestore(organization.id, expenseRec);
      } else {
        setExpenses((prev) => [expenseRec, ...prev]);
      }
    }

    showToast({
      type: 'success',
      title: 'Purchase Order Logged',
      message: `${newPurchase.purchaseOrderNumber} recorded with ₦${newPurchase.totalAmount.toLocaleString()} total value.`,
    });
    closeModal();
  };

  const updatePurchase = async (id: string, updates: Partial<PurchaseRecord>) => {
    if (!isDemoMode && organization?.id) {
      await updatePurchaseInFirestore(organization.id, id, updates);
    } else {
      setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }
    showToast({
      type: 'success',
      title: 'Purchase Order Updated',
      message: 'Purchase record saved.',
    });
  };

  const deletePurchase = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deletePurchaseFromFirestore(organization.id, id);
    } else {
      setPurchases((prev) => prev.filter((p) => p.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Purchase Removed',
      message: 'Purchase record deleted.',
    });
  };

  const addStockMovement = async (newMovement: Omit<StockMovement, 'id'>) => {
    const id = `mov-${Date.now()}`;
    const movementRecord: StockMovement = { ...newMovement, id, organizationId: currentOrgId };

    // Update inventory item stock
    const item = inventory.find((i) => i.id === newMovement.inventoryItemId);
    if (item) {
      let updatedStock = item.currentStock;
      if (newMovement.type === 'IN') {
        updatedStock = item.currentStock + newMovement.quantity;
      } else if (newMovement.type === 'OUT' || newMovement.type === 'RETURN') {
        updatedStock = Math.max(0, item.currentStock - newMovement.quantity);
      } else if (newMovement.type === 'ADJUSTMENT') {
        updatedStock = newMovement.newStock;
      }
      await updateInventoryItem(item.id, {
        currentStock: updatedStock,
        lastRestocked: newMovement.type === 'IN' ? newMovement.date : item.lastRestocked,
      });
    }

    if (!isDemoMode && organization?.id) {
      await addStockMovementToFirestore(organization.id, movementRecord);
    } else {
      setStockMovements((prev) => [movementRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Stock Movement Recorded',
      message: `${newMovement.type} movement of ${newMovement.quantity} ${newMovement.unit} logged.`,
    });
    closeModal();
  };

  const deleteStockMovement = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteStockMovementFromFirestore(organization.id, id);
    } else {
      setStockMovements((prev) => prev.filter((m) => m.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Stock Movement Deleted',
      message: 'Stock movement log removed.',
    });
  };

  const addReceipt = async (newReceipt: Omit<ReceiptRecord, 'id'>) => {
    const id = `rcpt-${Date.now()}`;
    const receiptRecord: ReceiptRecord = { ...newReceipt, id, organizationId: currentOrgId };

    if (!isDemoMode && organization?.id) {
      await addReceiptToFirestore(organization.id, receiptRecord);
    } else {
      setReceipts((prev) => [receiptRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Receipt Stored',
      message: `Voucher ${newReceipt.receiptNumber} recorded for audit.`,
    });
    closeModal();
  };

  const updateReceipt = async (id: string, updates: Partial<ReceiptRecord>) => {
    if (!isDemoMode && organization?.id) {
      await updateReceiptInFirestore(organization.id, id, updates);
    } else {
      setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    }
    showToast({
      type: 'success',
      title: 'Receipt Updated',
      message: 'Audit verification details updated.',
    });
  };

  const deleteReceipt = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteReceiptFromFirestore(organization.id, id);
    } else {
      setReceipts((prev) => prev.filter((r) => r.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Receipt Removed',
      message: 'Receipt voucher removed.',
    });
  };

  const addTask = async (newTask: Omit<FarmTask, 'id'>) => {
    const id = `task-${Date.now()}`;
    const taskRecord: FarmTask = { ...newTask, id, organizationId: currentOrgId };

    if (!isDemoMode && organization?.id) {
      await addTaskToFirestore(organization.id, taskRecord);
    } else {
      setTasks((prev) => [{ ...taskRecord }, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Task Assigned',
      message: `Task "${newTask.title}" saved.`,
    });
    closeModal();
  };

  const updateTask = async (id: string, updates: Partial<FarmTask>) => {
    if (!isDemoMode && organization?.id) {
      await updateTaskInFirestore(organization.id, id, updates);
    } else {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }
    showToast({
      type: 'success',
      title: 'Task Updated',
      message: 'Schedule and reminder updated.',
    });
  };

  const toggleTaskStatus = async (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    const newStatus = current.status === 'completed' ? 'pending' : 'completed';

    if (!isDemoMode && organization?.id) {
      await updateTaskStatusInFirestore(organization.id, id, newStatus);
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }
  };

  const deleteTask = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteTaskFromFirestore(organization.id, id);
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const addTeamMember = async (newMember: Omit<TeamMember, 'id'>) => {
    const limit = checkPlanLimit('team');
    if (!limit.allowed) {
      showToast({
        type: 'warning',
        title: 'Team Member Limit Reached',
        message: `Your current ${SUBSCRIPTION_PLANS[currentPlan].name} plan allows up to ${limit.max} team members. Upgrade to invite more staff.`,
      });
      openUpgradeModal('team');
      return;
    }

    const id = `team-${Date.now()}`;
    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[newMember.role] || [];
    const memberRecord: TeamMember = {
      ...newMember,
      id,
      organizationId: currentOrgId,
      permissions: newMember.permissions || defaultPerms,
      invitedAt: new Date().toISOString().split('T')[0],
      lastActiveAt: 'Just added',
    };

    if (!isDemoMode && organization?.id) {
      await addTeamMemberToFirestore(organization.id, memberRecord);
    } else {
      setTeam((prev) => [...prev, memberRecord]);
    }

    showToast({
      type: 'success',
      title: 'Team Member Added',
      message: `${newMember.name} added as ${newMember.role}.`,
    });
    closeModal();
  };

  const updateSettings = (newSettings: Partial<FarmSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Farm configuration updated.',
    });
  };

  const addCustomer = async (newCustomer: Omit<Customer, 'id' | 'createdAt'>) => {
    const id = `cust-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const customerRecord: Customer = {
      ...newCustomer,
      id,
      createdAt,
      organizationId: currentOrgId,
    };

    if (!isDemoMode && organization?.id) {
      await addCustomerToFirestore(organization.id, customerRecord);
    } else {
      setCustomers((prev) => [...prev, customerRecord]);
    }

    showToast({
      type: 'success',
      title: 'Customer Added',
      message: `${newCustomer.name} registered in customer directory.`,
    });
    closeModal();
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    if (!isDemoMode && organization?.id) {
      await updateCustomerInFirestore(organization.id, id, updates);
    } else {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
    showToast({
      type: 'success',
      title: 'Customer Updated',
      message: 'Customer information updated successfully.',
    });
  };

  const deleteCustomer = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteCustomerFromFirestore(organization.id, id);
    } else {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Customer Removed',
      message: 'Customer removed from directory.',
    });
  };

  const addSalePayment = async (newPayment: Omit<SalePayment, 'id' | 'createdAt'>) => {
    const id = `pay-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const paymentRecord: SalePayment = {
      ...newPayment,
      id,
      createdAt,
      organizationId: currentOrgId,
    };

    if (!isDemoMode && organization?.id) {
      await addSalePaymentToFirestore(organization.id, paymentRecord);
    } else {
      setSalePayments((prev) => [paymentRecord, ...prev]);
    }

    // Also update the underlying sale invoice
    const sale = sales.find((s) => s.id === newPayment.saleId);
    if (sale) {
      const newPaid = Math.min(sale.totalAmount, sale.amountPaid + newPayment.amount);
      const newOutstanding = Math.max(0, sale.totalAmount - newPaid);
      const paymentStatus: SaleRecord['paymentStatus'] = newOutstanding === 0 ? 'paid' : 'partial';

      if (!isDemoMode && organization?.id) {
        await recordSalePaymentInFirestore(organization.id, sale.id, newPayment.amount, sale);
      } else {
        setSales((prev) =>
          prev.map((s) =>
            s.id === sale.id
              ? { ...s, amountPaid: newPaid, outstandingAmount: newOutstanding, paymentStatus }
              : s
          )
        );
      }
    }

    showToast({
      type: 'success',
      title: 'Remittance Recorded',
      message: `₦${newPayment.amount.toLocaleString()} received for Invoice ${newPayment.invoiceNumber}.`,
    });
    closeModal();
  };

  const deleteSalePayment = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteSalePaymentFromFirestore(organization.id, id);
    } else {
      setSalePayments((prev) => prev.filter((p) => p.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Payment Log Deleted',
      message: 'Remittance record removed.',
    });
  };

  const addProduceAdjustment = async (
    newAdjustment: Omit<ProduceAdjustment, 'id' | 'normalizedKg' | 'createdAt'>
  ) => {
    const id = `adj-${Date.now()}`;
    const normalizedKg = normalizeToKg(newAdjustment.quantity, newAdjustment.unit);
    const createdAt = new Date().toISOString().split('T')[0];
    const adjustmentRecord: ProduceAdjustment = {
      ...newAdjustment,
      id,
      normalizedKg,
      createdAt,
      organizationId: currentOrgId,
    };

    if (!isDemoMode && organization?.id) {
      await addProduceAdjustmentToFirestore(organization.id, adjustmentRecord);
    } else {
      setProduceAdjustments((prev) => [adjustmentRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Stock Adjustment Logged',
      message: `${newAdjustment.quantity} ${newAdjustment.unit.replace('_', ' ')} adjusted from produce stock.`,
    });
    closeModal();
  };

  const deleteProduceAdjustment = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteProduceAdjustmentFromFirestore(organization.id, id);
    } else {
      setProduceAdjustments((prev) => prev.filter((a) => a.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Adjustment Removed',
      message: 'Produce stock adjustment record removed.',
    });
  };

  // ==========================================
  // Poultry Farming Mutators
  // ==========================================
  const addFlock = async (newFlock: Omit<Flock, 'id' | 'createdAt'>) => {
    const id = `flock-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const initialBirdCount = Number(newFlock.initialBirdCount) || 0;
    const unitPrice = Number(newFlock.unitPurchasePrice) || 0;
    const totalCost = initialBirdCount * unitPrice;

    // Check housing capacity if house is assigned
    if (newFlock.houseId) {
      const house = poultryHouses.find((h) => h.id === newFlock.houseId);
      if (house && initialBirdCount > house.capacity) {
        showToast({
          type: 'warning',
          title: 'Housing Capacity Exceeded',
          message: `Flock of ${initialBirdCount.toLocaleString()} birds exceeds pen capacity of ${house.capacity.toLocaleString()} birds!`,
        });
      }
    }

    const flockRecord: Flock = {
      ...newFlock,
      id,
      createdAt,
      organizationId: currentOrgId,
      initialBirdCount,
      currentBirdCount: initialBirdCount,
      unitPurchasePrice: unitPrice,
      totalAcquisitionCost: totalCost,
    };

    if (!isDemoMode && organization?.id) {
      await addFlockToFirestore(flockRecord, organization.id);
    } else {
      setFlocks((prev) => [flockRecord, ...prev]);
    }

    // Record initial acquisition expense if totalCost > 0
    if (totalCost > 0) {
      const expId = `exp-flk-${Date.now()}`;
      const expenseRec: Expense = {
        id: expId,
        organizationId: currentOrgId,
        farmId: newFlock.farmId || farms[0]?.id || 'farm-001',
        flockId: id,
        date: newFlock.acquisitionDate || createdAt,
        category: 'day_old_chicks',
        description: `Acquisition of ${initialBirdCount} ${newFlock.poultryType} (${newFlock.breed})`,
        amount: totalCost,
        vendor: newFlock.supplier || 'Hatchery Supplier',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'paid',
        notes: `Unit price: ₦${unitPrice.toLocaleString()} per bird`,
      };
      if (!isDemoMode && organization?.id) {
        await addExpenseToFirestore(organization.id, expenseRec);
      } else {
        setExpenses((prev) => [expenseRec, ...prev]);
      }
    }

    showToast({
      type: 'success',
      title: 'Poultry Flock Registered',
      message: `${newFlock.name} (${initialBirdCount.toLocaleString()} birds) recorded.`,
    });
    closeModal();
  };

  const updateFlock = async (id: string, updates: Partial<Flock>) => {
    if (!isDemoMode && organization?.id) {
      await updateFlockInFirestore(id, updates, organization.id);
    } else {
      setFlocks((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    }
    showToast({
      type: 'success',
      title: 'Flock Updated',
      message: 'Flock parameters saved.',
    });
  };

  const deleteFlock = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteFlockFromFirestore(id, organization.id);
    } else {
      setFlocks((prev) => prev.filter((f) => f.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Flock Removed',
      message: 'Poultry flock record deleted.',
    });
  };

  const addFlockMovement = async (newMovement: Omit<FlockMovement, 'id' | 'createdAt'>) => {
    const id = `mvt-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const movementRecord: FlockMovement = {
      ...newMovement,
      id,
      createdAt,
      organizationId: currentOrgId,
    };

    // Calculate updated bird count for flock
    const targetFlock = flocks.find((f) => f.id === newMovement.flockId);
    let newCount = targetFlock?.currentBirdCount || 0;
    const qty = Number(newMovement.quantity) || 0;

    if (newMovement.type === 'addition') {
      newCount += qty;
    } else {
      newCount = Math.max(0, newCount - qty);
    }

    if (!isDemoMode && organization?.id) {
      await addFlockMovementToFirestore(movementRecord, organization.id);
      if (targetFlock) {
        await updateFlockInFirestore(targetFlock.id, { currentBirdCount: newCount }, organization.id);
      }
    } else {
      setFlockMovements((prev) => [movementRecord, ...prev]);
      if (targetFlock) {
        setFlocks((prev) =>
          prev.map((f) => (f.id === targetFlock.id ? { ...f, currentBirdCount: newCount } : f))
        );
      }
    }

    showToast({
      type: 'success',
      title: 'Flock Movement Recorded',
      message: `${qty} birds recorded as ${newMovement.type}. New flock count: ${newCount.toLocaleString()}.`,
    });
    closeModal();
  };

  const addPoultryHouse = async (newHouse: Omit<PoultryHouse, 'id' | 'createdAt'>) => {
    const id = `house-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const houseRecord: PoultryHouse = {
      ...newHouse,
      id,
      createdAt,
      organizationId: currentOrgId,
    };

    if (!isDemoMode && organization?.id) {
      await addPoultryHouseToFirestore(houseRecord, organization.id);
    } else {
      setPoultryHouses((prev) => [...prev, houseRecord]);
    }

    showToast({
      type: 'success',
      title: 'Poultry House Added',
      message: `${newHouse.name} (${newHouse.capacity.toLocaleString()} bird capacity) created.`,
    });
    closeModal();
  };

  const updatePoultryHouse = async (id: string, updates: Partial<PoultryHouse>) => {
    if (!isDemoMode && organization?.id) {
      await updatePoultryHouseInFirestore(id, updates, organization.id);
    } else {
      setPoultryHouses((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    }
    showToast({
      type: 'success',
      title: 'Poultry House Updated',
      message: 'Housing specifications updated.',
    });
  };

  const deletePoultryHouse = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deletePoultryHouseFromFirestore(id, organization.id);
    } else {
      setPoultryHouses((prev) => prev.filter((h) => h.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Poultry House Removed',
      message: 'Pen / housing record deleted.',
    });
  };

  const addFeedInventory = async (newItem: Omit<FeedInventoryItem, 'id'>) => {
    const id = `feed-${Date.now()}`;
    const bagWeightKg = Number(newItem.bagWeightKg) || 25;
    const quantityBags = Number(newItem.quantityBags) || 0;
    const costPerBag = Number(newItem.costPerBag) || 0;
    const totalWeightKg = quantityBags * bagWeightKg;
    const costPerKg = costPerBag > 0 && bagWeightKg > 0 ? Math.round(costPerBag / bagWeightKg) : 0;

    const itemRecord: FeedInventoryItem = {
      ...newItem,
      id,
      bagWeightKg,
      quantityBags,
      totalWeightKg,
      costPerBag,
      costPerKg,
      organizationId: currentOrgId,
    };

    if (!isDemoMode && organization?.id) {
      await addFeedInventoryToFirestore(itemRecord, organization.id);
    } else {
      setFeedInventory((prev) => [...prev, itemRecord]);
    }

    showToast({
      type: 'success',
      title: 'Feed Inventory Added',
      message: `${newItem.feedName} (${quantityBags} bags / ${totalWeightKg.toLocaleString()} kg) recorded.`,
    });
    closeModal();
  };

  const updateFeedInventory = async (id: string, updates: Partial<FeedInventoryItem>) => {
    if (!isDemoMode && organization?.id) {
      await updateFeedInventoryInFirestore(id, updates, organization.id);
    } else {
      setFeedInventory((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    }
    showToast({
      type: 'success',
      title: 'Feed Inventory Updated',
      message: 'Feed item parameters updated.',
    });
  };

  const deleteFeedInventory = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deleteFeedInventoryFromFirestore(id, organization.id);
    } else {
      setFeedInventory((prev) => prev.filter((f) => f.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Feed Stock Removed',
      message: 'Feed inventory line item deleted.',
    });
  };

  const addFeedConsumption = async (
    record: Omit<FeedConsumptionRecord, 'id' | 'createdAt' | 'calculatedCost'>
  ) => {
    const id = `fcons-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const qtyBags = Number(record.quantityBags) || 0;
    const bagWeight = Number(record.bagWeightKg) || 25;
    const qtyKg = Number(record.quantityKg) || qtyBags * bagWeight;
    const costKg = Number(record.costPerKg) || 0;
    const calculatedCost = Math.round(qtyKg * costKg);

    const consumptionRecord: FeedConsumptionRecord = {
      ...record,
      id,
      createdAt,
      quantityBags: qtyBags,
      bagWeightKg: bagWeight,
      quantityKg: qtyKg,
      costPerKg: costKg,
      calculatedCost,
      organizationId: currentOrgId,
    };

    // Deduct consumed bags from inventory if linked
    if (record.feedInventoryItemId) {
      const invItem = feedInventory.find((f) => f.id === record.feedInventoryItemId);
      if (invItem) {
        const remainingBags = Math.max(0, invItem.quantityBags - qtyBags);
        const remainingKg = remainingBags * invItem.bagWeightKg;
        await updateFeedInventory(invItem.id, {
          quantityBags: remainingBags,
          totalWeightKg: remainingKg,
        });
      }
    }

    if (!isDemoMode && organization?.id) {
      await addFeedConsumptionToFirestore(consumptionRecord, organization.id);
    } else {
      setFeedConsumption((prev) => [consumptionRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Feed Intake Recorded',
      message: `${qtyBags} bags (${qtyKg} kg) feed logged. Cost: ₦${calculatedCost.toLocaleString()}.`,
    });
    closeModal();
  };

  const addFlockHealth = async (newHealth: Omit<FlockHealthRecord, 'id' | 'createdAt'>) => {
    const id = `hlth-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const healthRecord: FlockHealthRecord = {
      ...newHealth,
      id,
      createdAt,
      organizationId: currentOrgId,
    };

    if (!isDemoMode && organization?.id) {
      await addFlockHealthToFirestore(healthRecord, organization.id);
    } else {
      setFlockHealthRecords((prev) => [healthRecord, ...prev]);
    }

    // If mortality occurred during health incident, log flock movement
    if (newHealth.mortalityRecordedOnDate && newHealth.mortalityRecordedOnDate > 0) {
      await addFlockMovement({
        farmId: newHealth.farmId || farms[0]?.id || 'farm-001',
        flockId: newHealth.flockId,
        date: newHealth.date,
        type: 'mortality',
        quantity: newHealth.mortalityRecordedOnDate,
        causeOfDeath: newHealth.diseaseOrPurpose,
        performedBy: newHealth.administeredBy,
        notes: `Recorded via flock health log (${newHealth.medicationOrVaccineName})`,
      });
    }

    // If cost > 0, also log operating expense
    if (newHealth.cost > 0) {
      const expId = `exp-hlt-${Date.now()}`;
      const expenseRec: Expense = {
        id: expId,
        organizationId: currentOrgId,
        farmId: newHealth.farmId || farms[0]?.id || 'farm-001',
        flockId: newHealth.flockId,
        date: newHealth.date,
        category: newHealth.recordType === 'vaccination' ? 'veterinary_vaccines' : 'poultry_medication',
        description: `${newHealth.recordType === 'vaccination' ? 'Vaccination' : 'Medication'}: ${newHealth.medicationOrVaccineName} (${newHealth.diseaseOrPurpose})`,
        amount: newHealth.cost,
        vendor: newHealth.administeredBy || 'Veterinary Service',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'paid',
        notes: `Route: ${newHealth.route}. Next follow-up: ${newHealth.nextFollowUpDate || 'None'}`,
      };
      if (!isDemoMode && organization?.id) {
        await addExpenseToFirestore(organization.id, expenseRec);
      } else {
        setExpenses((prev) => [expenseRec, ...prev]);
      }
    }

    showToast({
      type: 'success',
      title: 'Health Record Saved',
      message: `${newHealth.medicationOrVaccineName} recorded for flock.`,
    });
    closeModal();
  };

  const addEggProduction = async (
    newRecord: Omit<EggProductionRecord, 'id' | 'createdAt' | 'layingRatePercent'>
  ) => {
    const id = `egg-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const targetFlock = flocks.find((f) => f.id === newRecord.flockId);
    const flockPopulation = targetFlock?.currentBirdCount || targetFlock?.initialBirdCount || 1000;
    const collected = Number(newRecord.totalEggsCollected) || 0;
    const layingRatePercent =
      flockPopulation > 0 ? Math.round((collected / flockPopulation) * 1000) / 10 : 0;
    const crateSize = Number(newRecord.crateSize) || 30;
    const cratesCount = Math.floor(collected / crateSize);

    const recordItem: EggProductionRecord = {
      ...newRecord,
      id,
      createdAt,
      cratesCount,
      crateSize,
      layingRatePercent,
      organizationId: currentOrgId,
    };

    if (!isDemoMode && organization?.id) {
      await addEggProductionToFirestore(recordItem, organization.id);
    } else {
      setEggProductionRecords((prev) => [recordItem, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Egg Production Logged',
      message: `${collected.toLocaleString()} eggs (${cratesCount} crates) logged. Laying rate: ${layingRatePercent}%.`,
    });
    closeModal();
  };

  const addPoultrySale = async (newSale: Omit<PoultrySaleRecord, 'id' | 'createdAt'>) => {
    const id = `psale-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const totalAmount = Number(newSale.totalAmount) || 0;
    const discount = Number(newSale.discount) || 0;
    const netAmount = Math.max(0, totalAmount - discount);
    const amountPaid = Number(newSale.amountPaid) || 0;
    const outstandingAmount = Math.max(0, netAmount - amountPaid);
    const paymentStatus: PoultrySaleRecord['paymentStatus'] =
      outstandingAmount === 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'outstanding';

    const saleRecord: PoultrySaleRecord = {
      ...newSale,
      id,
      createdAt,
      totalAmount,
      discount,
      netAmount,
      amountPaid,
      outstandingAmount,
      paymentStatus,
      organizationId: currentOrgId,
    };

    // If live birds or dressed birds sold, deduct from flock by creating flock movement
    if ((newSale.productType === 'live_birds' || newSale.productType === 'dressed_birds') && newSale.flockId) {
      await addFlockMovement({
        farmId: newSale.farmId || farms[0]?.id || 'farm-001',
        flockId: newSale.flockId,
        date: newSale.date,
        type: 'sale',
        quantity: newSale.quantity,
        referenceId: id,
        performedBy: 'Sales Officer',
        notes: `Poultry sale invoice ${newSale.invoiceNumber} to ${newSale.buyerName}`,
      });
    }

    if (!isDemoMode && organization?.id) {
      await addPoultrySaleToFirestore(saleRecord, organization.id);
    } else {
      setPoultrySales((prev) => [saleRecord, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Poultry Sale Recorded',
      message: `Invoice ${newSale.invoiceNumber} (₦${netAmount.toLocaleString()}) saved. Cash: ₦${amountPaid.toLocaleString()}.`,
    });
    closeModal();
  };

  const deletePoultrySale = async (id: string) => {
    if (!isDemoMode && organization?.id) {
      await deletePoultrySaleFromFirestore(id, organization.id);
    } else {
      setPoultrySales((prev) => prev.filter((s) => s.id !== id));
    }
    showToast({
      type: 'info',
      title: 'Poultry Sale Removed',
      message: 'Poultry sales record deleted.',
    });
  };

  const resetDemoData = () => {
    setIsDemoMode(true);
    setFarms(demoFarms);
    setFields(demoFields);
    setCrops(demoCrops);
    setSeasons(demoSeasons);
    setExpenses(demoExpenses);
    setHarvests(demoHarvests);
    setSales(demoSales);
    setInventory(demoInventory);
    setSuppliers(demoSuppliers);
    setPurchases(demoPurchases);
    setStockMovements(demoStockMovements);
    setReceipts(demoReceipts);
    setCustomers(demoCustomers);
    setSalePayments(demoSalePayments);
    setProduceAdjustments(demoProduceAdjustments);
    setTasks(demoTasks);
    setTeam(demoTeam);
    setSettings(defaultSettings);
    // Poultry Demo Data
    setFlocks(demoFlocks);
    setFlockMovements(demoFlockMovements);
    setPoultryHouses(demoPoultryHouses);
    setFeedInventory(demoFeedInventory);
    setFeedConsumption(demoFeedConsumption);
    setFlockHealthRecords(demoFlockHealthRecords);
    setEggProductionRecords(demoEggProductionRecords);
    setPoultrySales(demoPoultrySales);
    showToast({
      type: 'info',
      title: 'Demo Data Loaded',
      message: 'Viewing demonstration dataset for Oyo Commercial Estate & Sunbird Poultry.',
    });
  };

  const clearToEmptyData = () => {
    setIsDemoMode(false);
    if (!organization?.id) {
      setFarms([]);
      setFields([]);
      setCrops([]);
      setSeasons([]);
      setExpenses([]);
      setHarvests([]);
      setSales([]);
      setInventory([]);
      setSuppliers([]);
      setPurchases([]);
      setStockMovements([]);
      setReceipts([]);
      setCustomers([]);
      setSalePayments([]);
      setProduceAdjustments([]);
      setTasks([]);
      setTeam([]);
      setFlocks([]);
      setFlockMovements([]);
      setPoultryHouses([]);
      setFeedInventory([]);
      setFeedConsumption([]);
      setFlockHealthRecords([]);
      setEggProductionRecords([]);
      setPoultrySales([]);
    }
    showToast({
      type: 'warning',
      title: 'Switched to Live Farm Data',
      message: 'Viewing live Cloud Firestore database state.',
    });
  };

  const openModal = (modal: ModalType) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  return (
    <FarmContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeSection,
        setActiveSection,
        activeModal,
        openModal,
        closeModal,
        activeReceipt,
        setActiveReceipt,
        activeExpenseToEdit,
        setActiveExpenseToEdit,
        activeInvoiceToView,
        setActiveInvoiceToView,
        activeCustomerToView,
        setActiveCustomerToView,
        activeCustomerToEdit,
        setActiveCustomerToEdit,
        activeSaleForPayment,
        setActiveSaleForPayment,

        // Commercial Subscription & Paystack
        currentPlan,
        planLimits,
        billingTransactions,
        activeSubscriptionReceipt,
        selectedPlanForCheckout,
        upgradeModalLimitFeature,
        openUpgradeModal,
        openPaystackCheckout,
        openSubscriptionReceipt,
        upgradeSubscription,
        checkPlanLimit,

        // Team RBAC & Permissions
        activeSimulatedRole,
        setActiveSimulatedRole,
        hasPermission,
        activeMemberForEdit,
        openEditTeamMember,
        updateTeamMemberPermissions,
        deleteTeamMember,
        isRoleMatrixOpen,
        setIsRoleMatrixOpen,

        firebaseUser,
        userProfile,
        organization,
        isAuthLoading,
        isDataLoading,
        dbError,
        isDemoMode,
        setIsDemoMode,
        selectedFarmId,
        setSelectedFarmId,
        selectedFarm,
        farms,
        fields,
        crops,
        seasons,
        expenses,
        harvests,
        sales,
        inventory,
        suppliers,
        purchases,
        stockMovements,
        receipts,
        customers,
        salePayments,
        produceAdjustments,
        produceStockSummaries,
        tasks,
        team,
        settings,
        // Poultry Data
        flocks,
        flockMovements,
        poultryHouses,
        feedInventory,
        feedConsumption,
        flockHealthRecords,
        eggProductionRecords,
        poultrySales,
        flockProfitability,
        financialSummary,
        cropProfitability,
        fieldProfitability,
        // Poultry Mutators
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
        addExpense,
        updateExpense,
        deleteExpense,
        addCrop,
        updateCrop,
        updateCropStage,
        deleteCrop,
        addHarvest,
        deleteHarvest,
        addSale,
        recordSalePayment,
        deleteSale,
        addField,
        updateField,
        deleteField,
        addFarm,
        updateFarm,
        deleteFarm,
        addSeason,
        updateSeason,
        deleteSeason,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addPurchase,
        updatePurchase,
        deletePurchase,
        addStockMovement,
        deleteStockMovement,
        addReceipt,
        updateReceipt,
        deleteReceipt,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSalePayment,
        deleteSalePayment,
        addProduceAdjustment,
        deleteProduceAdjustment,
        addTask,
        updateTask,
        toggleTaskStatus,
        deleteTask,
        addTeamMember,
        updateSettings,
        signUp,
        signIn,
        signInWithGoogle,
        sendPasswordReset,
        resendVerification,
        logout,
        resetDemoData,
        clearToEmptyData,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
