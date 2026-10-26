import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  BillingTransaction,
  Crop,
  CropSeason,
  Customer,
  EggProductionRecord,
  Expense,
  Farm,
  FarmTask,
  FeedConsumptionRecord,
  FeedInventoryItem,
  Field,
  Flock,
  FlockHealthRecord,
  FlockMovement,
  HarvestRecord,
  InventoryItem,
  Organization,
  PoultryHouse,
  PoultrySaleRecord,
  ProduceAdjustment,
  PurchaseRecord,
  ReceiptRecord,
  SalePayment,
  SaleRecord,
  StockMovement,
  SubscriptionInfo,
  Supplier,
  TeamMember,
  UserProfile,
} from '../types/farm';

// Users Collection
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    await setDoc(doc(db, 'users', profile.id), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Organizations Collection
export async function fetchOrganization(orgId: string): Promise<Organization | null> {
  const path = `organizations/${orgId}`;
  try {
    const snap = await getDoc(doc(db, 'organizations', orgId));
    if (snap.exists()) {
      return snap.data() as Organization;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveOrganization(org: Organization): Promise<void> {
  const path = `organizations/${org.id}`;
  try {
    await setDoc(doc(db, 'organizations', org.id), org);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Farms
export function subscribeToFarms(
  orgId: string,
  onData: (farms: Farm[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/farms`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'farms'),
    (snapshot) => {
      const items: Farm[] = [];
      snapshot.forEach((d) => items.push(d.data() as Farm));
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addFarmToFirestore(orgId: string, farm: Farm): Promise<void> {
  const path = `organizations/${orgId}/farms/${farm.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'farms', farm.id), {
      ...farm,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteFarmFromFirestore(orgId: string, farmId: string): Promise<void> {
  const path = `organizations/${orgId}/farms/${farmId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'farms', farmId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateFarmInFirestore(
  orgId: string,
  farmId: string,
  updates: Partial<Farm>
): Promise<void> {
  const path = `organizations/${orgId}/farms/${farmId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'farms', farmId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Fields
export function subscribeToFields(
  orgId: string,
  onData: (fields: Field[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/fields`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'fields'),
    (snapshot) => {
      const items: Field[] = [];
      snapshot.forEach((d) => items.push(d.data() as Field));
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addFieldToFirestore(orgId: string, field: Field): Promise<void> {
  const path = `organizations/${orgId}/fields/${field.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'fields', field.id), {
      ...field,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateFieldInFirestore(
  orgId: string,
  fieldId: string,
  updates: Partial<Field>
): Promise<void> {
  const path = `organizations/${orgId}/fields/${fieldId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'fields', fieldId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFieldFromFirestore(orgId: string, fieldId: string): Promise<void> {
  const path = `organizations/${orgId}/fields/${fieldId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'fields', fieldId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Crops
export function subscribeToCrops(
  orgId: string,
  onData: (crops: Crop[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/crops`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'crops'),
    (snapshot) => {
      const items: Crop[] = [];
      snapshot.forEach((d) => items.push(d.data() as Crop));
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addCropToFirestore(orgId: string, crop: Crop): Promise<void> {
  const path = `organizations/${orgId}/crops/${crop.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'crops', crop.id), {
      ...crop,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCropStageInFirestore(
  orgId: string,
  cropId: string,
  stage: Crop['stage']
): Promise<void> {
  const path = `organizations/${orgId}/crops/${cropId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'crops', cropId), { stage });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateCropInFirestore(
  orgId: string,
  cropId: string,
  updates: Partial<Crop>
): Promise<void> {
  const path = `organizations/${orgId}/crops/${cropId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'crops', cropId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCropFromFirestore(orgId: string, cropId: string): Promise<void> {
  const path = `organizations/${orgId}/crops/${cropId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'crops', cropId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Expenses
export function subscribeToExpenses(
  orgId: string,
  onData: (expenses: Expense[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/expenses`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'expenses'),
    (snapshot) => {
      const items: Expense[] = [];
      snapshot.forEach((d) => items.push(d.data() as Expense));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addExpenseToFirestore(orgId: string, expense: Expense): Promise<void> {
  const path = `organizations/${orgId}/expenses/${expense.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'expenses', expense.id), {
      ...expense,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateExpenseInFirestore(
  orgId: string,
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> {
  const path = `organizations/${orgId}/expenses/${expenseId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'expenses', expenseId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteExpenseFromFirestore(
  orgId: string,
  expenseId: string
): Promise<void> {
  const path = `organizations/${orgId}/expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'expenses', expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Harvests
export function subscribeToHarvests(
  orgId: string,
  onData: (harvests: HarvestRecord[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/harvests`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'harvests'),
    (snapshot) => {
      const items: HarvestRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as HarvestRecord));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addHarvestToFirestore(
  orgId: string,
  harvest: HarvestRecord
): Promise<void> {
  const path = `organizations/${orgId}/harvests/${harvest.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'harvests', harvest.id), {
      ...harvest,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteHarvestFromFirestore(
  orgId: string,
  harvestId: string
): Promise<void> {
  const path = `organizations/${orgId}/harvests/${harvestId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'harvests', harvestId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sales
export function subscribeToSales(
  orgId: string,
  onData: (sales: SaleRecord[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/sales`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'sales'),
    (snapshot) => {
      const items: SaleRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as SaleRecord));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addSaleToFirestore(orgId: string, sale: SaleRecord): Promise<void> {
  const path = `organizations/${orgId}/sales/${sale.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'sales', sale.id), {
      ...sale,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function recordSalePaymentInFirestore(
  orgId: string,
  saleId: string,
  additionalAmount: number,
  existingSale: SaleRecord
): Promise<void> {
  const path = `organizations/${orgId}/sales/${saleId}`;
  try {
    const newPaid = Math.min(existingSale.totalAmount, existingSale.amountPaid + additionalAmount);
    const newOutstanding = Math.max(0, existingSale.totalAmount - newPaid);
    const paymentStatus = newOutstanding === 0 ? 'paid' : 'partial';

    await updateDoc(doc(db, 'organizations', orgId, 'sales', saleId), {
      amountPaid: newPaid,
      outstandingAmount: newOutstanding,
      paymentStatus,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSaleFromFirestore(orgId: string, saleId: string): Promise<void> {
  const path = `organizations/${orgId}/sales/${saleId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'sales', saleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Inventory
export function subscribeToInventory(
  orgId: string,
  onData: (inventory: InventoryItem[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/inventory`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'inventory'),
    (snapshot) => {
      const items: InventoryItem[] = [];
      snapshot.forEach((d) => items.push(d.data() as InventoryItem));
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addInventoryToFirestore(
  orgId: string,
  item: InventoryItem
): Promise<void> {
  const path = `organizations/${orgId}/inventory/${item.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'inventory', item.id), {
      ...item,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateInventoryInFirestore(
  orgId: string,
  itemId: string,
  updates: Partial<InventoryItem>
): Promise<void> {
  const path = `organizations/${orgId}/inventory/${itemId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'inventory', itemId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInventoryFromFirestore(
  orgId: string,
  itemId: string
): Promise<void> {
  const path = `organizations/${orgId}/inventory/${itemId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'inventory', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Tasks
export function subscribeToTasks(
  orgId: string,
  onData: (tasks: FarmTask[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/tasks`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'tasks'),
    (snapshot) => {
      const items: FarmTask[] = [];
      snapshot.forEach((d) => items.push(d.data() as FarmTask));
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addTaskToFirestore(orgId: string, task: FarmTask): Promise<void> {
  const path = `organizations/${orgId}/tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'tasks', task.id), {
      ...task,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTaskStatusInFirestore(
  orgId: string,
  taskId: string,
  newStatus: FarmTask['status']
): Promise<void> {
  const path = `organizations/${orgId}/tasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'tasks', taskId), {
      status: newStatus,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateTaskInFirestore(
  orgId: string,
  taskId: string,
  updates: Partial<FarmTask>
): Promise<void> {
  const path = `organizations/${orgId}/tasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'tasks', taskId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTaskFromFirestore(orgId: string, taskId: string): Promise<void> {
  const path = `organizations/${orgId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Team
export function subscribeToTeam(
  orgId: string,
  onData: (team: TeamMember[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/team`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'team'),
    (snapshot) => {
      const items: TeamMember[] = [];
      snapshot.forEach((d) => items.push(d.data() as TeamMember));
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addTeamMemberToFirestore(
  orgId: string,
  member: TeamMember
): Promise<void> {
  const path = `organizations/${orgId}/team/${member.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'team', member.id), {
      ...member,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Seasons
export function subscribeToSeasons(
  orgId: string,
  onData: (seasons: CropSeason[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/seasons`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'seasons'),
    (snapshot) => {
      const items: CropSeason[] = [];
      snapshot.forEach((d) => items.push(d.data() as CropSeason));
      items.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addSeasonToFirestore(
  orgId: string,
  season: CropSeason
): Promise<void> {
  const path = `organizations/${orgId}/seasons/${season.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'seasons', season.id), {
      ...season,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSeasonInFirestore(
  orgId: string,
  seasonId: string,
  updates: Partial<CropSeason>
): Promise<void> {
  const path = `organizations/${orgId}/seasons/${seasonId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'seasons', seasonId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSeasonFromFirestore(
  orgId: string,
  seasonId: string
): Promise<void> {
  const path = `organizations/${orgId}/seasons/${seasonId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'seasons', seasonId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Suppliers
// ==========================================
export function subscribeToSuppliers(
  orgId: string,
  onData: (suppliers: Supplier[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/suppliers`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'suppliers'),
    (snapshot) => {
      const items: Supplier[] = [];
      snapshot.forEach((d) => items.push(d.data() as Supplier));
      items.sort((a, b) => a.name.localeCompare(b.name));
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addSupplierToFirestore(
  orgId: string,
  supplier: Supplier
): Promise<void> {
  const path = `organizations/${orgId}/suppliers/${supplier.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'suppliers', supplier.id), {
      ...supplier,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSupplierInFirestore(
  orgId: string,
  supplierId: string,
  updates: Partial<Supplier>
): Promise<void> {
  const path = `organizations/${orgId}/suppliers/${supplierId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'suppliers', supplierId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSupplierFromFirestore(
  orgId: string,
  supplierId: string
): Promise<void> {
  const path = `organizations/${orgId}/suppliers/${supplierId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'suppliers', supplierId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Purchases / Invoices
// ==========================================
export function subscribeToPurchases(
  orgId: string,
  onData: (purchases: PurchaseRecord[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/purchases`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'purchases'),
    (snapshot) => {
      const items: PurchaseRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as PurchaseRecord));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addPurchaseToFirestore(
  orgId: string,
  purchase: PurchaseRecord
): Promise<void> {
  const path = `organizations/${orgId}/purchases/${purchase.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'purchases', purchase.id), {
      ...purchase,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updatePurchaseInFirestore(
  orgId: string,
  purchaseId: string,
  updates: Partial<PurchaseRecord>
): Promise<void> {
  const path = `organizations/${orgId}/purchases/${purchaseId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'purchases', purchaseId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePurchaseFromFirestore(
  orgId: string,
  purchaseId: string
): Promise<void> {
  const path = `organizations/${orgId}/purchases/${purchaseId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'purchases', purchaseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Stock Movements
// ==========================================
export function subscribeToStockMovements(
  orgId: string,
  onData: (movements: StockMovement[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/stock_movements`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'stock_movements'),
    (snapshot) => {
      const items: StockMovement[] = [];
      snapshot.forEach((d) => items.push(d.data() as StockMovement));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addStockMovementToFirestore(
  orgId: string,
  movement: StockMovement
): Promise<void> {
  const path = `organizations/${orgId}/stock_movements/${movement.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'stock_movements', movement.id), {
      ...movement,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteStockMovementFromFirestore(
  orgId: string,
  movementId: string
): Promise<void> {
  const path = `organizations/${orgId}/stock_movements/${movementId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'stock_movements', movementId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Receipts
// ==========================================
export function subscribeToReceipts(
  orgId: string,
  onData: (receipts: ReceiptRecord[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/receipts`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'receipts'),
    (snapshot) => {
      const items: ReceiptRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as ReceiptRecord));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addReceiptToFirestore(
  orgId: string,
  receipt: ReceiptRecord
): Promise<void> {
  const path = `organizations/${orgId}/receipts/${receipt.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'receipts', receipt.id), {
      ...receipt,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateReceiptInFirestore(
  orgId: string,
  receiptId: string,
  updates: Partial<ReceiptRecord>
): Promise<void> {
  const path = `organizations/${orgId}/receipts/${receiptId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'receipts', receiptId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReceiptFromFirestore(
  orgId: string,
  receiptId: string
): Promise<void> {
  const path = `organizations/${orgId}/receipts/${receiptId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'receipts', receiptId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Customers / Off-takers
export function subscribeToCustomers(
  orgId: string,
  onData: (customers: Customer[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/customers`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'customers'),
    (snapshot) => {
      const items: Customer[] = [];
      snapshot.forEach((d) => items.push(d.data() as Customer));
      items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addCustomerToFirestore(
  orgId: string,
  customer: Customer
): Promise<void> {
  const path = `organizations/${orgId}/customers/${customer.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'customers', customer.id), {
      ...customer,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCustomerInFirestore(
  orgId: string,
  customerId: string,
  updates: Partial<Customer>
): Promise<void> {
  const path = `organizations/${orgId}/customers/${customerId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'customers', customerId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCustomerFromFirestore(
  orgId: string,
  customerId: string
): Promise<void> {
  const path = `organizations/${orgId}/customers/${customerId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'customers', customerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sale Payments Remittance
export function subscribeToSalePayments(
  orgId: string,
  onData: (payments: SalePayment[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/sale_payments`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'sale_payments'),
    (snapshot) => {
      const items: SalePayment[] = [];
      snapshot.forEach((d) => items.push(d.data() as SalePayment));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addSalePaymentToFirestore(
  orgId: string,
  payment: SalePayment
): Promise<void> {
  const path = `organizations/${orgId}/sale_payments/${payment.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'sale_payments', payment.id), {
      ...payment,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteSalePaymentFromFirestore(
  orgId: string,
  paymentId: string
): Promise<void> {
  const path = `organizations/${orgId}/sale_payments/${paymentId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'sale_payments', paymentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Produce Adjustments (Moisture shrinkage, sorting loss, seed retention)
export function subscribeToProduceAdjustments(
  orgId: string,
  onData: (adjustments: ProduceAdjustment[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/produce_adjustments`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'produce_adjustments'),
    (snapshot) => {
      const items: ProduceAdjustment[] = [];
      snapshot.forEach((d) => items.push(d.data() as ProduceAdjustment));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addProduceAdjustmentToFirestore(
  orgId: string,
  adjustment: ProduceAdjustment
): Promise<void> {
  const path = `organizations/${orgId}/produce_adjustments/${adjustment.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'produce_adjustments', adjustment.id), {
      ...adjustment,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteProduceAdjustmentFromFirestore(
  orgId: string,
  adjustmentId: string
): Promise<void> {
  const path = `organizations/${orgId}/produce_adjustments/${adjustmentId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'produce_adjustments', adjustmentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Team Member Management
// ==========================================
export async function updateTeamMemberInFirestore(
  orgId: string,
  memberId: string,
  updates: Partial<TeamMember>
): Promise<void> {
  const path = `organizations/${orgId}/team/${memberId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'team', memberId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTeamMemberFromFirestore(
  orgId: string,
  memberId: string
): Promise<void> {
  const path = `organizations/${orgId}/team/${memberId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'team', memberId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Commercial Subscription & Paystack Billing
// ==========================================
export async function updateOrganizationSubscription(
  orgId: string,
  subscription: SubscriptionInfo
): Promise<void> {
  const path = `organizations/${orgId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId), {
      subscription,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveBillingTransaction(
  orgId: string,
  transaction: BillingTransaction
): Promise<void> {
  const path = `organizations/${orgId}/billing_transactions/${transaction.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'billing_transactions', transaction.id), {
      ...transaction,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToBillingTransactions(
  orgId: string,
  onData: (transactions: BillingTransaction[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/billing_transactions`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'billing_transactions'),
    (snapshot) => {
      const items: BillingTransaction[] = [];
      snapshot.forEach((d) => items.push(d.data() as BillingTransaction));
      items.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

// ==========================================
// Poultry Management Subcollections
// ==========================================

// 1. Flocks
export function subscribeToFlocks(
  orgId: string,
  onData: (flocks: Flock[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/flocks`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'flocks'),
    (snapshot) => {
      const items: Flock[] = [];
      snapshot.forEach((d) => items.push(d.data() as Flock));
      items.sort((a, b) => new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addFlockToFirestore(flock: Flock, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/flocks/${flock.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'flocks', flock.id), {
      ...flock,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateFlockInFirestore(
  flockId: string,
  updates: Partial<Flock>,
  orgId: string
): Promise<void> {
  const path = `organizations/${orgId}/flocks/${flockId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'flocks', flockId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFlockFromFirestore(flockId: string, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/flocks/${flockId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'flocks', flockId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 2. Flock Movements
export function subscribeToFlockMovements(
  orgId: string,
  onData: (movements: FlockMovement[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/flock_movements`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'flock_movements'),
    (snapshot) => {
      const items: FlockMovement[] = [];
      snapshot.forEach((d) => items.push(d.data() as FlockMovement));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addFlockMovementToFirestore(movement: FlockMovement, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/flock_movements/${movement.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'flock_movements', movement.id), {
      ...movement,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 3. Poultry Houses
export function subscribeToPoultryHouses(
  orgId: string,
  onData: (houses: PoultryHouse[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/poultry_houses`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'poultry_houses'),
    (snapshot) => {
      const items: PoultryHouse[] = [];
      snapshot.forEach((d) => items.push(d.data() as PoultryHouse));
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addPoultryHouseToFirestore(house: PoultryHouse, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/poultry_houses/${house.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'poultry_houses', house.id), {
      ...house,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updatePoultryHouseInFirestore(
  houseId: string,
  updates: Partial<PoultryHouse>,
  orgId: string
): Promise<void> {
  const path = `organizations/${orgId}/poultry_houses/${houseId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'poultry_houses', houseId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePoultryHouseFromFirestore(houseId: string, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/poultry_houses/${houseId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'poultry_houses', houseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 4. Feed Inventory
export function subscribeToFeedInventory(
  orgId: string,
  onData: (feeds: FeedInventoryItem[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/feed_inventory`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'feed_inventory'),
    (snapshot) => {
      const items: FeedInventoryItem[] = [];
      snapshot.forEach((d) => items.push(d.data() as FeedInventoryItem));
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addFeedInventoryToFirestore(item: FeedInventoryItem, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/feed_inventory/${item.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'feed_inventory', item.id), {
      ...item,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateFeedInventoryInFirestore(
  itemId: string,
  updates: Partial<FeedInventoryItem>,
  orgId: string
): Promise<void> {
  const path = `organizations/${orgId}/feed_inventory/${itemId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'feed_inventory', itemId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFeedInventoryFromFirestore(itemId: string, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/feed_inventory/${itemId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'feed_inventory', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 5. Feed Consumption
export function subscribeToFeedConsumption(
  orgId: string,
  onData: (records: FeedConsumptionRecord[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/feed_consumption`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'feed_consumption'),
    (snapshot) => {
      const items: FeedConsumptionRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as FeedConsumptionRecord));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addFeedConsumptionToFirestore(record: FeedConsumptionRecord, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/feed_consumption/${record.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'feed_consumption', record.id), {
      ...record,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 6. Flock Health Records
export function subscribeToFlockHealth(
  orgId: string,
  onData: (records: FlockHealthRecord[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/flock_health`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'flock_health'),
    (snapshot) => {
      const items: FlockHealthRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as FlockHealthRecord));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addFlockHealthToFirestore(record: FlockHealthRecord, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/flock_health/${record.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'flock_health', record.id), {
      ...record,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 7. Egg Production Records
export function subscribeToEggProduction(
  orgId: string,
  onData: (records: EggProductionRecord[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/egg_production`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'egg_production'),
    (snapshot) => {
      const items: EggProductionRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as EggProductionRecord));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addEggProductionToFirestore(record: EggProductionRecord, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/egg_production/${record.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'egg_production', record.id), {
      ...record,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 8. Poultry Sales Records
export function subscribeToPoultrySales(
  orgId: string,
  onData: (sales: PoultrySaleRecord[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `organizations/${orgId}/poultry_sales`;
  return onSnapshot(
    collection(db, 'organizations', orgId, 'poultry_sales'),
    (snapshot) => {
      const items: PoultrySaleRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as PoultrySaleRecord));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addPoultrySaleToFirestore(sale: PoultrySaleRecord, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/poultry_sales/${sale.id}`;
  try {
    await setDoc(doc(db, 'organizations', orgId, 'poultry_sales', sale.id), {
      ...sale,
      organizationId: orgId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deletePoultrySaleFromFirestore(saleId: string, orgId: string): Promise<void> {
  const path = `organizations/${orgId}/poultry_sales/${saleId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'poultry_sales', saleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}



