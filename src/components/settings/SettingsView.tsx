import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  Database,
  Download,
  Eye,
  Globe,
  HardDrive,
  Key,
  Layers,
  Lock,
  Receipt,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { DEFAULT_PAYSTACK_TEST_PUBLIC_KEY, formatNaira } from '../../services/paystackService';
import { SUBSCRIPTION_PLANS } from '../../types/farm';

type SettingsTab = 'profile' | 'billing' | 'cloud';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetDemoData,
    clearToEmptyData,
    isDemoMode,
    firebaseUser,
    organization,
    currentPlan,
    planLimits,
    openUpgradeModal,
    openPaystackCheckout,
    billingTransactions,
    openSubscriptionReceipt,
    farms,
    fields,
    crops,
    team,
    showToast,
  } = useFarm();

  const [activeTab, setActiveTab] = useState<SettingsTab>('billing');

  const [formData, setFormData] = useState({
    farmName: settings.farmName,
    managerName: settings.managerName,
    email: settings.email,
    phone: settings.phone,
    primaryState: settings.primaryState,
    defaultUnit: settings.defaultUnit,
    fiscalYearStart: settings.fiscalYearStart,
  });

  const [paystackKey, setPaystackKey] = useState(
    settings.paystackPublicKey || DEFAULT_PAYSTACK_TEST_PUBLIC_KEY
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleSavePaystackKey = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ paystackPublicKey: paystackKey.trim() });
    showToast({
      type: 'success',
      title: 'Paystack Key Saved',
      message: 'Paystack Public Key updated for commercial subscription billing.',
    });
  };

  const activeCropsCount = crops.filter((c) => c.activeStatus).length;
  const plan = SUBSCRIPTION_PLANS[currentPlan] || SUBSCRIPTION_PLANS.growth;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#181a19] tracking-tight">Farm Settings & Enterprise Billing</h2>
        <p className="text-xs text-[#181a19]/60">
          Configure enterprise identity, manage Paystack commercial subscription limits, and monitor cloud persistence
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[#181a19]/10 gap-6 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`pb-3 font-semibold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'billing'
              ? 'text-[#16422b] border-b-2 border-[#16422b]'
              : 'text-[#181a19]/60 hover:text-[#181a19]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscription & Paystack Billing</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-emerald-100 text-[#16422b] font-bold">
            {plan.name}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 font-semibold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'text-[#16422b] border-b-2 border-[#16422b]'
              : 'text-[#181a19]/60 hover:text-[#181a19]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Enterprise Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cloud')}
          className={`pb-3 font-semibold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'cloud'
              ? 'text-[#16422b] border-b-2 border-[#16422b]'
              : 'text-[#181a19]/60 hover:text-[#181a19]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Database & Environment</span>
        </button>
      </div>

      {/* Tab 1: Commercial Subscription & Paystack Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Active Plan Card */}
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#16422b]">
                  Current Agribusiness Plan
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-100 text-[#16422b] border border-emerald-300">
                  ACTIVE
                </span>
              </div>
              <h3 className="text-2xl font-black text-[#181a19]">{plan.name}</h3>
              <p className="text-xs text-[#181a19]/70 max-w-md">
                {plan.tagline}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono">
                <span className="text-[#181a19]/70">
                  Rate:{' '}
                  <strong className="text-[#181a19] font-bold">
                    {plan.monthlyPriceNgn === 0 ? '₦0 Free' : `${formatNaira(plan.monthlyPriceNgn)}/mo`}
                  </strong>
                </span>
                <span className="text-[#181a19]/70">
                  Cycle:{' '}
                  <strong className="text-[#181a19] font-bold capitalize">
                    {organization?.subscription?.billingCycle || 'Annual'}
                  </strong>
                </span>
                <span className="text-[#181a19]/70">
                  Next Renewal:{' '}
                  <strong className="text-[#181a19] font-bold">
                    {organization?.subscription?.currentPeriodEnd
                      ? new Date(organization.subscription.currentPeriodEnd).toLocaleDateString('en-GB')
                      : 'October 2027'}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openUpgradeModal()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-300" />
                <span>{currentPlan === 'enterprise' ? 'Change Plan' : 'Upgrade Plan'}</span>
              </button>

              <button
                type="button"
                onClick={() => openPaystackCheckout(currentPlan === 'starter' ? 'growth' : currentPlan, 'annual')}
                className="px-4 py-2 text-xs font-semibold text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-xl transition-colors text-center"
              >
                Paystack Checkout
              </button>
            </div>
          </div>

          {/* Operational Resource Limits & Utilization Gauges */}
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#181a19] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#16422b]" />
                  <span>Subscription Resource Limits & Utilization</span>
                </h3>
                <p className="text-xs text-[#181a19]/60 mt-0.5">
                  Real-time operational capacity usage according to your {plan.name} limits.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openUpgradeModal()}
                className="text-xs font-bold text-[#16422b] hover:underline"
              >
                Expand Limits →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Gauge 1: Farms */}
              <div className="p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#181a19]/70">Farm Estates</span>
                  <span className="font-bold text-[#16422b]">
                    {farms.length} / {planLimits.maxFarms === Infinity ? '∞' : planLimits.maxFarms}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#181a19]/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#16422b] rounded-full"
                    style={{
                      width: `${
                        planLimits.maxFarms === Infinity
                          ? 20
                          : Math.min(100, (farms.length / planLimits.maxFarms) * 100)
                      }%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#181a19]/50 mt-2">
                  {planLimits.maxFarms === Infinity ? 'Unlimited estates' : `${planLimits.maxFarms - farms.length} slots left`}
                </p>
              </div>

              {/* Gauge 2: Fields */}
              <div className="p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#181a19]/70">Field Blocks</span>
                  <span className="font-bold text-[#16422b]">
                    {fields.length} / {planLimits.maxFields === Infinity ? '∞' : planLimits.maxFields}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#181a19]/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#16422b] rounded-full"
                    style={{
                      width: `${
                        planLimits.maxFields === Infinity
                          ? 25
                          : Math.min(100, (fields.length / planLimits.maxFields) * 100)
                      }%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#181a19]/50 mt-2">
                  {planLimits.maxFields === Infinity ? 'Unlimited plots' : `${planLimits.maxFields - fields.length} plots left`}
                </p>
              </div>

              {/* Gauge 3: Crops */}
              <div className="p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#181a19]/70">Active Crops</span>
                  <span className="font-bold text-[#16422b]">
                    {activeCropsCount} / {planLimits.maxActiveCrops === Infinity ? '∞' : planLimits.maxActiveCrops}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#181a19]/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#16422b] rounded-full"
                    style={{
                      width: `${
                        planLimits.maxActiveCrops === Infinity
                          ? 30
                          : Math.min(100, (activeCropsCount / planLimits.maxActiveCrops) * 100)
                      }%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#181a19]/50 mt-2">
                  {planLimits.maxActiveCrops === Infinity ? 'Unlimited cycles' : `${planLimits.maxActiveCrops - activeCropsCount} cycles left`}
                </p>
              </div>

              {/* Gauge 4: Team Members */}
              <div className="p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#181a19]/70">Team Seats</span>
                  <span className="font-bold text-[#16422b]">
                    {team.length} / {planLimits.maxTeamMembers === Infinity ? '∞' : planLimits.maxTeamMembers}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#181a19]/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#16422b] rounded-full"
                    style={{
                      width: `${
                        planLimits.maxTeamMembers === Infinity
                          ? 40
                          : Math.min(100, (team.length / planLimits.maxTeamMembers) * 100)
                      }%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#181a19]/50 mt-2">
                  {planLimits.maxTeamMembers === Infinity ? 'Unlimited members' : `${planLimits.maxTeamMembers - team.length} seats left`}
                </p>
              </div>
            </div>
          </div>

          {/* Paystack Public Key Integration Configuration */}
          <form
            onSubmit={handleSavePaystackKey}
            className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#181a19] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#16422b]" />
                  <span>Paystack Gateway Configuration</span>
                </h3>
                <p className="text-xs text-[#181a19]/60 mt-0.5">
                  Configure your Paystack public merchant credentials for seamless card, bank transfer, and USSD payments.
                </p>
              </div>

              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 text-[#16422b]">
                PAYSTACK VERIFIED
              </span>
            </div>

            <div className="max-w-xl text-xs space-y-2">
              <label className="block font-semibold text-[#181a19]/80">
                Paystack Public Key (Live or Test)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={paystackKey}
                  onChange={(e) => setPaystackKey(e.target.value)}
                  placeholder="pk_test_... or pk_live_..."
                  className="flex-1 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#16422b]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs shrink-0"
                >
                  Save Key
                </button>
              </div>
              <p className="text-[10.5px] text-[#181a19]/50">
                Default sandbox test key is pre-configured. You can paste your own Paystack dashboard Public Key here.
              </p>
            </div>
          </form>

          {/* Billing & Invoice Receipts History */}
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#181a19] flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#16422b]" />
                  <span>Payment History & Official Tax Invoices</span>
                </h3>
                <p className="text-xs text-[#181a19]/60 mt-0.5">
                  Permanent audit trail of your Paystack transactions and printable tax receipts.
                </p>
              </div>

              <span className="text-xs font-mono text-[#181a19]/60">
                {billingTransactions.length} Transactions
              </span>
            </div>

            {billingTransactions.length === 0 ? (
              <div className="p-8 text-center bg-[#fafaf7] rounded-xl border border-dashed border-[#181a19]/15 text-xs text-[#181a19]/50">
                No past transactions recorded yet. Upgrade your plan above to generate an invoice.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#181a19]/10 text-[10px] uppercase font-semibold text-[#181a19]/50">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Reference</th>
                      <th className="py-2.5">Plan</th>
                      <th className="py-2.5">Channel</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181a19]/5">
                    {billingTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#fafaf7]/50">
                        <td className="py-3 font-mono text-[#181a19]/70 text-[11px]">
                          {new Date(tx.paidAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 font-mono font-medium text-[#181a19] text-[11px]">
                          {tx.reference}
                        </td>
                        <td className="py-3 font-medium text-[#181a19]">
                          {tx.planName} ({tx.billingCycle})
                        </td>
                        <td className="py-3 capitalize text-[#181a19]/70">
                          {tx.channel.replace('_', ' ')}
                        </td>
                        <td className="py-3 font-mono font-bold text-[#16422b]">
                          {formatNaira(tx.amountNgn)}
                        </td>
                        <td className="py-3">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-emerald-100 text-[#16422b]">
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openSubscriptionReceipt(tx)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-[#16422b] hover:bg-[#16422b]/10 rounded-md transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Enterprise Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-[#181a19] border-b border-[#181a19]/10 pb-3">
            Enterprise Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Farm Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.farmName}
                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Managing Director / Lead Farmer *
              </label>
              <input
                type="text"
                required
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Primary State (Nigeria)
              </label>
              <input
                type="text"
                value={formData.primaryState}
                onChange={(e) => setFormData({ ...formData, primaryState: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Measurement Unit
              </label>
              <select
                value={formData.defaultUnit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultUnit: e.target.value as typeof formData.defaultUnit,
                  })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="hectares">Hectares (ha) - Standard Nigerian commercial</option>
                <option value="acres">Acres</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Cloud Firestore & Demo Management */}
      {activeTab === 'cloud' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#181a19] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#16422b]" />
                <span>Firebase & Cloud Firestore Integration Status</span>
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 text-[#16422b]">
                LIVE DATABASE CONNECTED
              </span>
            </div>

            <p className="text-xs text-[#181a19]/70 leading-relaxed">
              FarmPilot is authenticated with Google Firebase and synchronizes business records in real-time
              via Cloud Firestore. Multi-tenant organizational security rules isolate each agribusiness tenant.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono tabular-nums">
              <div className="p-3 bg-[#fafaf7] rounded-lg border border-[#181a19]/10">
                <span className="font-sans text-[11px] text-[#181a19]/50 block mb-0.5">Firebase Project</span>
                <span className="font-semibold text-[#181a19] text-xs">geometric-advantage-hsmzh</span>
              </div>

              <div className="p-3 bg-[#fafaf7] rounded-lg border border-[#181a19]/10">
                <span className="font-sans text-[11px] text-[#181a19]/50 block mb-0.5">Firestore Database</span>
                <span className="font-semibold text-[#16422b] text-xs truncate block" title="ai-studio-farmpilot-60084bcf-154f-419f-bf3b-e4ef9e75da40">
                  ai-studio-farmpilot...
                </span>
              </div>

              <div className="p-3 bg-[#fafaf7] rounded-lg border border-[#181a19]/10">
                <span className="font-sans text-[11px] text-[#181a19]/50 block mb-0.5">Organization ID</span>
                <span className="font-semibold text-[#181a19] text-xs">
                  {organization?.id || 'demo-org'}
                </span>
              </div>

              <div className="p-3 bg-[#fafaf7] rounded-lg border border-[#181a19]/10">
                <span className="font-sans text-[11px] text-[#181a19]/50 block mb-0.5">Email Verification</span>
                <span className={`font-semibold text-xs ${firebaseUser?.emailVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {firebaseUser?.emailVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#181a19] flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-700" />
              <span>Demo Data & Environment Reset</span>
            </h3>
            <p className="text-xs text-[#181a19]/70">
              Easily toggle or reset demonstration records to test different commercial farming scenarios or wipe
              the ledger clean for fresh production data.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetDemoData}
                className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
              >
                Reload Demonstration Data (Oyo Farm)
              </button>
              <button
                type="button"
                onClick={clearToEmptyData}
                className="px-3.5 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                Clear All Data to Clean Blank State
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
