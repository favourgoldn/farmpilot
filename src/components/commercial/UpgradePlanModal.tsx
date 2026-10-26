import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { formatNaira } from '../../services/paystackService';
import { PlanTier, SUBSCRIPTION_PLANS } from '../../types/farm';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitFeature?: 'farms' | 'fields' | 'crops' | 'team' | null;
  onSelectPlanToCheckout: (planId: PlanTier, cycle: 'monthly' | 'annual') => void;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  limitFeature,
  onSelectPlanToCheckout,
}) => {
  const {
    currentPlan,
    planLimits,
    farms,
    fields,
    crops,
    team,
  } = useFarm();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  const featureLimitDetails: Record<
    'farms' | 'fields' | 'crops' | 'team',
    { title: string; current: number; max: number; label: string }
  > = {
    farms: {
      title: 'Farm Estate Limit Reached',
      current: farms.length,
      max: planLimits.maxFarms,
      label: 'farm estates',
    },
    fields: {
      title: 'Field Block Limit Reached',
      current: fields.length,
      max: planLimits.maxFields,
      label: 'field plots',
    },
    crops: {
      title: 'Active Crop Cycle Limit Reached',
      current: crops.filter((c) => c.activeStatus).length,
      max: planLimits.maxActiveCrops,
      label: 'active crops',
    },
    team: {
      title: 'Team Member Seat Limit Reached',
      current: team.length,
      max: planLimits.maxTeamMembers,
      label: 'team members',
    },
  };

  const limitInfo = limitFeature ? featureLimitDetails[limitFeature] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a19]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#181a19]/10 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#181a19]/10 flex items-start justify-between bg-[#fafaf7] rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#16422b]/10 text-[#16422b]">
                FarmPilot Commercial SaaS
              </span>
              <span className="text-[11px] text-[#181a19]/50 font-mono">
                Nigerian Agribusiness Plans
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#181a19] tracking-tight mt-1">
              Scale Your Agribusiness Operations
            </h2>
            <p className="text-xs text-[#181a19]/60 mt-1 max-w-xl">
              Choose the right operational capacity for your commercial estate, unlock multi-user team permissions, and power your farm with real net profit intelligence.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#181a19]/50 hover:text-[#181a19] hover:bg-black/5 rounded-lg transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Limit Warning Alert Banner (If triggered by a limit) */}
        {limitInfo && (
          <div className="mx-5 sm:mx-6 mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-amber-950">{limitInfo.title}</h4>
              <p className="text-amber-900/80 mt-0.5">
                Your current plan ({SUBSCRIPTION_PLANS[currentPlan].name}) allows a maximum of{' '}
                <strong>
                  {limitInfo.max} {limitInfo.label}
                </strong>
                . You currently have {limitInfo.current} registered. Upgrade to Commercial Grower or Enterprise to expand your acreage and add more records.
              </p>
            </div>
          </div>
        )}

        {/* Billing Cycle Switcher */}
        <div className="px-5 sm:px-6 pt-5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#181a19]">Billing Cadence:</span>
            <div className="inline-flex p-1 bg-[#fafaf7] rounded-xl border border-[#181a19]/15">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[#16422b] shadow-xs border border-[#181a19]/10'
                    : 'text-[#181a19]/60 hover:text-[#181a19]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-[#16422b] text-white shadow-xs'
                    : 'text-[#181a19]/60 hover:text-[#181a19]'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-emerald-400 text-[#143826] font-bold">
                  2 Months Free
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#181a19]/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Paystack Card, Bank Transfer & USSD Supported</span>
          </div>
        </div>

        {/* 3 Tier Cards Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Plan 1: Starter */}
          <div
            className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
              currentPlan === 'starter'
                ? 'bg-emerald-500/5 border-[#16422b] ring-1 ring-[#16422b]'
                : 'bg-white border-[#181a19]/10 hover:border-[#181a19]/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#181a19]/60 uppercase tracking-wider">
                  Pilot / Smallholder
                </span>
                {currentPlan === 'starter' && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-emerald-100 text-[#16422b]">
                    Current Plan
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#181a19]">Starter Pilot</h3>
              <p className="text-[11px] text-[#181a19]/60 mt-0.5 min-h-[32px]">
                {SUBSCRIPTION_PLANS.starter.tagline}
              </p>

              <div className="mt-4 mb-5 pb-4 border-b border-[#181a19]/10">
                <span className="text-2xl font-extrabold font-mono text-[#181a19]">₦0</span>
                <span className="text-xs text-[#181a19]/50 ml-1">/ forever</span>
              </div>

              {/* Resource Capacity List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>1 Farm Estate parcel</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Up to 2 Field blocks</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Up to 2 Active crop cycles</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Up to 2 Team member accounts</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Basic harvest & expense logs</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#181a19]/10">
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-[#181a19]/50 bg-black/5 cursor-not-allowed"
              >
                {currentPlan === 'starter' ? 'Your Active Plan' : 'Free Plan'}
              </button>
            </div>
          </div>

          {/* Plan 2: Growth (Commercial Grower - Popular) */}
          <div
            className={`rounded-2xl p-5 border relative flex flex-col justify-between transition-all shadow-sm ${
              currentPlan === 'growth'
                ? 'bg-emerald-500/5 border-[#16422b] ring-2 ring-[#16422b]'
                : 'bg-white border-[#16422b]/40 ring-1 ring-[#16422b]/20 hover:border-[#16422b]'
            }`}
          >
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#16422b] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>Most Popular for Commercial Farms</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#16422b] uppercase tracking-wider">
                  Commercial Grower
                </span>
                {currentPlan === 'growth' && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-emerald-100 text-[#16422b]">
                    Current Plan
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#181a19]">Commercial Grower</h3>
              <p className="text-[11px] text-[#181a19]/60 mt-0.5 min-h-[32px]">
                {SUBSCRIPTION_PLANS.growth.tagline}
              </p>

              <div className="mt-4 mb-5 pb-4 border-b border-[#181a19]/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-mono text-[#181a19]">
                    {billingCycle === 'annual'
                      ? formatNaira(SUBSCRIPTION_PLANS.growth.annualPriceNgn)
                      : formatNaira(SUBSCRIPTION_PLANS.growth.monthlyPriceNgn)}
                  </span>
                  <span className="text-xs text-[#181a19]/50">
                    /{billingCycle === 'annual' ? 'yr' : 'mo'}
                  </span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    Save ₦30,000 yearly (equals ₦12,500/mo)
                  </p>
                )}
              </div>

              {/* Resource Capacity List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#181a19]">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Up to 5 Farm Estates</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Up to 20 Field blocks</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Up to 15 Active crop cycles</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Up to 8 Team members</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Custom Team RBAC Permissions</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time Net Profit Intelligence</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Warehouse input reorder alerts</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Export Reports to Excel / CSV</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#181a19]/10">
              {currentPlan === 'growth' ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-[#16422b] bg-emerald-100 cursor-not-allowed"
                >
                  Active Subscription
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectPlanToCheckout('growth', billingCycle)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#16422b] hover:bg-[#143826] transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Upgrade to Commercial Grower</span>
                </button>
              )}
            </div>
          </div>

          {/* Plan 3: Enterprise */}
          <div
            className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
              currentPlan === 'enterprise'
                ? 'bg-emerald-500/5 border-[#16422b] ring-2 ring-[#16422b]'
                : 'bg-white border-[#181a19]/10 hover:border-[#16422b]/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#181a19]/60 uppercase tracking-wider">
                  Agro-Allied Enterprise
                </span>
                {currentPlan === 'enterprise' && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-emerald-100 text-[#16422b]">
                    Current Plan
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#181a19]">Agro-Allied Enterprise</h3>
              <p className="text-[11px] text-[#181a19]/60 mt-0.5 min-h-[32px]">
                {SUBSCRIPTION_PLANS.enterprise.tagline}
              </p>

              <div className="mt-4 mb-5 pb-4 border-b border-[#181a19]/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-mono text-[#181a19]">
                    {billingCycle === 'annual'
                      ? formatNaira(SUBSCRIPTION_PLANS.enterprise.annualPriceNgn)
                      : formatNaira(SUBSCRIPTION_PLANS.enterprise.monthlyPriceNgn)}
                  </span>
                  <span className="text-xs text-[#181a19]/50">
                    /{billingCycle === 'annual' ? 'yr' : 'mo'}
                  </span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    Save ₦90,000 yearly (equals ₦37,500/mo)
                  </p>
                )}
              </div>

              {/* Resource Capacity List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#181a19]">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Unlimited Farm Estates</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Unlimited Field Blocks</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Unlimited Crop Cycles</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Unlimited Team Members</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Full Role Permission Matrix</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Multi-Estate Financial Rollup</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Priority WhatsApp Agronomist Support</span>
                </div>
                <div className="flex items-center gap-2 text-[#181a19]/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Dedicated Account Manager & SLA</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#181a19]/10">
              {currentPlan === 'enterprise' ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-[#16422b] bg-emerald-100 cursor-not-allowed"
                >
                  Active Subscription
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectPlanToCheckout('enterprise', billingCycle)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#181a19] hover:bg-black transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upgrade to Enterprise</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 sm:p-5 border-t border-[#181a19]/10 bg-[#fafaf7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#181a19]/60 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Instant activation upon Paystack confirmation. No hidden setup fees.</span>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#181a19]/80 hover:text-[#181a19]"
          >
            Cancel & Return
          </button>
        </div>
      </div>
    </div>
  );
};
