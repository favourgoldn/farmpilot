import {
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Droplets,
  Edit3,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Maximize2,
  Percent,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sprout,
  Tag,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { CropSeason, Farm, FarmType, Field } from '../../types/farm';
import {
  calculateSeedingNeeds,
  convertLandArea,
  LandUnitType,
  NIGERIAN_CROP_DENSITIES,
} from '../../utils/landMeasurement';
import { Modal } from '../common/Modal';

type ActiveTab = 'fields' | 'farms' | 'seasons' | 'calculator';

export const FarmsFieldsView: React.FC = () => {
  const {
    farms,
    fields,
    crops,
    seasons,
    deleteField,
    updateField,
    deleteFarm,
    updateFarm,
    deleteSeason,
    updateSeason,
    openModal,
  } = useFarm();

  const [activeTab, setActiveTab] = useState<ActiveTab>('fields');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFarmId, setFilterFarmId] = useState<string>('all');
  const [filterIrrigation, setFilterIrrigation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Edit Field Modal State
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldCode, setEditFieldCode] = useState('');
  const [editFieldSize, setEditFieldSize] = useState('');
  const [editFieldUnit, setEditFieldUnit] = useState<'hectares' | 'acres'>('hectares');
  const [editFieldIrrigation, setEditFieldIrrigation] = useState<Field['irrigation']>('Drip Irrigation');
  const [editFieldStatus, setEditFieldStatus] = useState<Field['status']>('active');
  const [editFieldNotes, setEditFieldNotes] = useState('');

  // Edit Farm Modal State
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [editFarmName, setEditFarmName] = useState('');
  const [editFarmType, setEditFarmType] = useState<FarmType>('mixed');
  const [editFarmState, setEditFarmState] = useState('');
  const [editFarmLga, setEditFarmLga] = useState('');
  const [editFarmLocation, setEditFarmLocation] = useState('');
  const [editFarmTotalArea, setEditFarmTotalArea] = useState('');
  const [editFarmUnit, setEditFarmUnit] = useState<'hectares' | 'acres'>('hectares');
  const [editFarmOwnership, setEditFarmOwnership] = useState<Farm['ownership']>('Owned');
  const [editFarmSoil, setEditFarmSoil] = useState('');

  // Land Measurement Tool State
  const [calcInputArea, setCalcInputArea] = useState<number>(10);
  const [calcInputUnit, setCalcInputUnit] = useState<LandUnitType>('hectares');
  const [selectedCropDensityKey, setSelectedCropDensityKey] = useState<string>('maize');

  // Aggregate Calculations
  const totalFarmLandHa = useMemo(() => {
    return farms.reduce((sum, f) => {
      const ha = f.unit === 'acres' ? f.totalArea / 2.47105 : f.totalArea;
      return sum + ha;
    }, 0);
  }, [farms]);

  const totalDelineatedHa = useMemo(() => {
    return fields.reduce((sum, f) => {
      const ha = f.unit === 'acres' ? f.size / 2.47105 : f.size;
      return sum + ha;
    }, 0);
  }, [fields]);

  const activeCultivatedFieldsCount = useMemo(() => {
    return fields.filter((f) => crops.some((c) => c.fieldId === f.id && c.activeStatus)).length;
  }, [fields, crops]);

  // Filtered fields
  const filteredFields = useMemo(() => {
    return fields.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFarm = filterFarmId === 'all' || f.farmId === filterFarmId;
      const matchesIrrigation =
        filterIrrigation === 'all' || f.irrigation === filterIrrigation;
      const matchesStatus = filterStatus === 'all' || f.status === filterStatus;

      return matchesSearch && matchesFarm && matchesIrrigation && matchesStatus;
    });
  }, [fields, searchQuery, filterFarmId, filterIrrigation, filterStatus]);

  // Converted Land Measurement Result for the calculator
  const conversionResult = useMemo(() => {
    return convertLandArea(calcInputArea || 0, calcInputUnit);
  }, [calcInputArea, calcInputUnit]);

  // Seeding density estimate for the calculator
  const seedingEstimate = useMemo(() => {
    return calculateSeedingNeeds(selectedCropDensityKey, conversionResult.hectares);
  }, [selectedCropDensityKey, conversionResult.hectares]);

  // Handlers for Edit Field
  const openEditField = (field: Field) => {
    setEditingField(field);
    setEditFieldName(field.name);
    setEditFieldCode(field.code);
    setEditFieldSize(field.size.toString());
    setEditFieldUnit(field.unit);
    setEditFieldIrrigation(field.irrigation);
    setEditFieldStatus(field.status);
    setEditFieldNotes(field.notes || '');
  };

  const handleSaveFieldEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField || !editFieldName || !editFieldSize) return;

    await updateField(editingField.id, {
      name: editFieldName,
      code: editFieldCode,
      size: parseFloat(editFieldSize),
      unit: editFieldUnit,
      irrigation: editFieldIrrigation,
      status: editFieldStatus,
      notes: editFieldNotes,
    });
    setEditingField(null);
  };

  // Handlers for Edit Farm
  const openEditFarm = (farm: Farm) => {
    setEditingFarm(farm);
    setEditFarmName(farm.name);
    setEditFarmType(farm.farmType || 'mixed');
    setEditFarmState(farm.state);
    setEditFarmLga(farm.lga);
    setEditFarmLocation(farm.locationDetails);
    setEditFarmTotalArea(farm.totalArea.toString());
    setEditFarmUnit(farm.unit);
    setEditFarmOwnership(farm.ownership);
    setEditFarmSoil(farm.soilProfile);
  };

  const handleSaveFarmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarm || !editFarmName || !editFarmTotalArea) return;

    await updateFarm(editingFarm.id, {
      name: editFarmName,
      farmType: editFarmType,
      state: editFarmState,
      lga: editFarmLga,
      locationDetails: editFarmLocation,
      totalArea: parseFloat(editFarmTotalArea),
      unit: editFarmUnit,
      ownership: editFarmOwnership,
      soilProfile: editFarmSoil,
    });
    setEditingFarm(null);
  };

  // Cycle season status
  const handleCycleSeasonStatus = async (season: CropSeason) => {
    const nextStatus: CropSeason['status'] =
      season.status === 'planning'
        ? 'active'
        : season.status === 'active'
        ? 'completed'
        : 'planning';

    await updateSeason(season.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Overview Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#16422b]/10 text-[#16422b] rounded-md uppercase tracking-wider">
              Land & Crop Infrastructure
            </span>
            <span className="text-xs text-[#181a19]/40">•</span>
            <span className="text-xs text-[#181a19]/60 font-mono">
              {farms.length} {farms.length === 1 ? 'Farm Estate' : 'Farm Estates'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#181a19] tracking-tight">
            Farms, Fields & Crop Seasons
          </h1>
          <p className="text-xs sm:text-sm text-[#181a19]/65 mt-0.5">
            Delineate agricultural parcels, plan cropping seasons, and convert Nigerian land units & seed density.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openModal('add_farm')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#16422b] bg-white hover:bg-[#16422b]/5 border border-[#16422b]/25 rounded-lg transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#16422b]" />
            <span>+ Farm Estate</span>
          </button>
          <button
            onClick={() => openModal('add_field')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Field Block</span>
          </button>
          <button
            onClick={() => openModal('add_season')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>+ Plan Season</span>
          </button>
        </div>
      </div>

      {/* High-Level Agricultural Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/50 mb-1">
            <span>Total Landholding</span>
            <MapPin className="w-3.5 h-3.5 text-[#16422b]" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-[#181a19]">
            {Math.round(totalFarmLandHa * 10) / 10} <span className="text-xs font-normal">ha</span>
          </div>
          <p className="text-[11px] text-[#181a19]/60 font-mono mt-0.5">
            ≈ {Math.round(totalFarmLandHa * 2.471 * 10) / 10} acres
          </p>
        </div>

        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/50 mb-1">
            <span>Delineated Plots</span>
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-800">
            {fields.length} <span className="text-xs font-normal">blocks</span>
          </div>
          <p className="text-[11px] text-[#181a19]/60 font-mono mt-0.5">
            {Math.round(totalDelineatedHa * 10) / 10} ha partitioned
          </p>
        </div>

        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/50 mb-1">
            <span>Active Cultivation</span>
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-[#181a19]">
            {activeCultivatedFieldsCount}{' '}
            <span className="text-xs font-normal text-[#181a19]/60">/ {fields.length}</span>
          </div>
          <p className="text-[11px] text-[#181a19]/60 mt-0.5">
            {fields.length - activeCultivatedFieldsCount} fallow/resting
          </p>
        </div>

        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#181a19]/50 mb-1">
            <span>Crop Seasons</span>
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-amber-900">
            {seasons.filter((s) => s.status === 'active').length}{' '}
            <span className="text-xs font-normal text-[#181a19]/60">active</span>
          </div>
          <p className="text-[11px] text-[#181a19]/60 mt-0.5">
            {seasons.length} total cycles planned
          </p>
        </div>
      </div>

      {/* Visual Land Allocation Progress Bar */}
      {fields.length > 0 && totalFarmLandHa > 0 && (
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#181a19]">Estate Land Partitioning Breakdown</span>
              <span className="text-[11px] text-[#181a19]/50">
                ({Math.round(totalDelineatedHa * 10) / 10} ha of {Math.round(totalFarmLandHa * 10) / 10} ha total)
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#16422b] font-medium">
              {Math.min(100, Math.round((totalDelineatedHa / totalFarmLandHa) * 100))}% Allocated
            </span>
          </div>

          {/* Segmented Color Bar */}
          <div className="h-3 w-full bg-[#fafaf7] rounded-full overflow-hidden flex border border-[#181a19]/10">
            {fields.map((field, idx) => {
              const fieldHa = field.unit === 'acres' ? field.size / 2.47105 : field.size;
              const pct = Math.max(1, (fieldHa / totalFarmLandHa) * 100);
              const colors = [
                'bg-emerald-600',
                'bg-teal-600',
                'bg-emerald-500',
                'bg-amber-600',
                'bg-emerald-700',
                'bg-teal-500',
                'bg-lime-600',
              ];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={field.id}
                  style={{ width: `${pct}%` }}
                  className={`${color} h-full border-r border-white/30 transition-all`}
                  title={`${field.name} (${field.code}): ${field.size} ${field.unit}`}
                />
              );
            })}
            {totalFarmLandHa > totalDelineatedHa && (
              <div
                style={{
                  width: `${((totalFarmLandHa - totalDelineatedHa) / totalFarmLandHa) * 100}%`,
                }}
                className="bg-stone-200 h-full"
                title={`Undeveloped / Reserve Land: ${Math.round((totalFarmLandHa - totalDelineatedHa) * 10) / 10} ha`}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#181a19]/60">
            {fields.slice(0, 5).map((f, i) => (
              <div key={f.id} className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    [
                      'bg-emerald-600',
                      'bg-teal-600',
                      'bg-emerald-500',
                      'bg-amber-600',
                      'bg-emerald-700',
                    ][i % 5]
                  }`}
                />
                <span className="font-mono">{f.code}</span>
                <span>({f.size} {f.unit})</span>
              </div>
            ))}
            {totalFarmLandHa > totalDelineatedHa && (
              <div className="flex items-center gap-1.5 text-stone-500">
                <span className="w-2 h-2 rounded-full bg-stone-300" />
                <span>Reserve ({Math.round((totalFarmLandHa - totalDelineatedHa) * 10) / 10} ha)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#181a19]/10 pb-0.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('fields')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'fields'
              ? 'border-[#16422b] text-[#16422b]'
              : 'border-transparent text-[#181a19]/60 hover:text-[#181a19]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Field Blocks</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#181a19]/10">
            {fields.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('farms')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'farms'
              ? 'border-[#16422b] text-[#16422b]'
              : 'border-transparent text-[#181a19]/60 hover:text-[#181a19]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Farm Estates</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#181a19]/10">
            {farms.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('seasons')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'seasons'
              ? 'border-[#16422b] text-[#16422b]'
              : 'border-transparent text-[#181a19]/60 hover:text-[#181a19]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Crop Seasons</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono">
            {seasons.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'border-[#16422b] text-[#16422b]'
              : 'border-transparent text-[#181a19]/60 hover:text-[#181a19]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Land & Seeding Calculator</span>
          <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-emerald-100 text-emerald-900 font-medium">
            Tool
          </span>
        </button>
      </div>

      {/* TAB 1: FIELD BLOCKS */}
      {activeTab === 'fields' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search blocks by name, code (e.g. NR-01), or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {farms.length > 1 && (
                <select
                  value={filterFarmId}
                  onChange={(e) => setFilterFarmId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                >
                  <option value="all">All Farms</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={filterIrrigation}
                onChange={(e) => setFilterIrrigation(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Irrigation</option>
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Rain-fed">Rain-fed</option>
                <option value="Borehole Sprinkler">Borehole Sprinkler</option>
                <option value="Canal Furrow">Canal Furrow</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="preparing">Preparing</option>
                <option value="fallow">Fallow / Resting</option>
                <option value="harvested">Harvested</option>
              </select>
            </div>
          </div>

          {/* Field Blocks Grid */}
          {filteredFields.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#181a19]/15">
              <Layers className="w-8 h-8 text-[#181a19]/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#181a19]">No field blocks match your query</p>
              <p className="text-xs text-[#181a19]/50 mt-1 mb-4">
                Delineate a new plot block to partition your farm acreage into manageable crop zones.
              </p>
              <button
                onClick={() => openModal('add_field')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16422b] rounded-lg shadow-xs"
              >
                + Delineate Field Block
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFields.map((field) => {
                const currentCrop = crops.find((c) => c.fieldId === field.id && c.activeStatus);
                const parentFarm = farms.find((f) => f.id === field.farmId);
                const conv = convertLandArea(field.size, field.unit);

                return (
                  <div
                    key={field.id}
                    className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs hover:border-[#16422b]/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      {/* Code, Status & Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#fafaf7] border border-[#181a19]/15 text-[#181a19]/80 font-bold">
                            {field.code}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium capitalize ${
                              field.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : field.status === 'preparing'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : field.status === 'fallow'
                                ? 'bg-stone-100 text-stone-700 border border-stone-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {field.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditField(field)}
                            className="text-[#181a19]/40 hover:text-[#16422b] p-1 transition-colors"
                            title="Edit field block"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteField(field.id)}
                            className="text-[#181a19]/40 hover:text-rose-600 p-1 transition-colors"
                            title="Delete field block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#181a19] mb-0.5">{field.name}</h4>
                      {parentFarm && (
                        <p className="text-[11px] text-[#181a19]/50 flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 text-[#16422b]" />
                          <span>{parentFarm.name}</span>
                        </p>
                      )}

                      <p className="text-xs text-[#181a19]/60 line-clamp-2 mb-3">
                        {field.notes || 'No specific topography or soil notes.'}
                      </p>

                      {/* Metric Specifications */}
                      <div className="space-y-1.5 text-xs border-t border-[#181a19]/5 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[#181a19]/60">Block Size:</span>
                          <div className="text-right">
                            <span className="font-mono tabular-nums font-bold text-[#181a19]">
                              {field.size} {field.unit}
                            </span>
                            <span className="text-[10px] text-[#181a19]/40 block font-mono">
                              ≈ {conv.standardPlots50x100} plots (50x100)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#181a19]/60">Irrigation Setup:</span>
                          <span className="font-medium text-[#181a19] flex items-center gap-1 text-[11px]">
                            <Droplets className="w-3 h-3 text-emerald-700" />
                            {field.irrigation}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#181a19]/60">Cultivated Crop:</span>
                          {currentCrop ? (
                            <span className="font-semibold text-[#16422b] flex items-center gap-1 text-[11px]">
                              <Sprout className="w-3.5 h-3.5" />
                              {currentCrop.name}
                            </span>
                          ) : (
                            <span className="text-[#181a19]/40 italic text-[11px]">
                              Fallow / Unseeded
                            </span>
                          )}
                        </div>

                        {currentCrop && (
                          <div className="flex items-center justify-between text-[11px] text-[#181a19]/60">
                            <span>Stage:</span>
                            <span className="capitalize font-mono text-[#16422b]">
                              {currentCrop.stage.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#181a19]/5 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => {
                          setCalcInputArea(field.size);
                          setCalcInputUnit(field.unit);
                          setActiveTab('calculator');
                        }}
                        className="text-[#181a19]/60 hover:text-[#181a19] flex items-center gap-1 text-[10px]"
                      >
                        <Compass className="w-3 h-3 text-[#16422b]" />
                        <span>Calculate Seed/Plots</span>
                      </button>

                      {!currentCrop ? (
                        <button
                          onClick={() => openModal('add_crop')}
                          className="text-[#16422b] font-semibold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Assign Crop</span>
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-medium text-[10px]">Active Cycle</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FARM ESTATES */}
      {activeTab === 'farms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">Commercial Farm Estates</h3>
              <p className="text-xs text-[#181a19]/60">
                Manage registered agricultural landholdings, title tenures, and soil profiles.
              </p>
            </div>
            <button
              onClick={() => openModal('add_farm')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Farm Estate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farms.map((farm) => {
              const farmFields = fields.filter((f) => f.farmId === farm.id);
              const farmFieldsArea = farmFields.reduce((sum, f) => {
                const ha = f.unit === 'acres' ? f.size / 2.47105 : f.size;
                return sum + ha;
              }, 0);
              const farmTotalHa = farm.unit === 'acres' ? farm.totalArea / 2.47105 : farm.totalArea;
              const utilizationPct = Math.min(
                100,
                Math.round((farmFieldsArea / (farmTotalHa || 1)) * 100)
              );

              return (
                <div
                  key={farm.id}
                  className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#16422b] font-medium flex-wrap">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>
                            {farm.state} · {farm.lga || 'Main District'} LGA
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#16422b]/10 text-[#16422b] font-mono capitalize">
                            {farm.farmType || 'mixed'} farm
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#181a19] mt-0.5">{farm.name}</h4>
                        <p className="text-xs text-[#181a19]/60">{farm.locationDetails}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditFarm(farm)}
                          className="text-[#181a19]/40 hover:text-[#16422b] p-1.5 transition-colors"
                          title="Edit farm estate"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteFarm(farm.id)}
                          className="text-[#181a19]/40 hover:text-rose-600 p-1.5 transition-colors"
                          title="Delete farm estate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#fafaf7] border border-[#181a19]/5 text-xs text-[#181a19]/75 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#181a19]">Soil Profile:</span>
                        <span className="text-[#181a19]/60">{farm.soilProfile}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#181a19]">Land Tenure:</span>
                        <span className="font-medium text-[#16422b]">{farm.ownership}</span>
                      </div>
                    </div>

                    {/* Estate Area & Allocation Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#181a19]/60">Total Area:</span>
                        <span className="font-bold text-[#181a19]">
                          {farm.totalArea} {farm.unit} ({Math.round(farmTotalHa * 2.471 * 10) / 10} acres)
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#181a19]/60">Delineated Plots:</span>
                        <span className="font-semibold text-[#16422b]">
                          {farmFields.length} blocks ({Math.round(farmFieldsArea * 10) / 10} ha)
                        </span>
                      </div>

                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mt-1.5 flex">
                        <div
                          style={{ width: `${utilizationPct}%` }}
                          className="bg-[#16422b] h-full"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#181a19]/45 font-mono pt-0.5">
                        <span>{utilizationPct}% delineated into fields</span>
                        <span>
                          {Math.max(0, Math.round((farmTotalHa - farmFieldsArea) * 10) / 10)} ha reserve
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#181a19]/5 flex items-center justify-between">
                    <span className="text-[11px] text-[#181a19]/50">
                      Created: {farm.createdAt || 'Registered'}
                    </span>
                    <button
                      onClick={() => openModal('add_field')}
                      className="text-xs font-semibold text-[#16422b] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Field to this Farm</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CROP SEASONS */}
      {activeTab === 'seasons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">
                Agricultural Cropping Seasons & Cycles
              </h3>
              <p className="text-xs text-[#181a19]/60">
                Plan campaign calendars, production budgets, and multi-field crop rotations across Nigerian agro-ecological cycles.
              </p>
            </div>
            <button
              onClick={() => openModal('add_season')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Plan New Crop Season</span>
            </button>
          </div>

          {seasons.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#181a19]/15">
              <Calendar className="w-8 h-8 text-[#181a19]/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#181a19]">No cropping seasons configured</p>
              <p className="text-xs text-[#181a19]/50 mt-1 mb-4">
                Establish Early Rains, Late Rains, or Dry Season Irrigation campaigns to track capital budgets and acreage targets.
              </p>
              <button
                onClick={() => openModal('add_season')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16422b] rounded-lg shadow-xs"
              >
                + Plan New Crop Season
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seasons.map((season) => {
                const parentFarm = farms.find((f) => f.id === season.farmId);
                const startDate = new Date(season.startDate);
                const endDate = new Date(season.endDate);
                const now = new Date();
                const totalDurationDays = Math.max(
                  1,
                  Math.round((endDate.getTime() - startDate.getTime()) / 86400000)
                );
                const elapsedDays = Math.max(
                  0,
                  Math.min(totalDurationDays, Math.round((now.getTime() - startDate.getTime()) / 86400000))
                );
                const progressPct = Math.round((elapsedDays / totalDurationDays) * 100);

                return (
                  <div
                    key={season.id}
                    className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-[#16422b]/40 transition-colors"
                  >
                    <div>
                      {/* Top Header & Season Type Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            season.seasonType === 'Early Rains (Main)'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : season.seasonType === 'Dry Season (Irrigation)'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : season.seasonType === 'Late Rains (Minor)'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {season.seasonType}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCycleSeasonStatus(season)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#fafaf7] hover:bg-stone-100 border border-[#181a19]/10 text-[#181a19]/80 font-semibold capitalize"
                            title="Click to toggle status: planning -> active -> completed"
                          >
                            {season.status}
                          </button>
                          <button
                            onClick={() => deleteSeason(season.id)}
                            className="text-[#181a19]/40 hover:text-rose-600 p-1 transition-colors"
                            title="Delete season"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#181a19] mb-0.5">{season.name}</h4>
                      {parentFarm && (
                        <p className="text-[11px] text-[#181a19]/50 flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 text-[#16422b]" />
                          <span>{parentFarm.name}</span>
                        </p>
                      )}

                      {/* Date Range & Progress */}
                      <div className="my-2 p-2.5 rounded-lg bg-[#fafaf7] border border-[#181a19]/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#181a19]/60 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#16422b]" />
                            <span>Timeline:</span>
                          </span>
                          <span className="font-mono text-[#181a19] font-medium">
                            {season.startDate} → {season.endDate}
                          </span>
                        </div>

                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${progressPct}%` }}
                            className={`h-full ${
                              season.status === 'completed'
                                ? 'bg-stone-400'
                                : season.status === 'active'
                                ? 'bg-[#16422b]'
                                : 'bg-amber-500'
                            }`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#181a19]/45 font-mono">
                          <span>{totalDurationDays} days cycle</span>
                          <span>{progressPct}% elapsed</span>
                        </div>
                      </div>

                      {/* Metrics: Target Acreage & Budget */}
                      <div className="space-y-1 text-xs border-t border-[#181a19]/5 pt-2 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-[#181a19]/60 font-sans">Target Acreage:</span>
                          <span className="font-bold text-[#181a19]">
                            {season.targetAcreage} {season.unit}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#181a19]/60 font-sans">Campaign Budget:</span>
                          <span className="font-bold text-[#16422b]">
                            ₦{season.budget.toLocaleString()}
                          </span>
                        </div>

                        {season.notes && (
                          <div className="pt-1.5">
                            <span className="text-[10px] font-sans text-[#181a19]/50 block">Strategy Notes:</span>
                            <p className="text-[11px] font-sans text-[#181a19]/70 line-clamp-2">
                              {season.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#181a19]/5 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => handleCycleSeasonStatus(season)}
                        className="text-[#16422b] font-semibold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Update Status</span>
                      </button>
                      <button
                        onClick={() => openModal('add_crop')}
                        className="text-[#181a19]/70 hover:text-[#181a19] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Plant Crop</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LAND MEASUREMENT & SEEDING CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Section 1: Land Area & Plot Converter */}
          <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#181a19] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#16422b]" />
                  <span>Nigerian Agricultural Land Area Converter</span>
                </h3>
                <p className="text-xs text-[#181a19]/60">
                  Seamlessly convert between standard hectares, acres, 50x100ft plots, 60x120ft commercial plots, and traditional heaps.
                </p>
              </div>

              <button
                onClick={() => {
                  openModal('add_field');
                }}
                className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Field from this Area</span>
              </button>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <div>
                <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                  Land Area Value
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={calcInputArea || ''}
                  onChange={(e) => setCalcInputArea(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-sm font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                  Input Unit
                </label>
                <select
                  value={calcInputUnit}
                  onChange={(e) => setCalcInputUnit(e.target.value as LandUnitType)}
                  className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#16422b]"
                >
                  <option value="hectares">Hectares (ha)</option>
                  <option value="acres">Acres</option>
                  <option value="plots_60x120">Commercial Plots (60ft x 120ft)</option>
                  <option value="plots_50x100">Standard Plots (50ft x 100ft)</option>
                  <option value="sqm">Square Meters (m²)</option>
                  <option value="sqft">Square Feet (sq ft)</option>
                </select>
              </div>
            </div>

            {/* Conversion Output Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/10">
                <span className="text-[10px] font-medium text-[#181a19]/50 block">Hectares</span>
                <span className="text-base font-bold font-mono text-[#181a19]">
                  {conversionResult.hectares.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#181a19]/40 block">10,000 m²</span>
              </div>

              <div className="p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/10">
                <span className="text-[10px] font-medium text-[#181a19]/50 block">Acres</span>
                <span className="text-base font-bold font-mono text-[#16422b]">
                  {conversionResult.acres.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#181a19]/40 block">4,046.8 m²</span>
              </div>

              <div className="p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/10">
                <span className="text-[10px] font-medium text-[#181a19]/50 block">
                  Plots (60ft x 120ft)
                </span>
                <span className="text-base font-bold font-mono text-[#181a19]">
                  {conversionResult.commercialPlots60x120.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#181a19]/40 block">Commercial layout</span>
              </div>

              <div className="p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/10">
                <span className="text-[10px] font-medium text-[#181a19]/50 block">
                  Plots (50ft x 100ft)
                </span>
                <span className="text-base font-bold font-mono text-[#181a19]">
                  {conversionResult.standardPlots50x100.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#181a19]/40 block">Standard plot</span>
              </div>

              <div className="p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/10">
                <span className="text-[10px] font-medium text-[#181a19]/50 block">
                  Traditional Heaps
                </span>
                <span className="text-base font-bold font-mono text-amber-900">
                  {conversionResult.traditionalHeaps.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#181a19]/40 block">~1m spacing</span>
              </div>

              <div className="p-3 rounded-lg bg-[#fafaf7] border border-[#181a19]/10">
                <span className="text-[10px] font-medium text-[#181a19]/50 block">Square Meters</span>
                <span className="text-base font-bold font-mono text-[#181a19]">
                  {conversionResult.squareMeters.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#181a19]/40 block">m²</span>
              </div>
            </div>
          </div>

          {/* Section 2: Crop Plant Population & Certified Seed Estimator */}
          <div className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#181a19] flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[#16422b]" />
                <span>Nigerian Crop Stand Population & Certified Seeding Estimator</span>
              </h3>
              <p className="text-xs text-[#181a19]/60">
                Calculates agronomic plant stands, required certified seed volume, and ecological planting windows for{' '}
                <strong>
                  {conversionResult.hectares} ha ({conversionResult.acres} acres)
                </strong>
                .
              </p>
            </div>

            {/* Crop Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {Object.values(NIGERIAN_CROP_DENSITIES).map((crop) => (
                <button
                  key={crop.key}
                  onClick={() => setSelectedCropDensityKey(crop.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCropDensityKey === crop.key
                      ? 'bg-[#16422b] text-white shadow-xs'
                      : 'bg-[#fafaf7] text-[#181a19]/70 hover:bg-[#181a19]/5 border border-[#181a19]/10'
                  }`}
                >
                  {crop.cropName.split('(')[0].trim()}
                </button>
              ))}
            </div>

            {seedingEstimate && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Stand Population Card */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
                    <span>Plant Population Target</span>
                    <Sprout className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-emerald-950">
                    {seedingEstimate.totalPlantStands.toLocaleString()}{' '}
                    <span className="text-xs font-normal font-sans">stands</span>
                  </div>
                  <div className="text-[11px] text-emerald-900/70 space-y-0.5 border-t border-emerald-200/60 pt-2 font-mono">
                    <div>Spacing: {seedingEstimate.crop.rowSpacingCm}cm x {seedingEstimate.crop.intraRowSpacingCm}cm</div>
                    <div>Per Stand: {seedingEstimate.crop.seedsPerStand} seed/cutting</div>
                  </div>
                </div>

                {/* Seed Requirement Card */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-900 font-semibold">
                    <span>Certified Seed / Material Requirement</span>
                    <Tag className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-amber-950">
                    {seedingEstimate.rawSeedRequirement.toLocaleString()}{' '}
                    <span className="text-xs font-normal font-sans">{seedingEstimate.seedUnit}</span>
                  </div>
                  <div className="text-[11px] text-amber-900/70 border-t border-amber-200/60 pt-2 font-mono">
                    With +10% Gap-Fill Buffer:{' '}
                    <strong>{seedingEstimate.bufferSeedRequirement.toLocaleString()}</strong>{' '}
                    {seedingEstimate.seedUnit}
                  </div>
                </div>

                {/* Agronomic Ecological Guidance */}
                <div className="p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#181a19] font-semibold">
                    <span>Planting Window & Agro-Zone</span>
                    <Compass className="w-4 h-4 text-[#16422b]" />
                  </div>
                  <div className="text-xs text-[#181a19]/80 space-y-1">
                    <p className="text-[11px]">
                      <strong>Window:</strong> {seedingEstimate.crop.plantingWindow}
                    </p>
                    <p className="text-[11px] text-[#181a19]/60">
                      <strong>Target Zone:</strong> {seedingEstimate.crop.recommendedZone}
                    </p>
                  </div>
                  <div className="text-[10px] text-emerald-800 bg-emerald-100/60 p-2 rounded-md border border-emerald-200/50 mt-1">
                    <strong>Agronomist Tip:</strong> {seedingEstimate.crop.agronomicTip}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Edit Field Block */}
      <Modal
        isOpen={!!editingField}
        onClose={() => setEditingField(null)}
        title="Modify Field Block Specifications"
        subtitle="Update parcel boundary measurements, irrigation system, and soil characteristics"
      >
        <form onSubmit={handleSaveFieldEdit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Field Name *
              </label>
              <input
                type="text"
                required
                value={editFieldName}
                onChange={(e) => setEditFieldName(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Field Code / Identifier
              </label>
              <input
                type="text"
                value={editFieldCode}
                onChange={(e) => setEditFieldCode(e.target.value)}
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
                value={editFieldSize}
                onChange={(e) => setEditFieldSize(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Unit
              </label>
              <select
                value={editFieldUnit}
                onChange={(e) => setEditFieldUnit(e.target.value as 'hectares' | 'acres')}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="hectares">Hectares (ha)</option>
                <option value="acres">Acres</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Status
              </label>
              <select
                value={editFieldStatus}
                onChange={(e) => setEditFieldStatus(e.target.value as Field['status'])}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="active">Active</option>
                <option value="preparing">Preparing</option>
                <option value="fallow">Fallow / Resting</option>
                <option value="harvested">Harvested</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Irrigation Infrastructure
            </label>
            <select
              value={editFieldIrrigation}
              onChange={(e) => setEditFieldIrrigation(e.target.value as Field['irrigation'])}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            >
              <option value="Drip Irrigation">Drip Irrigation</option>
              <option value="Rain-fed">Rain-fed</option>
              <option value="Borehole Sprinkler">Borehole Sprinkler</option>
              <option value="Canal Furrow">Canal Furrow</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Topography & Soil Profile Notes
            </label>
            <textarea
              rows={2}
              value={editFieldNotes}
              onChange={(e) => setEditFieldNotes(e.target.value)}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setEditingField(null)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Save Field Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit Farm Estate */}
      <Modal
        isOpen={!!editingFarm}
        onClose={() => setEditingFarm(null)}
        title="Edit Farm Estate Details"
        subtitle="Update holding title, land tenure, state location, and soil profile"
      >
        <form onSubmit={handleSaveFarmEdit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Farm Estate Name *
            </label>
            <input
              type="text"
              required
              value={editFarmName}
              onChange={(e) => setEditFarmName(e.target.value)}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1.5">
              Farming Category Configuration
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-all flex flex-col gap-1 ${
                  editFarmType === 'crop'
                    ? 'border-[#16422b] bg-emerald-50/50 text-[#16422b] font-medium'
                    : 'border-[#181a19]/15 bg-[#fafaf7] text-[#181a19]/80 hover:bg-[#fafaf7]/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Crop Farm</span>
                  <input
                    type="radio"
                    name="editFarmType"
                    value="crop"
                    checked={editFarmType === 'crop'}
                    onChange={() => setEditFarmType('crop')}
                    className="accent-[#16422b]"
                  />
                </div>
                <span className="text-[10px] text-[#181a19]/60 leading-tight">
                  Arable grain, tuber & veggie plots
                </span>
              </label>

              <label
                className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-all flex flex-col gap-1 ${
                  editFarmType === 'poultry'
                    ? 'border-[#16422b] bg-emerald-50/50 text-[#16422b] font-medium'
                    : 'border-[#181a19]/15 bg-[#fafaf7] text-[#181a19]/80 hover:bg-[#fafaf7]/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Poultry Farm</span>
                  <input
                    type="radio"
                    name="editFarmType"
                    value="poultry"
                    checked={editFarmType === 'poultry'}
                    onChange={() => setEditFarmType('poultry')}
                    className="accent-[#16422b]"
                  />
                </div>
                <span className="text-[10px] text-[#181a19]/60 leading-tight">
                  Broiler & layer houses and pens
                </span>
              </label>

              <label
                className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-all flex flex-col gap-1 ${
                  editFarmType === 'mixed'
                    ? 'border-[#16422b] bg-emerald-50/50 text-[#16422b] font-medium'
                    : 'border-[#181a19]/15 bg-[#fafaf7] text-[#181a19]/80 hover:bg-[#fafaf7]/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Mixed Farm</span>
                  <input
                    type="radio"
                    name="editFarmType"
                    value="mixed"
                    checked={editFarmType === 'mixed'}
                    onChange={() => setEditFarmType('mixed')}
                    className="accent-[#16422b]"
                  />
                </div>
                <span className="text-[10px] text-[#181a19]/60 leading-tight">
                  Integrated crop + poultry operations
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                State
              </label>
              <input
                type="text"
                value={editFarmState}
                onChange={(e) => setEditFarmState(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                LGA / District
              </label>
              <input
                type="text"
                value={editFarmLga}
                onChange={(e) => setEditFarmLga(e.target.value)}
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
                value={editFarmTotalArea}
                onChange={(e) => setEditFarmTotalArea(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
                Unit
              </label>
              <select
                value={editFarmUnit}
                onChange={(e) => setEditFarmUnit(e.target.value as 'hectares' | 'acres')}
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
                value={editFarmOwnership}
                onChange={(e) => setEditFarmOwnership(e.target.value as Farm['ownership'])}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Owned">Owned</option>
                <option value="Leased">Leased</option>
                <option value="Outgrower Scheme">Outgrower Scheme</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Location Landmark / Route Notes
            </label>
            <input
              type="text"
              value={editFarmLocation}
              onChange={(e) => setEditFarmLocation(e.target.value)}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#181a19]/80 mb-1">
              Soil Profile Description
            </label>
            <input
              type="text"
              value={editFarmSoil}
              onChange={(e) => setEditFarmSoil(e.target.value)}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={() => setEditingFarm(null)}
              className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Save Farm Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
