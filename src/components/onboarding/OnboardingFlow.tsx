import { ArrowRight, Check, CheckCircle2, Layers, MapPin, Sprout } from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';

export const OnboardingFlow: React.FC = () => {
  const { setCurrentView, addField, addCrop, farms } = useFarm();
  const [currentStep, setCurrentStep] = useState(1);

  // Field setup state
  const [fieldName, setFieldName] = useState('Block Alpha 1');
  const [fieldSize, setFieldSize] = useState('10');
  const [fieldUnit, setFieldUnit] = useState<'hectares' | 'acres'>('hectares');
  const [irrigation, setIrrigation] = useState<'Drip Irrigation' | 'Rain-fed' | 'Borehole Sprinkler'>('Drip Irrigation');

  // Crop setup state
  const [cropName, setCropName] = useState('Yellow Grain Maize');
  const [cropVariety, setCropVariety] = useState('SeedCo SC 719');
  const [cropCategory, setCropCategory] = useState<'Cereal / Grain' | 'Root & Tuber' | 'Horticulture / Veg' | 'Legume'>('Cereal / Grain');
  const [targetYield, setTargetYield] = useState('25000');

  const farmId = farms[0]?.id || 'farm-new';

  const handleNextStep = async () => {
    if (currentStep === 2) {
      // Save field
      await addField({
        farmId,
        name: fieldName,
        code: 'BA-01',
        size: parseFloat(fieldSize) || 10,
        unit: fieldUnit,
        irrigation,
        status: 'active',
        notes: 'Primary plot created during farm onboarding.',
      });
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Save crop
      await addCrop({
        farmId,
        fieldId: 'field-new',
        name: cropName,
        variety: cropVariety,
        category: cropCategory,
        plantingDate: new Date().toISOString().split('T')[0],
        expectedHarvestDate: new Date(Date.now() + 110 * 86400000).toISOString().split('T')[0],
        targetYieldKg: parseFloat(targetYield) || 25000,
        stage: 'vegetative',
        seedSupplier: 'Certified Seed Depot',
        activeStatus: true,
      });
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentView('app');
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#16422b] text-white flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#143826]">FarmPilot</span>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-[#181a19]/60 mb-2">
            <span>Step {currentStep} of 4</span>
            <span>
              {currentStep === 1 && 'Farm Enterprise Profile'}
              {currentStep === 2 && 'First Field Block'}
              {currentStep === 3 && 'Primary Planted Crop'}
              {currentStep === 4 && 'Setup Complete'}
            </span>
          </div>
          <div className="w-full bg-[#181a19]/10 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-[#16422b] h-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Card Content */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#181a19]/10 shadow-sm space-y-6">
          {/* Step 1: Enterprise confirmation */}
          {currentStep === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-[#181a19]">
                  Welcome to Your Operations Command
                </h3>
                <p className="text-[#181a19]/60 mt-1">
                  We have initialized your farm estate in{' '}
                  <strong className="text-[#181a19]">{farms[0]?.state || 'Nigeria'}</strong>. Let's
                  configure your primary field parcel and crop enterprise to activate your real-time
                  profit dashboard.
                </p>
              </div>

              <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#181a19]/60">Farm Estate:</span>
                  <span className="font-semibold text-[#181a19]">
                    {farms[0]?.name || 'My Commercial Farm'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#181a19]/60">State Location:</span>
                  <span className="font-semibold text-[#181a19]">
                    {farms[0]?.state || 'Oyo State'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#181a19]/60">Currency:</span>
                  <span className="font-mono font-semibold text-[#16422b]">
                    Nigerian Naira (NGN ₦)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: First Field Block */}
          {currentStep === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-[#181a19]">
                  Delineate Your First Field Block
                </h3>
                <p className="text-[#181a19]/60 mt-1">
                  Specify the parcel size and irrigation method for your first production block.
                </p>
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">Field Name *</label>
                <input
                  type="text"
                  required
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#181a19]/80 mb-1">
                    Area Size *
                  </label>
                  <input
                    type="number"
                    required
                    value={fieldSize}
                    onChange={(e) => setFieldSize(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#181a19]/80 mb-1">Unit</label>
                  <select
                    value={fieldUnit}
                    onChange={(e) => setFieldUnit(e.target.value as typeof fieldUnit)}
                    className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                  >
                    <option value="hectares">Hectares (ha)</option>
                    <option value="acres">Acres</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Irrigation System
                </label>
                <select
                  value={irrigation}
                  onChange={(e) => setIrrigation(e.target.value as typeof irrigation)}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                >
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="Rain-fed">Rain-fed</option>
                  <option value="Borehole Sprinkler">Borehole Sprinkler</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Primary Planted Crop */}
          {currentStep === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-[#181a19]">
                  Register Your Primary Planted Crop
                </h3>
                <p className="text-[#181a19]/60 mt-1">
                  Link the crop variety currently seeded on your field block.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#181a19]/80 mb-1">Crop Name *</label>
                  <input
                    type="text"
                    required
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#181a19]/80 mb-1">Variety *</label>
                  <input
                    type="text"
                    required
                    value={cropVariety}
                    onChange={(e) => setCropVariety(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#181a19]/80 mb-1">Category</label>
                  <select
                    value={cropCategory}
                    onChange={(e) => setCropCategory(e.target.value as typeof cropCategory)}
                    className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                  >
                    <option value="Cereal / Grain">Cereal / Grain</option>
                    <option value="Root & Tuber">Root & Tuber</option>
                    <option value="Horticulture / Veg">Horticulture / Veg</option>
                    <option value="Legume">Legume</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#181a19]/80 mb-1">
                    Target Yield (kg)
                  </label>
                  <input
                    type="number"
                    value={targetYield}
                    onChange={(e) => setTargetYield(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg font-mono focus:outline-none focus:border-[#16422b]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Ready to Launch */}
          {currentStep === 4 && (
            <div className="text-center py-4 space-y-3 text-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#16422b] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#181a19]">Your Farm Hub is Operational!</h3>
              <p className="text-[#181a19]/70 max-w-sm mx-auto">
                You're all set up with your first field and crop enterprise. You can now record daily
                fertilizer or diesel expenses, log harvest yields, and track real net profits.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#181a19]/10">
            {currentStep > 1 && currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="text-xs text-[#181a19]/60 hover:text-[#181a19]"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs ml-auto"
            >
              <span>{currentStep === 4 ? 'Launch Dashboard' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
