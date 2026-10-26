import { Crop, Expense, Field, HarvestRecord, ProduceAdjustment, QuantityUnit, SaleRecord } from '../types/farm';

/**
 * Normalizes harvest/sales units to kilograms (kg) for accurate yield and inventory tracking.
 */
export function normalizeToKg(quantity: number, unit: QuantityUnit): number {
  switch (unit) {
    case 'metric_tons':
      return quantity * 1000;
    case 'bags_50kg':
      return quantity * 50;
    case 'crates_25kg':
      return quantity * 25;
    case 'tubers':
      return quantity * 3; // average yam/cassava tuber weight approx 3kg
    case 'kg':
    default:
      return quantity;
  }
}

/**
 * Formats Nigerian Naira (NGN) amounts cleanly with thousand separators.
 */
export function formatNaira(amount: number, includeDecimal = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₦0';
  const rounded = includeDecimal ? amount.toFixed(2) : Math.round(amount).toString();
  const parts = rounded.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `₦${parts.join('.')}`;
}

/**
 * Formats weight and quantities cleanly.
 */
export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} MT`;
  }
  return `${Math.round(kg).toLocaleString('en-US')} kg`;
}

export interface FinancialSummary {
  // Recognized sales revenue (total invoice values for products sold)
  totalSalesRevenue: number;
  // Actual cash received from customers (cash flow realized)
  totalCashReceived: number;
  // Outstanding receivables (money owed by buyers)
  outstandingCustomerPayments: number;
  // Cash realization rate %
  cashRealizationRate: number;
  // Total operating expenses recognized
  totalOperatingExpenses: number;
  // Direct variable input costs (seeds, fertilizer, chemicals, fuel, labor, haulage)
  directInputCosts: number;
  // Fixed / indirect overhead costs (land lease, utilities, general overhead)
  overheadCosts: number;
  // Gross Profit = Recognized Revenue - Direct Input Costs
  grossProfit: number;
  // Gross Margin %
  grossMarginPercent: number;
  // Net Operating Result = Recognized Revenue - Operating Expenses (EBITDA)
  netOperatingResult: number;
  // Operating Profit Margin %
  operatingMarginPercent: number;
  // Cost-to-Income Ratio (CIR %)
  costToIncomeRatio: number;
  // Return on Investment (ROI %)
  returnOnInvestment: number;
  // Cash Operating Surplus (Cash Received - Total Operating Expenses)
  cashOperatingSurplus: number;
  // Total harvest quantity normalized in kg
  totalHarvestedKg: number;
  // Total sold quantity normalized in kg
  totalSoldKg: number;
  // Unsold produce inventory in kg (retained stock, not counted as revenue)
  unsoldInventoryKg: number;
  // Unsold stock inventory estimated market value (at recent unit prices)
  estimatedUnsoldValue: number;
  // Average realized selling price per kg
  averageSellingPricePerKg: number;
  // Average production cost per kg
  averageCostPerKg: number;
  // Breakeven price per kg
  breakevenPricePerKg: number;
  // Safety Margin % ((Selling Price - Breakeven Price) / Selling Price)
  safetyMarginPercent: number;
}

/**
 * Calculates strictly separated financial results without double-counting.
 */
export function calculateFinancialSummary(
  expenses: Expense[],
  harvests: HarvestRecord[],
  sales: SaleRecord[]
): FinancialSummary {
  // 1. Total recognized sales revenue
  const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  // 2. Cash collected vs. receivables
  const totalCashReceived = sales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
  const outstandingCustomerPayments = sales.reduce((sum, s) => sum + (s.outstandingAmount || 0), 0);
  const cashRealizationRate = totalSalesRevenue > 0 ? (totalCashReceived / totalSalesRevenue) * 100 : 0;

  // 3. Operating Expenses categorization
  const directInputCategories = [
    'seeds_seedlings',
    'fertilizer_chemicals',
    'mechanization_fuel',
    'labor',
    'logistics_packaging',
  ];

  const directInputCosts = expenses
    .filter((e) => directInputCategories.includes(e.category))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const overheadCosts = expenses
    .filter((e) => !directInputCategories.includes(e.category))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // 4. Gross Profit & Net Operating Result
  const grossProfit = totalSalesRevenue - directInputCosts;
  const grossMarginPercent = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;

  const netOperatingResult = totalSalesRevenue - totalOperatingExpenses;
  const operatingMarginPercent =
    totalSalesRevenue > 0 ? (netOperatingResult / totalSalesRevenue) * 100 : 0;

  const costToIncomeRatio =
    totalSalesRevenue > 0 ? (totalOperatingExpenses / totalSalesRevenue) * 100 : 0;

  const returnOnInvestment =
    totalOperatingExpenses > 0 ? (netOperatingResult / totalOperatingExpenses) * 100 : 0;

  const cashOperatingSurplus = totalCashReceived - totalOperatingExpenses;

  // 5. Harvest & Inventory quantities
  const totalHarvestedKg = harvests.reduce(
    (sum, h) => sum + (h.normalizedKg || normalizeToKg(h.quantity, h.unit)),
    0
  );
  const totalSoldKg = sales.reduce(
    (sum, s) => sum + (s.normalizedKg || normalizeToKg(s.quantitySold, s.unit)),
    0
  );

  // Retained unsold stock (cannot be negative)
  const unsoldInventoryKg = Math.max(0, totalHarvestedKg - totalSoldKg);

  // Weighted average sale price per kg to value unsold stock conservatively
  const averageSellingPricePerKg = totalSoldKg > 0 ? totalSalesRevenue / totalSoldKg : 350;
  const estimatedUnsoldValue = unsoldInventoryKg * averageSellingPricePerKg;

  // Average cost per kg produced
  const averageCostPerKg = totalHarvestedKg > 0 ? totalOperatingExpenses / totalHarvestedKg : 0;

  // Breakeven price per kg produced
  const breakevenPricePerKg = totalHarvestedKg > 0 ? totalOperatingExpenses / totalHarvestedKg : 0;
  const safetyMarginPercent =
    averageSellingPricePerKg > 0
      ? ((averageSellingPricePerKg - breakevenPricePerKg) / averageSellingPricePerKg) * 100
      : 0;

  return {
    totalSalesRevenue,
    totalCashReceived,
    outstandingCustomerPayments,
    cashRealizationRate,
    totalOperatingExpenses,
    directInputCosts,
    overheadCosts,
    grossProfit,
    grossMarginPercent,
    netOperatingResult,
    operatingMarginPercent,
    costToIncomeRatio,
    returnOnInvestment,
    cashOperatingSurplus,
    totalHarvestedKg,
    totalSoldKg,
    unsoldInventoryKg,
    estimatedUnsoldValue,
    averageSellingPricePerKg,
    averageCostPerKg,
    breakevenPricePerKg,
    safetyMarginPercent,
  };
}

/**
 * Calculates flock-level poultry profitability without double-counting feed or chick acquisition.
 */
export function calculateFlockProfitability(
  flocks: import('../types/farm').Flock[],
  movements: import('../types/farm').FlockMovement[],
  feedConsumption: import('../types/farm').FeedConsumptionRecord[],
  healthRecords: import('../types/farm').FlockHealthRecord[],
  poultrySales: import('../types/farm').PoultrySaleRecord[],
  expenses: import('../types/farm').Expense[],
  eggRecords: import('../types/farm').EggProductionRecord[],
  houses: import('../types/farm').PoultryHouse[]
): import('../types/farm').FlockProfitabilitySummary[] {
  return flocks.map((flock) => {
    // 1. Calculate live bird count from movements to prevent overwrite
    const flockMovements = movements.filter((m) => m.flockId === flock.id);
    const additions = flockMovements.filter((m) => m.type === 'addition').reduce((s, m) => s + m.quantity, 0);
    const mortalities = flockMovements.filter((m) => m.type === 'mortality').reduce((s, m) => s + m.quantity, 0);
    const culls = flockMovements.filter((m) => m.type === 'cull').reduce((s, m) => s + m.quantity, 0);
    const salesMovements = flockMovements.filter((m) => m.type === 'sale').reduce((s, m) => s + m.quantity, 0);
    const transfersOut = flockMovements.filter((m) => m.type === 'transfer' && m.quantity > 0).reduce((s, m) => s + m.quantity, 0);

    const initialBirds = flock.initialBirdCount || 0;
    const computedCurrentBirds = Math.max(
      0,
      initialBirds + additions - mortalities - culls - salesMovements - transfersOut
    );

    const totalMortality = mortalities;
    const mortalityRatePercent = initialBirds > 0 ? (totalMortality / initialBirds) * 100 : 0;

    // 2. Sales revenue recognized for this flock
    const flockSales = poultrySales.filter((s) => s.flockId === flock.id);
    const totalSalesRevenue = flockSales.reduce((s, sale) => s + (sale.netAmount || sale.totalAmount || 0), 0);

    // Birds sold calculation
    const birdSales = flockSales.filter((s) => s.productType === 'live_birds' || s.productType === 'dressed_birds');
    const totalBirdsSold = birdSales.reduce((s, sale) => s + sale.quantity, 0);
    const totalBirdSalesRevenue = birdSales.reduce((s, sale) => s + (sale.netAmount || sale.totalAmount || 0), 0);
    const revenuePerBirdSold = totalBirdsSold > 0 ? Math.round(totalBirdSalesRevenue / totalBirdsSold) : 0;

    // 3. Operating Costs (Traceable & without double-counting)
    const chickAcquisitionCost = flock.totalAcquisitionCost || initialBirds * (flock.unitPurchasePrice || 0);

    // Feed costs from actual consumption logged against this flock
    const flockFeed = feedConsumption.filter((f) => f.flockId === flock.id);
    const feedConsumedKg = flockFeed.reduce((s, f) => s + (f.quantityKg || 0), 0);
    const feedConsumedCost = flockFeed.reduce((s, f) => s + (f.calculatedCost || 0), 0);

    // Veterinary & medication costs from health logs or expenses tagged to this flock
    const flockHealth = healthRecords.filter((h) => h.flockId === flock.id);
    const healthLoggedCost = flockHealth.reduce((s, h) => s + (h.cost || 0), 0);

    // Additional operating expenses explicitly linked to this flock (excluding feed & chick purchases to prevent double-counting)
    const directFlockExpenses = expenses.filter(
      (e) =>
        e.flockId === flock.id &&
        e.category !== 'poultry_feed' &&
        e.category !== 'day_old_chicks' &&
        e.category !== 'veterinary_vaccines' &&
        e.category !== 'poultry_medication'
    );
    const otherOperatingExpenses = directFlockExpenses.reduce((s, e) => s + e.amount, 0);

    const vetMedicationCost = healthLoggedCost;
    const totalOperatingCosts =
      chickAcquisitionCost + feedConsumedCost + vetMedicationCost + otherOperatingExpenses;

    const grossMarginNgn = totalSalesRevenue - (chickAcquisitionCost + feedConsumedCost);
    const netOperatingResultNgn = totalSalesRevenue - totalOperatingCosts;
    const netMarginPercent = totalSalesRevenue > 0 ? (netOperatingResultNgn / totalSalesRevenue) * 100 : 0;

    const feedCostPerBird = initialBirds > 0 ? Math.round(feedConsumedCost / initialBirds) : 0;

    // 4. Egg Production (for layers)
    const flockEggRecords = eggRecords.filter((e) => e.flockId === flock.id);
    const totalEggsCollected = flockEggRecords.reduce((s, e) => s + e.totalEggsCollected, 0);
    const layingRateAveragePercent =
      flockEggRecords.length > 0
        ? flockEggRecords.reduce((s, e) => s + (e.layingRatePercent || 0), 0) / flockEggRecords.length
        : undefined;
    const costPerEggNgn =
      totalEggsCollected > 0 ? Math.round((totalOperatingCosts / totalEggsCollected) * 100) / 100 : undefined;

    // Housing name lookup
    const house = houses.find((h) => h.id === flock.houseId);

    return {
      flockId: flock.id,
      flockName: flock.name,
      poultryType: flock.poultryType,
      breed: flock.breed,
      houseName: house?.name,
      initialBirds,
      currentBirds: computedCurrentBirds,
      totalMortality,
      mortalityRatePercent: Math.round(mortalityRatePercent * 10) / 10,
      totalSalesRevenue,
      chickAcquisitionCost,
      feedConsumedCost,
      feedConsumedKg,
      vetMedicationCost,
      otherOperatingExpenses,
      totalOperatingCosts,
      grossMarginNgn,
      netOperatingResultNgn,
      netMarginPercent: Math.round(netMarginPercent * 10) / 10,
      feedCostPerBird,
      revenuePerBirdSold,
      totalEggsCollected: totalEggsCollected > 0 ? totalEggsCollected : undefined,
      layingRateAveragePercent:
        layingRateAveragePercent !== undefined ? Math.round(layingRateAveragePercent * 10) / 10 : undefined,
      costPerEggNgn,
    };
  });
}


export interface CropProfitMetric {
  cropId: string;
  cropName: string;
  variety: string;
  category: string;
  cultivatedAreaHa: number;
  recognizedRevenue: number;
  cashCollected: number;
  outstandingRevenue: number;
  directExpenses: number;
  grossProfit: number;
  grossMarginPercent: number;
  netOperatingProfit: number;
  operatingMarginPercent: number;
  harvestedKg: number;
  targetYieldKg: number;
  yieldKgPerHa: number;
  yieldMTPerHa: number;
  yieldAchievementPercent: number;
  soldKg: number;
  retainedStockKg: number;
  costPerKgProduced: number;
  averageSellingPricePerKg: number;
  breakevenPricePerKg: number;
  breakevenYieldKgPerHa: number;
  revenuePerHectare: number;
  profitPerHectare: number;
  costBreakdown: {
    seeds: number;
    fertilizerChemicals: number;
    mechanization: number;
    labor: number;
    logistics: number;
    other: number;
  };
}

export function calculateCropProfitability(
  crops: (Crop | { id: string; name: string; variety: string; category: string; fieldId?: string; targetYieldKg?: number })[],
  expenses: Expense[],
  harvests: HarvestRecord[],
  sales: SaleRecord[],
  fields: Field[] = []
): CropProfitMetric[] {
  return crops.map((crop) => {
    // 1. Linked Field & Cultivated Area
    const linkedField = fields.find((f) => f.id === crop.fieldId || f.currentCropId === crop.id);
    const cultivatedAreaHa = linkedField
      ? linkedField.unit === 'acres'
        ? linkedField.size / 2.47105
        : linkedField.size
      : 5; // fallback baseline 5ha

    // 2. Sales generated strictly by this crop
    const cropSales = sales.filter((s) => s.cropId === crop.id);
    const recognizedRevenue = cropSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const cashCollected = cropSales.reduce((sum, s) => sum + s.amountPaid, 0);
    const outstandingRevenue = cropSales.reduce((sum, s) => sum + s.outstandingAmount, 0);
    const soldKg = cropSales.reduce(
      (sum, s) => sum + (s.normalizedKg || normalizeToKg(s.quantitySold, s.unit)),
      0
    );

    const averageSellingPricePerKg = soldKg > 0 ? recognizedRevenue / soldKg : 0;

    // 3. Expenses directly tied to this crop
    const cropExpenses = expenses.filter((e) => e.cropId === crop.id);
    const directExpenses = cropExpenses.reduce((sum, e) => sum + e.amount, 0);

    const costBreakdown = {
      seeds: cropExpenses.filter((e) => e.category === 'seeds_seedlings').reduce((s, e) => s + e.amount, 0),
      fertilizerChemicals: cropExpenses.filter((e) => e.category === 'fertilizer_chemicals').reduce((s, e) => s + e.amount, 0),
      mechanization: cropExpenses.filter((e) => e.category === 'mechanization_fuel').reduce((s, e) => s + e.amount, 0),
      labor: cropExpenses.filter((e) => e.category === 'labor').reduce((s, e) => s + e.amount, 0),
      logistics: cropExpenses.filter((e) => e.category === 'logistics_packaging').reduce((s, e) => s + e.amount, 0),
      other: cropExpenses.filter((e) => e.category === 'lease_utilities' || e.category === 'other').reduce((s, e) => s + e.amount, 0),
    };

    // 4. Margins
    const grossProfit = recognizedRevenue - directExpenses;
    const grossMarginPercent =
      recognizedRevenue > 0
        ? (grossProfit / recognizedRevenue) * 100
        : directExpenses > 0
        ? -100
        : 0;

    const netOperatingProfit = grossProfit;
    const operatingMarginPercent = grossMarginPercent;

    // 5. Harvests & Yield
    const cropHarvests = harvests.filter((h) => h.cropId === crop.id);
    const harvestedKg = cropHarvests.reduce(
      (sum, h) => sum + (h.normalizedKg || normalizeToKg(h.quantity, h.unit)),
      0
    );
    const retainedStockKg = Math.max(0, harvestedKg - soldKg);

    const targetYieldKg = crop.targetYieldKg || 10000;
    const yieldAchievementPercent = targetYieldKg > 0 ? (harvestedKg / targetYieldKg) * 100 : 0;

    const yieldKgPerHa = cultivatedAreaHa > 0 ? harvestedKg / cultivatedAreaHa : 0;
    const yieldMTPerHa = yieldKgPerHa / 1000;

    const costPerKgProduced = harvestedKg > 0 ? directExpenses / harvestedKg : 0;
    const breakevenPricePerKg = harvestedKg > 0 ? directExpenses / harvestedKg : 0;

    const breakevenYieldKgPerHa =
      averageSellingPricePerKg > 0 && cultivatedAreaHa > 0
        ? directExpenses / averageSellingPricePerKg / cultivatedAreaHa
        : 0;

    const revenuePerHectare = cultivatedAreaHa > 0 ? recognizedRevenue / cultivatedAreaHa : 0;
    const profitPerHectare = cultivatedAreaHa > 0 ? grossProfit / cultivatedAreaHa : 0;

    return {
      cropId: crop.id,
      cropName: crop.name,
      variety: crop.variety,
      category: crop.category,
      cultivatedAreaHa,
      recognizedRevenue,
      cashCollected,
      outstandingRevenue,
      directExpenses,
      grossProfit,
      grossMarginPercent,
      netOperatingProfit,
      operatingMarginPercent,
      harvestedKg,
      targetYieldKg,
      yieldKgPerHa,
      yieldMTPerHa,
      yieldAchievementPercent,
      soldKg,
      retainedStockKg,
      costPerKgProduced,
      averageSellingPricePerKg,
      breakevenPricePerKg,
      breakevenYieldKgPerHa,
      revenuePerHectare,
      profitPerHectare,
      costBreakdown,
    };
  });
}

export interface FieldProfitMetric {
  fieldId: string;
  fieldName: string;
  fieldCode: string;
  sizeHa: number;
  cropsGrown: string[];
  totalRevenue: number;
  totalCost: number;
  netOperatingProfit: number;
  marginPercent: number;
  totalHarvestKg: number;
  yieldKgPerHa: number;
  profitPerHectare: number;
}

export function calculateFieldProfitability(
  fields: Field[],
  crops: Crop[],
  expenses: Expense[],
  harvests: HarvestRecord[],
  sales: SaleRecord[]
): FieldProfitMetric[] {
  return fields.map((field) => {
    const sizeHa = field.unit === 'acres' ? field.size / 2.47105 : field.size;
    const fieldCrops = crops.filter((c) => c.fieldId === field.id);
    const fieldCropIds = fieldCrops.map((c) => c.id);

    // Sales for crops grown in this field
    const fieldSales = sales.filter((s) => fieldCropIds.includes(s.cropId));
    const totalRevenue = fieldSales.reduce((sum, s) => sum + s.totalAmount, 0);

    // Expenses tied to this field or crops on this field
    const fieldExpenses = expenses.filter(
      (e) => e.fieldId === field.id || (e.cropId && fieldCropIds.includes(e.cropId))
    );
    const totalCost = fieldExpenses.reduce((sum, e) => sum + e.amount, 0);

    const netOperatingProfit = totalRevenue - totalCost;
    const marginPercent = totalRevenue > 0 ? (netOperatingProfit / totalRevenue) * 100 : totalCost > 0 ? -100 : 0;

    // Harvests from this field
    const fieldHarvests = harvests.filter(
      (h) => h.fieldId === field.id || fieldCropIds.includes(h.cropId)
    );
    const totalHarvestKg = fieldHarvests.reduce(
      (sum, h) => sum + (h.normalizedKg || normalizeToKg(h.quantity, h.unit)),
      0
    );

    const yieldKgPerHa = sizeHa > 0 ? totalHarvestKg / sizeHa : 0;
    const profitPerHectare = sizeHa > 0 ? netOperatingProfit / sizeHa : 0;

    return {
      fieldId: field.id,
      fieldName: field.name,
      fieldCode: field.code,
      sizeHa,
      cropsGrown: fieldCrops.map((c) => `${c.name} (${c.variety})`),
      totalRevenue,
      totalCost,
      netOperatingProfit,
      marginPercent,
      totalHarvestKg,
      yieldKgPerHa,
      profitPerHectare,
    };
  });
}

/**
 * Scenario Simulation: Interactive What-If sensitivity calculator
 */
export interface ScenarioSimulationResult {
  priceChangePct: number;
  yieldChangePct: number;
  costChangePct: number;
  projectedRevenue: number;
  projectedCosts: number;
  projectedNetProfit: number;
  projectedMarginPercent: number;
  projectedROI: number;
  deltaProfit: number;
}

export function simulateProfitScenario(
  current: FinancialSummary,
  priceChangePct: number,
  yieldChangePct: number,
  costChangePct: number
): ScenarioSimulationResult {
  // Price and yield impact recognized revenue
  const priceMultiplier = 1 + priceChangePct / 100;
  const yieldMultiplier = 1 + yieldChangePct / 100;
  const costMultiplier = 1 + costChangePct / 100;

  const projectedRevenue = current.totalSalesRevenue * priceMultiplier * yieldMultiplier;
  const projectedCosts = current.totalOperatingExpenses * costMultiplier;
  const projectedNetProfit = projectedRevenue - projectedCosts;
  const projectedMarginPercent =
    projectedRevenue > 0 ? (projectedNetProfit / projectedRevenue) * 100 : 0;
  const projectedROI =
    projectedCosts > 0 ? (projectedNetProfit / projectedCosts) * 100 : 0;
  const deltaProfit = projectedNetProfit - current.netOperatingResult;

  return {
    priceChangePct,
    yieldChangePct,
    costChangePct,
    projectedRevenue,
    projectedCosts,
    projectedNetProfit,
    projectedMarginPercent,
    projectedROI,
    deltaProfit,
  };
}
