/**
 * Nigerian Agricultural Land Measurement & Crop Density Utilities
 * Tailored for Nigerian commercial farming, smallholders, and outgrower estates.
 */

export type LandUnitType = 'hectares' | 'acres' | 'plots_50x100' | 'plots_60x120' | 'sqm' | 'sqft';

export interface LandConversionResult {
  hectares: number;
  acres: number;
  squareMeters: number;
  squareFeet: number;
  standardPlots50x100: number; // 50ft x 100ft ≈ 464.5 m² (popular residential & smallholder plot)
  commercialPlots60x120: number; // 60ft x 120ft ≈ 668.9 m² (commercial layout plot)
  traditionalHeaps: number; // 1m x 1m heap mounds = 10,000 heaps/ha
  traditionalRidges: number; // ~0.75m to 1m spaced ridges = ~13,333 linear metres/ha
}

export function convertLandArea(value: number, fromUnit: LandUnitType): LandConversionResult {
  let sqm = 0;

  switch (fromUnit) {
    case 'hectares':
      sqm = value * 10000;
      break;
    case 'acres':
      sqm = value * 4046.8564224;
      break;
    case 'plots_50x100':
      sqm = value * 464.5152;
      break;
    case 'plots_60x120':
      sqm = value * 668.901888;
      break;
    case 'sqft':
      sqm = value * 0.092903;
      break;
    case 'sqm':
    default:
      sqm = value;
      break;
  }

  const hectares = sqm / 10000;
  const acres = sqm / 4046.8564224;
  const standardPlots50x100 = sqm / 464.5152;
  const commercialPlots60x120 = sqm / 668.901888;
  const squareFeet = sqm / 0.092903;
  const traditionalHeaps = hectares * 10000; // 1 heap per m²
  const traditionalRidges = hectares * 13333; // estimated ridge stands

  return {
    hectares: Math.round(hectares * 1000) / 1000,
    acres: Math.round(acres * 1000) / 1000,
    squareMeters: Math.round(sqm * 10) / 10,
    squareFeet: Math.round(squareFeet),
    standardPlots50x100: Math.round(standardPlots50x100 * 10) / 10,
    commercialPlots60x120: Math.round(commercialPlots60x120 * 10) / 10,
    traditionalHeaps: Math.round(traditionalHeaps),
    traditionalRidges: Math.round(traditionalRidges),
  };
}

export interface CropPlantDensity {
  key: string;
  cropName: string;
  category: 'Cereal / Grain' | 'Root & Tuber' | 'Horticulture / Veg' | 'Legume' | 'Cash Crop';
  rowSpacingCm: number;
  intraRowSpacingCm: number;
  seedsPerStand: number;
  plantsPerHectare: number;
  plantsPerAcre: number;
  seedUnit: string;
  seedRequirementPerHa: number;
  recommendedZone: string;
  plantingWindow: string;
  agronomicTip: string;
}

export const NIGERIAN_CROP_DENSITIES: Record<string, CropPlantDensity> = {
  maize: {
    key: 'maize',
    cropName: 'Hybrid Grain Maize (SC 719 / Oba Super 6)',
    category: 'Cereal / Grain',
    rowSpacingCm: 75,
    intraRowSpacingCm: 25,
    seedsPerStand: 1,
    plantsPerHectare: 53333,
    plantsPerAcre: 21584,
    seedUnit: 'kg certified seed',
    seedRequirementPerHa: 20, // 20 kg per ha
    recommendedZone: 'Savannah & Rainforest Transition (Oyo, Kaduna, Niger, Benue)',
    plantingWindow: 'Early Rains: April–May | Late Rains: August',
    agronomicTip: 'Opt for certified hybrid seed treated with fungicides. Avoid planting second-generation grain as seed.',
  },
  cassava: {
    key: 'cassava',
    cropName: 'High-Yield Cassava (TME-419 / TMS 01/1412)',
    category: 'Root & Tuber',
    rowSpacingCm: 100,
    intraRowSpacingCm: 100,
    seedsPerStand: 1,
    plantsPerHectare: 10000,
    plantsPerAcre: 4047,
    seedUnit: 'bundles of 50 stems (1m cuttings)',
    seedRequirementPerHa: 50, // 50 bundles per ha
    recommendedZone: 'Southern Rainforest & Middle Belt (Ogun, Edo, Oyo, Ondo, Benue)',
    plantingWindow: 'April–June (Early Rains) or October (with irrigation/residual moisture)',
    agronomicTip: 'Cut 20–25cm stakes with 4–5 viable nodes. Plant slanting at 45° or flat in heavy soils.',
  },
  tomatoes: {
    key: 'tomatoes',
    cropName: 'Processing Tomatoes (Roma VF / Platinum F1)',
    category: 'Horticulture / Veg',
    rowSpacingCm: 60,
    intraRowSpacingCm: 40,
    seedsPerStand: 1,
    plantsPerHectare: 41666,
    plantsPerAcre: 16862,
    seedUnit: 'grams of hybrid seed',
    seedRequirementPerHa: 350, // 350g/ha
    recommendedZone: 'Irrigated Middle Belt & Northern Zones (Kano, Kaduna, Plateau, Oyo)',
    plantingWindow: 'Dry season (Oct–Feb) under drip irrigation for maximum yield and zero blight.',
    agronomicTip: 'Raise seedlings in 200-cell nursery trays with coco peat for 21–25 days before field transplanting.',
  },
  soybeans: {
    key: 'soybeans',
    cropName: 'Commercial Grain Soybeans (TGX 1448-2E / 1951-3F)',
    category: 'Legume',
    rowSpacingCm: 50,
    intraRowSpacingCm: 10,
    seedsPerStand: 1,
    plantsPerHectare: 200000,
    plantsPerAcre: 80940,
    seedUnit: 'kg certified seed',
    seedRequirementPerHa: 60, // 60 kg/ha
    recommendedZone: 'Southern & Northern Guinea Savannah (Benue, Kaduna, Niger, Plateau)',
    plantingWindow: 'June–July (ensures pod filling matches late rains and harvest matches dry sunny skies).',
    agronomicTip: 'Inoculate seed with Bradyrhizobium inoculant before planting to maximize root nodulation and nitrogen fixation.',
  },
  yam: {
    key: 'yam',
    cropName: 'White Yam / Water Yam (Dioscorea rotundata)',
    category: 'Root & Tuber',
    rowSpacingCm: 100,
    intraRowSpacingCm: 100,
    seedsPerStand: 1,
    plantsPerHectare: 10000,
    plantsPerAcre: 4047,
    seedUnit: 'kg seed setts (~300g per sett)',
    seedRequirementPerHa: 3000, // 3,000 kg setts/ha
    recommendedZone: 'Benue, Nasarawa, Niger, Oyo, Ekiti, Taraba (The Yam Belt)',
    plantingWindow: 'Dry mounds in November–February (pre-rains) or March–April at onset of rains.',
    agronomicTip: 'Dip mini-setts in wood ash or neem extract solution before planting to prevent nematode and fungal rot.',
  },
  rice: {
    key: 'rice',
    cropName: 'Upland & Lowland Paddy Rice (FARO 44 / FARO 52)',
    category: 'Cereal / Grain',
    rowSpacingCm: 20,
    intraRowSpacingCm: 20,
    seedsPerStand: 2,
    plantsPerHectare: 250000,
    plantsPerAcre: 101170,
    seedUnit: 'kg certified paddy seed',
    seedRequirementPerHa: 50, // 50 kg/ha
    recommendedZone: 'Kebbi, Niger, Ebonyi, Kano, Taraba, Nasarawa',
    plantingWindow: 'May–June (Direct seeded) or July (Transplanted in Fadama lowland)',
    agronomicTip: 'Laser level the field to maintain uniform water table and apply basal NPK 15:15:15 at 21 days after emergence.',
  },
  pepper: {
    key: 'pepper',
    cropName: 'Hot Pepper / Scotch Bonnet (Ata Rodo / Habanero)',
    category: 'Horticulture / Veg',
    rowSpacingCm: 50,
    intraRowSpacingCm: 50,
    seedsPerStand: 1,
    plantsPerHectare: 40000,
    plantsPerAcre: 16188,
    seedUnit: 'grams certified seed',
    seedRequirementPerHa: 400, // 400g/ha
    recommendedZone: 'Oyo, Ogun, Osun, Kaduna, Kano',
    plantingWindow: 'All year round with irrigation; nursery start in March or September.',
    agronomicTip: 'Prune first crown flower to stimulate vigorous branching and heavy secondary fruit set.',
  },
  groundnut: {
    key: 'groundnut',
    cropName: 'Groundnut / Peanuts (SAMNUT 24 / SAMNUT 26)',
    category: 'Legume',
    rowSpacingCm: 75,
    intraRowSpacingCm: 20,
    seedsPerStand: 1,
    plantsPerHectare: 66666,
    plantsPerAcre: 26980,
    seedUnit: 'kg shelled pods',
    seedRequirementPerHa: 45, // 45 kg/ha
    recommendedZone: 'Sudan & Sahel Savannah (Kano, Jigawa, Katsina, Bauchi, Gombe)',
    plantingWindow: 'June–July with steady rain establishment.',
    agronomicTip: 'Ensure soil is loose and friable so pegs can penetrate easily without resistance.',
  },
};

export interface SeedingEstimate {
  crop: CropPlantDensity;
  areaHectares: number;
  areaAcres: number;
  totalPlantStands: number;
  rawSeedRequirement: number;
  bufferSeedRequirement: number; // +10% germination/gap-filling safety buffer
  seedUnit: string;
}

export function calculateSeedingNeeds(cropKey: string, areaInHectares: number): SeedingEstimate | null {
  const crop = NIGERIAN_CROP_DENSITIES[cropKey];
  if (!crop || areaInHectares <= 0) return null;

  const areaAcres = areaInHectares * 2.47105;
  const totalPlantStands = Math.round(crop.plantsPerHectare * areaInHectares);
  const rawSeedRequirement = Math.round(crop.seedRequirementPerHa * areaInHectares * 10) / 10;
  const bufferSeedRequirement = Math.round(rawSeedRequirement * 1.1 * 10) / 10;

  return {
    crop,
    areaHectares: Math.round(areaInHectares * 100) / 100,
    areaAcres: Math.round(areaAcres * 100) / 100,
    totalPlantStands,
    rawSeedRequirement,
    bufferSeedRequirement,
    seedUnit: crop.seedUnit,
  };
}
