import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  ExternalLink,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Sparkles,
  Sprout,
  Tag,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { Crop, CropCategory, CropStage } from '../../types/farm';
import { formatWeight } from '../../utils/finance';
import { Modal } from '../common/Modal';

export interface VarietyPreset {
  key: string;
  cropName: string;
  variety: string;
  category: CropCategory;
  maturityDays: number;
  typicalYieldKgPerHa: number;
  supplier: string;
  zones: string;
  features: string;
  spacingNotes: string;
}

export const NIGERIAN_VARIETY_CATALOG: VarietyPreset[] = [
  {
    key: 'maize_sc719',
    cropName: 'Yellow Grain Maize',
    variety: 'SeedCo SC 719 Hybrid',
    category: 'Cereal / Grain',
    maturityDays: 120,
    typicalYieldKgPerHa: 7500,
    supplier: 'Seed Co Nigeria (Kaduna / Ibadan)',
    zones: 'Southern Guinea Savannah, Rainforest Transition (Oyo, Kaduna, Niger, Benue)',
    features: 'High-yielding flint-dent hybrid, outstanding drought tolerance, sturdy lodging resistance.',
    spacingNotes: '75 cm between rows, 25 cm within rows (53,333 stands/ha).',
  },
  {
    key: 'maize_oba_super6',
    cropName: 'Biofortified Yellow Maize',
    variety: 'Oba Super 6 (Pro-Vitamin A)',
    category: 'Cereal / Grain',
    maturityDays: 110,
    typicalYieldKgPerHa: 6800,
    supplier: 'Premier Seeds Nigeria',
    zones: 'Savannah & Rainforest belts (Plateau, Oyo, Kaduna, Osun)',
    features: 'High provitamin A carotene content, excellent for commercial poultry feed and household nutrition.',
    spacingNotes: '75 cm x 25 cm, 1 seed per stand at 4–5 cm depth.',
  },
  {
    key: 'cassava_tme419',
    cropName: 'High-Starch Cassava',
    variety: 'TME-419 Certified Stems',
    category: 'Root & Tuber',
    maturityDays: 360,
    typicalYieldKgPerHa: 28000,
    supplier: 'IITA / National Root Crops Research Institute (Umudike)',
    zones: 'Humid forest & derived savannah (Ogun, Edo, Oyo, Ondo, Benue, Delta)',
    features: 'Upright non-branching architecture, high dry matter (36–38%), ideal for HQCF and industrial starch.',
    spacingNotes: '1 m x 1 m (10,000 stands/ha). Plant 20–25 cm cuttings at 45° slant.',
  },
  {
    key: 'cassava_yellow_root',
    cropName: 'Pro-Vitamin A Cassava',
    variety: 'TMS 07/0593 (Yellow Root)',
    category: 'Root & Tuber',
    maturityDays: 360,
    typicalYieldKgPerHa: 26000,
    supplier: 'IITA Clean Seed System',
    zones: 'Rainforest & Derived Savannah (Oyo, Benue, Abia, Imo)',
    features: 'Yellow flesh rich in beta-carotene, high resistance to Cassava Mosaic Disease (CMD).',
    spacingNotes: '1 m x 1 m spacing on ridges or flat harrowed soil.',
  },
  {
    key: 'tomato_roma_vf',
    cropName: 'Processing Tomatoes',
    variety: 'Roma VF Processing',
    category: 'Horticulture / Veg',
    maturityDays: 80,
    typicalYieldKgPerHa: 25000,
    supplier: 'Premier Seeds / East-West Seed',
    zones: 'Dry season irrigation (Kano, Kaduna, Plateau, Oyo drip clusters)',
    features: 'Determinate bush habit, firm thick-walled fruit with high soluble solids for tomato paste off-take.',
    spacingNotes: '60 cm between rows, 40 cm between stands on raised mulch beds.',
  },
  {
    key: 'tomato_platinum_f1',
    cropName: 'Hybrid Plum Tomato',
    variety: 'Platinum F1 Hybrid',
    category: 'Horticulture / Veg',
    maturityDays: 75,
    typicalYieldKgPerHa: 38000,
    supplier: 'Syngenta / Technisem Nigeria',
    zones: 'All zones with drip irrigation; high bacterial wilt and TYLCV tolerance.',
    features: 'Prolific cluster set, excellent shelf life for long-distance transport from North to South.',
    spacingNotes: '60 cm x 40 cm with drip fertigation line.',
  },
  {
    key: 'soybean_tgx1448',
    cropName: 'Commercial Grain Soybeans',
    variety: 'TGX 1448-2E Commercial',
    category: 'Legume',
    maturityDays: 115,
    typicalYieldKgPerHa: 2400,
    supplier: 'IITA Seeds / Seed Co Nigeria',
    zones: 'Middle Belt & Northern Savannah (Benue, Kaduna, Niger, Plateau)',
    features: 'Resistant to pod shattering, promiscuous nodulation with native rhizobia, superior protein.',
    spacingNotes: '50 cm row width, 10 cm intra-row drill (200,000 plants/ha).',
  },
  {
    key: 'rice_faro44',
    cropName: 'Paddy Rice',
    variety: 'FARO 44 (SiPi 692033)',
    category: 'Cereal / Grain',
    maturityDays: 120,
    typicalYieldKgPerHa: 6000,
    supplier: 'National Cereals Research Institute (NCRI Badeggi)',
    zones: 'Kebbi, Niger, Ebonyi, Kano, Taraba, Nasarawa',
    features: 'Semi-dwarf, high tillering capacity, slender translucent grain, high consumer demand.',
    spacingNotes: '20 cm x 20 cm dibbling or transplanting from 21-day nursery.',
  },
  {
    key: 'yam_hembakwase',
    cropName: 'White Guinea Yam',
    variety: 'Hembakwase (Premium White)',
    category: 'Root & Tuber',
    maturityDays: 240,
    typicalYieldKgPerHa: 18000,
    supplier: 'Benue & Nasarawa Certified Seed Sett Outgrowers',
    zones: 'Benue, Nasarawa, Niger, Oyo, Taraba, Ekiti',
    features: 'Heavy cylindrical tubers, smooth skin, excellent starch elasticity for pounded yam.',
    spacingNotes: '1 m x 1 m heaps (10,000 heaps/ha) with sturdy staking.',
  },
  {
    key: 'pepper_ata_rodo',
    cropName: 'Scotch Bonnet Hot Pepper',
    variety: 'Ata Rodo / Red Habanero',
    category: 'Horticulture / Veg',
    maturityDays: 90,
    typicalYieldKgPerHa: 16000,
    supplier: 'Local Certified Seed Aggregators / Technisem',
    zones: 'Oyo, Ogun, Osun, Kaduna, Kano',
    features: 'High pungency capsaicin, continuous fruiting under irrigation for 6–9 months.',
    spacingNotes: '50 cm x 50 cm on raised beds.',
  },
];

export const STAGE_CONFIG: Record<
  CropStage,
  {
    label: string;
    step: number;
    color: string;
    bgColor: string;
    borderColor: string;
    actionHint: string;
  }
> = {
  land_preparation: {
    label: 'Land Preparation',
    step: 1,
    color: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    actionHint: 'Plowing, harrowing, ridging & basal fertilization',
  },
  planting: {
    label: 'Planting / Sowing',
    step: 2,
    color: 'text-blue-800',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    actionHint: 'Direct seeding, stake insertion, or transplanting',
  },
  vegetative: {
    label: 'Vegetative Growth',
    step: 3,
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    actionHint: 'Canopy closure, weeding, and nitrogen top-dressing',
  },
  flowering_fruiting: {
    label: 'Flowering & Fruiting',
    step: 4,
    color: 'text-purple-800',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    actionHint: 'Tasseling, silking, pod fill, or tuber bulking',
  },
  maturing: {
    label: 'Maturing & Drying',
    step: 5,
    color: 'text-orange-800',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    actionHint: 'Grain drydown, skin curing, and moisture testing',
  },
  harvesting: {
    label: 'Active Harvesting',
    step: 6,
    color: 'text-emerald-900',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    actionHint: 'Reaping, de-husking, sorting, and field weighing',
  },
  completed: {
    label: 'Cycle Completed',
    step: 7,
    color: 'text-stone-700',
    bgColor: 'bg-stone-100',
    borderColor: 'border-stone-200',
    actionHint: 'Produce stored or sold; crop residue incorporated',
  },
};

const STAGES_ORDER: CropStage[] = [
  'land_preparation',
  'planting',
  'vegetative',
  'flowering_fruiting',
  'maturing',
  'harvesting',
  'completed',
];

type CropViewTab = 'cycles' | 'kanban' | 'varieties';

export const CropManagementView: React.FC = () => {
  const {
    crops,
    fields,
    farms,
    harvests,
    updateCrop,
    updateCropStage,
    deleteCrop,
    openModal,
  } = useFarm();

  const [activeTab, setActiveTab] = useState<CropViewTab>('cycles');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterField, setFilterField] = useState<string>('all');

  // Edit Crop Modal State
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [editName, setEditName] = useState('');
  const [editVariety, setEditVariety] = useState('');
  const [editCategory, setEditCategory] = useState<CropCategory>('Cereal / Grain');
  const [editFieldId, setEditFieldId] = useState('');
  const [editPlantingDate, setEditPlantingDate] = useState('');
  const [editExpectedHarvestDate, setEditExpectedHarvestDate] = useState('');
  const [editTargetYieldKg, setEditTargetYieldKg] = useState('');
  const [editStage, setEditStage] = useState<CropStage>('land_preparation');
  const [editSeedSupplier, setEditSeedSupplier] = useState('');
  const [editSpacingNotes, setEditSpacingNotes] = useState('');
  const [editActiveStatus, setEditActiveStatus] = useState(true);

  // Filter crops
  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const matchesSearch =
        crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (crop.seedSupplier && crop.seedSupplier.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = filterCategory === 'all' || crop.category === filterCategory;
      const matchesStg = filterStage === 'all' || crop.stage === filterStage;
      const matchesFld = filterField === 'all' || crop.fieldId === filterField;

      return matchesSearch && matchesCat && matchesStg && matchesFld;
    });
  }, [crops, searchQuery, filterCategory, filterStage, filterField]);

  // Aggregate Metrics
  const activeCropsCount = crops.filter((c) => c.activeStatus && c.stage !== 'completed').length;
  const totalTargetYieldKg = crops.reduce((sum, c) => sum + (c.targetYieldKg || 0), 0);
  const totalHarvestedKg = harvests.reduce((sum, h) => sum + (h.normalizedKg || 0), 0);

  // Handlers for Edit Crop
  const openEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setEditName(crop.name);
    setEditVariety(crop.variety);
    setEditCategory(crop.category);
    setEditFieldId(crop.fieldId);
    setEditPlantingDate(crop.plantingDate);
    setEditExpectedHarvestDate(crop.expectedHarvestDate);
    setEditTargetYieldKg(crop.targetYieldKg.toString());
    setEditStage(crop.stage);
    setEditSeedSupplier(crop.seedSupplier);
    setEditSpacingNotes(crop.spacingNotes || '');
    setEditActiveStatus(crop.activeStatus);
  };

  const handleSaveCropEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop || !editName || !editVariety) return;

    await updateCrop(editingCrop.id, {
      name: editName,
      variety: editVariety,
      category: editCategory,
      fieldId: editFieldId,
      plantingDate: editPlantingDate,
      expectedHarvestDate: editExpectedHarvestDate,
      targetYieldKg: parseFloat(editTargetYieldKg) || 0,
      stage: editStage,
      seedSupplier: editSeedSupplier,
      spacingNotes: editSpacingNotes,
      activeStatus: editActiveStatus,
    });

    setEditingCrop(null);
  };

  // Helper to advance stage
  const handleAdvanceStage = async (crop: Crop) => {
    const currentIndex = STAGES_ORDER.indexOf(crop.stage);
    if (currentIndex < STAGES_ORDER.length - 1) {
      const nextStage = STAGES_ORDER[currentIndex + 1];
      await updateCropStage(crop.id, nextStage);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* View Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#16422b]/10 text-[#16422b] rounded-md uppercase tracking-wider">
              Agronomic Production
            </span>
            <span className="text-xs text-[#181a19]/40">•</span>
            <span className="text-xs text-[#181a19]/60 font-mono">
              {crops.length} Registered Enterprise Cycles
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#181a19] tracking-tight">
            Crop Cycles & Variety Management
          </h1>
          <p className="text-xs sm:text-sm text-[#181a19]/65 mt-0.5">
            Monitor vegetative growth stages, planting schedules, harvest forecasts, and certified Nigerian seed strains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('add_crop')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New Crop Cycle</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/50 mb-1">
            <span>In-Ground Cycles</span>
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-900">
            {activeCropsCount}{' '}
            <span className="text-xs font-normal text-[#181a19]/60">active</span>
          </div>
          <p className="text-[11px] text-[#181a19]/60 font-mono mt-0.5">
            {crops.length - activeCropsCount} cycles completed
          </p>
        </div>

        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/50 mb-1">
            <span>Target Production</span>
            <Scale className="w-3.5 h-3.5 text-[#16422b]" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-[#181a19]">
            {formatWeight(totalTargetYieldKg)}
          </div>
          <p className="text-[11px] text-[#181a19]/60 font-mono mt-0.5">
            Target harvest biomass
          </p>
        </div>

        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/50 mb-1">
            <span>Harvest Realized</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-[#16422b]">
            {formatWeight(totalHarvestedKg)}
          </div>
          <p className="text-[11px] text-[#181a19]/60 font-mono mt-0.5">
            {totalTargetYieldKg > 0
              ? `${Math.round((totalHarvestedKg / totalTargetYieldKg) * 100)}% of target realized`
              : '0% realized'}
          </p>
        </div>

        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/50 mb-1">
            <span>Crop Categories</span>
            <Layers className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-amber-950">
            {new Set(crops.map((c) => c.category)).size}{' '}
            <span className="text-xs font-normal text-[#181a19]/60">enterprises</span>
          </div>
          <p className="text-[11px] text-[#181a19]/60 mt-0.5">
            Grains, Tubers & Vegetables
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#181a19]/10 pb-0.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cycles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'cycles'
              ? 'border-[#16422b] text-[#16422b]'
              : 'border-transparent text-[#181a19]/60 hover:text-[#181a19]'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Crop Cycles & Growth Stepper</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#181a19]/10">
            {crops.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'kanban'
              ? 'border-[#16422b] text-[#16422b]'
              : 'border-transparent text-[#181a19]/60 hover:text-[#181a19]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Growth Stages Matrix</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-medium">
            Pipeline
          </span>
        </button>

        <button
          onClick={() => setActiveTab('varieties')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'varieties'
              ? 'border-[#16422b] text-[#16422b]'
              : 'border-transparent text-[#181a19]/60 hover:text-[#181a19]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Certified Nigerian Varieties Catalog</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-medium">
            {NIGERIAN_VARIETY_CATALOG.length} Strains
          </span>
        </button>
      </div>

      {/* TAB 1: CROP CYCLES & GROWTH STEPPER */}
      {activeTab === 'cycles' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search crop name, variety (e.g. SC 719, TME-419), or seed supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Categories</option>
                <option value="Cereal / Grain">Cereal / Grain</option>
                <option value="Root & Tuber">Root & Tuber</option>
                <option value="Horticulture / Veg">Horticulture / Veg</option>
                <option value="Legume">Legume</option>
                <option value="Cash Crop">Cash Crop</option>
              </select>

              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Growth Stages</option>
                <option value="land_preparation">Land Preparation</option>
                <option value="planting">Planting / Sowing</option>
                <option value="vegetative">Vegetative Growth</option>
                <option value="flowering_fruiting">Flowering & Fruiting</option>
                <option value="maturing">Maturing & Drying</option>
                <option value="harvesting">Active Harvesting</option>
                <option value="completed">Completed Cycle</option>
              </select>

              {fields.length > 0 && (
                <select
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                >
                  <option value="all">All Fields</option>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Crops Cards List */}
          {filteredCrops.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#181a19]/15">
              <Sprout className="w-8 h-8 text-[#181a19]/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#181a19]">No crop cycles match your criteria</p>
              <p className="text-xs text-[#181a19]/50 mt-1 mb-4">
                Register a planted crop cycle or select a certified variety from our library.
              </p>
              <button
                onClick={() => openModal('add_crop')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16422b] rounded-lg shadow-xs"
              >
                + Register Planted Crop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCrops.map((crop) => {
                const field = fields.find((f) => f.id === crop.fieldId);
                const parentFarm = field ? farms.find((farm) => farm.id === field.farmId) : null;
                const cropHarvests = harvests.filter((h) => h.cropId === crop.id);
                const totalCropHarvestedKg = cropHarvests.reduce((sum, h) => sum + h.normalizedKg, 0);

                const yieldProgress =
                  crop.targetYieldKg > 0
                    ? Math.min(100, (totalCropHarvestedKg / crop.targetYieldKg) * 100)
                    : 0;

                const stageConfig = STAGE_CONFIG[crop.stage];

                // Days after planting calculation
                const plantDate = new Date(crop.plantingDate);
                const expDate = new Date(crop.expectedHarvestDate);
                const today = new Date();
                const totalSeasonDays = Math.max(
                  1,
                  Math.round((expDate.getTime() - plantDate.getTime()) / 86400000)
                );
                const daysAfterPlanting = Math.max(
                  0,
                  Math.round((today.getTime() - plantDate.getTime()) / 86400000)
                );
                const seasonPctElapsed = Math.min(
                  100,
                  Math.max(0, Math.round((daysAfterPlanting / totalSeasonDays) * 100))
                );
                const daysUntilHarvest = Math.round((expDate.getTime() - today.getTime()) / 86400000);

                const canAdvance = crop.stage !== 'completed';

                return (
                  <div
                    key={crop.id}
                    className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs hover:border-[#16422b]/40 transition-colors space-y-4"
                  >
                    {/* Header Zone: Name, Variety, Category, Field & Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#181a19]/10">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Sprout className="w-5 h-5 text-[#16422b]" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-[#181a19]">{crop.name}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-[#fafaf7] border border-[#181a19]/15 text-[#181a19]/80 font-mono">
                              {crop.variety}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {crop.category}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#181a19]/60 mt-1 font-mono">
                            {field ? (
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3 text-[#16422b]" />
                                <span>
                                  Field: {field.name} ({field.code}) · {field.size} {field.unit}
                                </span>
                              </span>
                            ) : (
                              <span className="text-amber-700 italic">Field Unassigned</span>
                            )}

                            {parentFarm && (
                              <span className="flex items-center gap-1 text-[#181a19]/50">
                                <MapPin className="w-3 h-3" />
                                <span>{parentFarm.name}</span>
                              </span>
                            )}

                            {crop.seedSupplier && (
                              <span className="text-[#181a19]/50 font-sans">
                                Seed: <strong>{crop.seedSupplier}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Stage Advancement & Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Current Stage Badge */}
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${stageConfig.bgColor} ${stageConfig.color} ${stageConfig.borderColor}`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current" />
                          <span>{stageConfig.label}</span>
                          <span className="opacity-60 text-[10px]">({stageConfig.step}/7)</span>
                        </div>

                        {canAdvance && (
                          <button
                            onClick={() => handleAdvanceStage(crop)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
                            title="Advance to next phenological growth stage"
                          >
                            <span>Advance Stage</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => openModal('record_harvest')}
                          className="px-2.5 py-1.5 text-xs font-semibold text-[#16422b] bg-[#16422b]/10 hover:bg-[#16422b]/20 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Log Harvest
                        </button>

                        <button
                          onClick={() => openEditCrop(crop)}
                          className="p-1.5 text-[#181a19]/40 hover:text-[#16422b] rounded-lg hover:bg-stone-100 transition-colors"
                          title="Edit crop details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteCrop(crop.id)}
                          className="p-1.5 text-[#181a19]/40 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete crop cycle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Interactive 7-Step Phenological Growth Pipeline */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#181a19]">Growth Stage Progression:</span>
                        <span className="text-[#181a19]/60 italic">{stageConfig.actionHint}</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {STAGES_ORDER.map((stageKey, idx) => {
                          const config = STAGE_CONFIG[stageKey];
                          const isCurrent = crop.stage === stageKey;
                          const isPassed = config.step < stageConfig.step;

                          return (
                            <button
                              key={stageKey}
                              onClick={() => updateCropStage(crop.id, stageKey)}
                              className={`p-2 rounded-lg text-left transition-all text-[10px] sm:text-[11px] border flex flex-col justify-between ${
                                isCurrent
                                  ? `${config.bgColor} ${config.borderColor} ${config.color} ring-2 ring-[#16422b]/20 font-bold shadow-xs`
                                  : isPassed
                                  ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-900/70 hover:bg-emerald-100/50'
                                  : 'bg-[#fafaf7] border-[#181a19]/10 text-[#181a19]/40 hover:bg-stone-100'
                              }`}
                              title={`Click to set stage to ${config.label}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[9px] opacity-70">0{config.step}</span>
                                {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              </div>
                              <span className="line-clamp-2 leading-tight mt-1">
                                {config.label.split(' / ')[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Timeline & Yield Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                      {/* Days after planting & Timeline */}
                      <div className="p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[#181a19]/60 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#16422b]" />
                            <span>Crop Phenology Age</span>
                          </span>
                          <span className="font-mono text-[#181a19] font-medium">
                            Day {daysAfterPlanting} of {totalSeasonDays}
                          </span>
                        </div>

                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${seasonPctElapsed}%` }}
                            className="bg-[#16422b] h-full transition-all"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-[#181a19]/50">
                          <span>Planted: {crop.plantingDate}</span>
                          <span>{seasonPctElapsed}% completed</span>
                        </div>
                      </div>

                      {/* Harvest Forecast Window */}
                      <div className="p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[#181a19]/60 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-700" />
                            <span>Expected Harvest Window</span>
                          </span>
                        </div>

                        <div className="font-mono font-bold text-sm text-[#181a19]">
                          {crop.expectedHarvestDate}
                        </div>

                        <div className="text-[10px] font-mono">
                          {daysUntilHarvest > 0 ? (
                            <span className="text-emerald-800">
                              ≈ {daysUntilHarvest} days until expected harvest
                            </span>
                          ) : daysUntilHarvest === 0 ? (
                            <span className="text-amber-800 font-bold">
                              Harvest window opens today!
                            </span>
                          ) : (
                            <span className="text-rose-700 font-semibold">
                              Harvest window passed by {Math.abs(daysUntilHarvest)} days
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Target Yield vs Realized */}
                      <div className="p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[#181a19]/60 text-[11px]">
                          <span>Harvest Yield Target</span>
                          <span className="font-mono font-bold text-[#16422b]">
                            {yieldProgress.toFixed(0)}%
                          </span>
                        </div>

                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${yieldProgress}%` }}
                            className="bg-emerald-600 h-full transition-all"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-[#181a19]/60">
                          <span>Realized: {formatWeight(totalCropHarvestedKg)}</span>
                          <span>Target: {formatWeight(crop.targetYieldKg)}</span>
                        </div>
                      </div>
                    </div>

                    {crop.spacingNotes && (
                      <div className="text-[11px] text-[#181a19]/60 bg-[#fafaf7] px-3 py-1.5 rounded-lg border border-[#181a19]/5">
                        <strong>Agronomic Spacing:</strong> {crop.spacingNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GROWTH STAGES MATRIX / KANBAN PIPELINE */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">
                Phenological Growth Stages Pipeline
              </h3>
              <p className="text-xs text-[#181a19]/60">
                Visualize and advance active crop cycles through standardized agricultural milestones.
              </p>
            </div>
            <button
              onClick={() => openModal('add_crop')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] rounded-lg shadow-xs self-start sm:self-auto"
            >
              + Register Crop
            </button>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 overflow-x-auto pb-4">
            {STAGES_ORDER.map((stageKey) => {
              const stageConfig = STAGE_CONFIG[stageKey];
              const stageCrops = crops.filter((c) => c.stage === stageKey);

              return (
                <div
                  key={stageKey}
                  className="bg-white border border-[#181a19]/10 rounded-xl p-3 flex flex-col min-w-[210px] shadow-xs"
                >
                  {/* Column Header */}
                  <div
                    className={`p-2 rounded-lg border ${stageConfig.bgColor} ${stageConfig.borderColor} ${stageConfig.color} mb-3`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{stageConfig.label}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-white/70">
                        {stageCrops.length}
                      </span>
                    </div>
                    <span className="text-[10px] opacity-70 block mt-0.5 line-clamp-1">
                      Step {stageConfig.step} of 7
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="space-y-2.5 flex-1">
                    {stageCrops.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#181a19]/35 border border-dashed border-[#181a19]/10 rounded-lg">
                        No crops in this stage
                      </div>
                    ) : (
                      stageCrops.map((crop) => {
                        const field = fields.find((f) => f.id === crop.fieldId);
                        const canAdvance = crop.stage !== 'completed';

                        return (
                          <div
                            key={crop.id}
                            className="p-3 bg-[#fafaf7] border border-[#181a19]/10 rounded-lg shadow-2xs hover:border-[#16422b]/40 transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-bold text-[#181a19] line-clamp-1">
                                {crop.name}
                              </h4>
                              <button
                                onClick={() => openEditCrop(crop)}
                                className="text-[#181a19]/40 hover:text-[#16422b] p-0.5"
                                title="Edit crop"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>

                            <p className="text-[11px] text-[#181a19]/60 font-mono">
                              {crop.variety}
                            </p>

                            <div className="text-[10px] text-[#181a19]/50 space-y-0.5 border-t border-[#181a19]/5 pt-1.5">
                              {field && (
                                <div className="truncate">
                                  Plot: <strong>{field.code}</strong> ({field.name})
                                </div>
                              )}
                              <div className="font-mono">Planted: {crop.plantingDate}</div>
                              <div className="font-mono">Harvest: {crop.expectedHarvestDate}</div>
                            </div>

                            {canAdvance && (
                              <button
                                onClick={() => handleAdvanceStage(crop)}
                                className="w-full mt-2 py-1 px-2 rounded-md bg-[#16422b]/10 hover:bg-[#16422b]/20 text-[#16422b] font-semibold text-[10px] flex items-center justify-center gap-1 transition-colors"
                              >
                                <span>Advance Stage</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFIED NIGERIAN VARIETIES CATALOG & PRESETS */}
      {activeTab === 'varieties' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">
                High-Yield Certified Nigerian Seed & Stem Varieties
              </h3>
              <p className="text-xs text-[#181a19]/60">
                Official seed strains bred for Nigerian agro-ecological zones by IITA, NCRI, NIHORT, and certified seed companies.
              </p>
            </div>
            <button
              onClick={() => openModal('add_crop')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] rounded-lg shadow-xs self-start sm:self-auto"
            >
              + Register Custom Crop
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NIGERIAN_VARIETY_CATALOG.map((item) => (
              <div
                key={item.key}
                className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#16422b]/40 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.category}
                        </span>
                        <span className="text-xs font-mono text-[#181a19]/50">
                          {item.maturityDays} Days Maturity
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#181a19] mt-1">{item.cropName}</h4>
                      <p className="text-xs font-mono font-semibold text-[#16422b]">
                        Strain: {item.variety}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#181a19]/50 block">Yield Potential</span>
                      <span className="text-sm font-bold font-mono text-[#181a19]">
                        {formatWeight(item.typicalYieldKgPerHa)}/ha
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#181a19]/70 leading-relaxed">{item.features}</p>

                  <div className="p-2.5 rounded-lg bg-[#fafaf7] border border-[#181a19]/5 space-y-1 text-xs">
                    <div>
                      <span className="font-semibold text-[#181a19]">Target Eco-Zones:</span>{' '}
                      <span className="text-[#181a19]/70 text-[11px]">{item.zones}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#181a19]">Supplier Sources:</span>{' '}
                      <span className="text-[#181a19]/70 text-[11px]">{item.supplier}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#181a19]">Planting Geometry:</span>{' '}
                      <span className="text-[#181a19]/70 text-[11px]">{item.spacingNotes}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#181a19]/5 flex items-center justify-between">
                  <span className="text-[11px] text-[#181a19]/50">
                    Certified National Register
                  </span>

                  <button
                    onClick={() => {
                      openModal('add_crop');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Plant This Variety</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Edit Crop Cycle */}
      <Modal
        isOpen={!!editingCrop}
        onClose={() => setEditingCrop(null)}
        title="Modify Crop Cycle Parameters"
        subtitle="Update crop variety, target field allocation, planting dates, and yield targets"
      >
        <form onSubmit={handleSaveCropEdit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Crop Name *
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Variety / Strain *
              </label>
              <input
                type="text"
                required
                value={editVariety}
                onChange={(e) => setEditVariety(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as CropCategory)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Cereal / Grain">Cereal / Grain</option>
                <option value="Root & Tuber">Root & Tuber</option>
                <option value="Horticulture / Veg">Horticulture / Veg</option>
                <option value="Legume">Legume</option>
                <option value="Cash Crop">Cash Crop</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Allocated Field Block
              </label>
              <select
                value={editFieldId}
                onChange={(e) => setEditFieldId(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code}) · {f.size} {f.unit}
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
                required
                value={editPlantingDate}
                onChange={(e) => setEditPlantingDate(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Expected Harvest Date
              </label>
              <input
                type="date"
                required
                value={editExpectedHarvestDate}
                onChange={(e) => setEditExpectedHarvestDate(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Target Yield (kg)
              </label>
              <input
                type="number"
                step="any"
                required
                value={editTargetYieldKg}
                onChange={(e) => setEditTargetYieldKg(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Growth Stage
              </label>
              <select
                value={editStage}
                onChange={(e) => setEditStage(e.target.value as CropStage)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="land_preparation">Land Preparation & Tillage</option>
                <option value="planting">Direct Seeding / Transplanting</option>
                <option value="vegetative">Vegetative Canopy Growth</option>
                <option value="flowering_fruiting">Flowering & Fruiting / Tasseling</option>
                <option value="maturing">Maturing & Grain Drydown</option>
                <option value="harvesting">Active Harvesting</option>
                <option value="completed">Completed Cycle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Seed / Stem Supplier
              </label>
              <input
                type="text"
                value={editSeedSupplier}
                onChange={(e) => setEditSeedSupplier(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Agronomic Spacing Notes
            </label>
            <input
              type="text"
              value={editSpacingNotes}
              onChange={(e) => setEditSpacingNotes(e.target.value)}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="activeStatusCheck"
              checked={editActiveStatus}
              onChange={(e) => setEditActiveStatus(e.target.checked)}
              className="accent-[#16422b] rounded-sm"
            />
            <label htmlFor="activeStatusCheck" className="text-xs text-[#181a19]/80 cursor-pointer">
              Active enterprise cycle (uncheck if archived or completed)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setEditingCrop(null)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
