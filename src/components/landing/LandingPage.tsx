import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  MapPin,
  Menu,
  Play,
  Receipt,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Sprout,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { formatNaira, formatWeight } from '../../utils/finance';

export const LandingPage: React.FC = () => {
  const { setCurrentView, resetDemoData, clearToEmptyData } = useFarm();

  // Mobile & Tablet Navigation State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile nav on Escape or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileNavOpen) {
        setIsMobileNavOpen(false);
        hamburgerButtonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMobileNavOpen &&
        mobileNavRef.current &&
        !mobileNavRef.current.contains(e.target as Node) &&
        hamburgerButtonRef.current &&
        !hamburgerButtonRef.current.contains(e.target as Node)
      ) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileNavOpen]);

  // Interactive Crop Economics Calculator State
  const [calcCrop, setCalcCrop] = useState<'maize' | 'cassava' | 'tomatoes'>('maize');
  const [calcHectares, setCalcHectares] = useState(15);

  const CROP_BENCHMARKS = {
    maize: {
      name: 'Commercial Grain Maize (SC 719)',
      estYieldKgPerHa: 3000,
      pricePerKg: 480,
      inputCostPerHa: 280000, // Seed, NPK, Urea, herbicide, tractor tillage
    },
    cassava: {
      name: 'Industrial Cassava (TME-419)',
      estYieldKgPerHa: 20000,
      pricePerKg: 110,
      inputCostPerHa: 350000, // Stems, clearing, ridging, weeding, harvest haulage
    },
    tomatoes: {
      name: 'Open Field Roma Tomatoes',
      estYieldKgPerHa: 4500,
      pricePerKg: 420,
      inputCostPerHa: 520000, // Hybrid seeds, staking, fungicides, fertigation
    },
  };

  const currentCropBench = CROP_BENCHMARKS[calcCrop];
  const projectedYieldKg = currentCropBench.estYieldKgPerHa * calcHectares;
  const projectedRevenue = projectedYieldKg * currentCropBench.pricePerKg;
  const projectedCosts = currentCropBench.inputCostPerHa * calcHectares;
  const projectedNetResult = projectedRevenue - projectedCosts;
  const projectedMargin = (projectedNetResult / projectedRevenue) * 100;

  const handleLaunchDemo = () => {
    setIsMobileNavOpen(false);
    resetDemoData();
    setCurrentView('app');
  };

  const handleStartBlank = () => {
    setIsMobileNavOpen(false);
    clearToEmptyData();
    setCurrentView('onboarding');
  };

  const handleNavClick = (hash: string) => {
    setIsMobileNavOpen(false);
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#181a19] flex flex-col selection:bg-[#16422b]/15 selection:text-[#143826] overflow-x-hidden w-full">
      {/* 1. Header with Desktop Navigation and Mobile/Tablet Hamburger Menu */}
      <header className="sticky top-0 z-40 bg-[#fafaf7]/95 backdrop-blur-md border-b border-[#181a19]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Zone 1: Logo & Wordmark */}
          <a
            href="#"
            className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-[#143826] whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#16422b] text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <span>FarmPilot</span>
          </a>

          {/* Zone 2: Desktop Navigation Links (Visible on lg+ screens) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#181a19]/70">
            <a href="#features" className="hover:text-[#16422b] transition-colors whitespace-nowrap">
              Platform Features
            </a>
            <a href="#profit-engine" className="hover:text-[#16422b] transition-colors whitespace-nowrap">
              Profit Intelligence
            </a>
            <a href="#calculator" className="hover:text-[#16422b] transition-colors whitespace-nowrap">
              Margin Calculator
            </a>
            <a href="#pricing" className="hover:text-[#16422b] transition-colors whitespace-nowrap">
              Pricing Plans
            </a>
            <a href="#faq" className="hover:text-[#16422b] transition-colors whitespace-nowrap">
              FAQ
            </a>
          </nav>

          {/* Zone 3: Primary Actions & Mobile/Tablet Hamburger Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('signin')}
              className="hidden sm:inline-block px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#181a19] hover:text-[#16422b] transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
            <button
              onClick={handleLaunchDemo}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <span className="hidden sm:inline">Explore Live Demo</span>
              <span className="sm:hidden">Live Demo</span>
            </button>

            {/* Mobile/Tablet 3-Line Hamburger Button */}
            <button
              ref={hamburgerButtonRef}
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-[#181a19]/80 hover:text-[#16422b] hover:bg-[#181a19]/5 focus:outline-none focus:ring-2 focus:ring-[#16422b] focus:ring-offset-1 transition-all"
              aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileNavOpen}
            >
              {isMobileNavOpen ? (
                <X className="w-5 h-5 text-[#16422b]" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Menu Overlay */}
        {isMobileNavOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 top-16 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileNavOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-down touch-friendly menu panel */}
            <div
              ref={mobileNavRef}
              className="absolute left-0 right-0 top-16 z-50 bg-[#fafaf7] border-b border-[#181a19]/15 shadow-xl p-4 sm:p-6 lg:hidden animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
            >
              <div className="flex flex-col gap-2">
                <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#181a19]/50 flex items-center justify-between">
                  <span>Navigation Menu</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
                    Crops &bull; Poultry &bull; Mixed
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavClick('#features')}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/10 hover:border-[#16422b]/40 hover:bg-[#16422b]/5 focus:outline-none focus:ring-2 focus:ring-[#16422b] transition-all flex items-center justify-between"
                >
                  <span>Platform Features</span>
                  <ChevronRight className="w-4 h-4 text-[#16422b]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('#profit-engine')}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/10 hover:border-[#16422b]/40 hover:bg-[#16422b]/5 focus:outline-none focus:ring-2 focus:ring-[#16422b] transition-all flex items-center justify-between"
                >
                  <span>Profit Intelligence</span>
                  <ChevronRight className="w-4 h-4 text-[#16422b]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('#calculator')}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/10 hover:border-[#16422b]/40 hover:bg-[#16422b]/5 focus:outline-none focus:ring-2 focus:ring-[#16422b] transition-all flex items-center justify-between"
                >
                  <span>Margin Calculator</span>
                  <ChevronRight className="w-4 h-4 text-[#16422b]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('#pricing')}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/10 hover:border-[#16422b]/40 hover:bg-[#16422b]/5 focus:outline-none focus:ring-2 focus:ring-[#16422b] transition-all flex items-center justify-between"
                >
                  <span>Pricing Plans</span>
                  <ChevronRight className="w-4 h-4 text-[#16422b]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('#faq')}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-[#181a19] bg-white border border-[#181a19]/10 hover:border-[#16422b]/40 hover:bg-[#16422b]/5 focus:outline-none focus:ring-2 focus:ring-[#16422b] transition-all flex items-center justify-between"
                >
                  <span>FAQ</span>
                  <ChevronRight className="w-4 h-4 text-[#16422b]" />
                </button>

                {/* Mobile Authentication & Launch Actions */}
                <div className="pt-3 mt-2 border-t border-[#181a19]/10 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        setCurrentView('signin');
                      }}
                      className="w-full py-2.5 px-3 text-xs font-semibold text-[#181a19] bg-white hover:bg-[#fafaf7] border border-[#181a19]/15 rounded-xl transition-colors text-center"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        setCurrentView('signup');
                      }}
                      className="w-full py-2.5 px-3 text-xs font-semibold text-[#16422b] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors text-center"
                    >
                      Create Account
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleLaunchDemo}
                    className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs text-center flex items-center justify-center gap-2"
                  >
                    <span>Launch Ibadan Demo Farm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStartBlank}
                    className="w-full py-3 px-4 text-xs font-semibold text-[#181a19] bg-white hover:bg-[#fafaf7] border border-[#181a19]/15 rounded-xl transition-colors text-center"
                  >
                    Set Up My Live Farm
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="pt-10 pb-14 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24 border-b border-[#181a19]/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-center gap-2 text-xs text-[#16422b] font-semibold tracking-wide">
                <span>Tailored for Nigerian Crop, Poultry & Mixed Commercial Agro-Enterprises</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#181a19] leading-[1.2] sm:leading-[1.15]" style={{ textWrap: 'balance' }}>
                Stop Farming on Guesswork. Master Your True Net Profit.
              </h1>

              <p className="text-sm sm:text-base text-[#181a19]/70 leading-relaxed max-w-xl">
                FarmPilot gives Nigerian crop and poultry farmers unified command over field plots,
                livestock flocks, housing pens, feed rations, mortality tracking, and egg off-take sales.
                Recognize genuine net operating margins without double-counting inventory.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={handleLaunchDemo}
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-all shadow-sm hover:shadow text-center"
                >
                  <span>Launch Commercial Demo Farm</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <button
                  onClick={handleStartBlank}
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-[#181a19] bg-white border border-[#181a19]/15 hover:bg-[#fafaf7] rounded-xl transition-all text-center"
                >
                  <span>Set Up My Live Farm</span>
                </button>
              </div>

              {/* Micro Trust Indicators */}
              <div className="pt-4 border-t border-[#181a19]/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#181a19]/60">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16422b] shrink-0" />
                  <span>Crops & Poultry Unified</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16422b] shrink-0" />
                  <span>Strict Naira (₦) Accounting</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16422b] shrink-0" />
                  <span>Feed & Egg Reconciliation</span>
                </span>
              </div>
            </div>

            {/* Right Column: Hero High-Resolution Drone Photography */}
            <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden border border-[#181a19]/15 shadow-xl bg-white aspect-16/10">
                <img
                  src="/src/assets/images/farm_hero_landscape_1792508336724.jpg"
                  alt="Modern commercial grain farm in Nigeria under golden morning sunlight"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 sm:p-6">
                  <div className="text-white text-xs space-y-1">
                    <p className="font-semibold text-sm">Alafia Agro Holdings · 45 Hectares</p>
                    <p className="text-white/80 text-[11px] sm:text-xs">
                      Oyo State Commercial Corridor · Drip Irrigation & Mechanized Tillage
                    </p>
                  </div>
                </div>
              </div>

              {/* Float badge preview */}
              <div className="absolute -bottom-4 -left-2 sm:-bottom-5 sm:-left-5 bg-white border border-[#181a19]/15 rounded-xl p-2.5 sm:p-3 shadow-lg flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 text-[#16422b] flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
                  ₦
                </div>
                <div className="text-xs">
                  <span className="text-[#181a19]/60 block text-[10px] sm:text-xs">Recognized Net Margin</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-[#16422b]">+78.5% Realized</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-column KPI strip below hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-[#181a19]/10">
            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10">
              <span className="text-xs text-[#181a19]/60 block">Typical Input Savings</span>
              <span className="text-2xl font-bold font-mono text-[#181a19] block mt-1">
                ₦1.8M / ha
              </span>
              <span className="text-[11px] text-[#181a19]/50 block mt-0.5">
                Eliminating input misallocation
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10">
              <span className="text-xs text-[#181a19]/60 block">Yield Reconciliation</span>
              <span className="text-2xl font-bold font-mono text-[#16422b] block mt-1">
                100%
              </span>
              <span className="text-[11px] text-[#181a19]/50 block mt-0.5">
                Physical harvest to sales slip match
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10">
              <span className="text-xs text-[#181a19]/60 block">Cash vs Credit Audit</span>
              <span className="text-2xl font-bold font-mono text-[#181a19] block mt-1">
                Zero Leaks
              </span>
              <span className="text-[11px] text-[#181a19]/50 block mt-0.5">
                Off-taker receivables tracking
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#181a19]/10">
              <span className="text-xs text-[#181a19]/60 block">Regional Agricultural Support</span>
              <span className="text-2xl font-bold font-mono text-[#181a19] block mt-1">
                36 States
              </span>
              <span className="text-[11px] text-[#181a19]/50 block mt-0.5">
                Oyo, Ogun, Kaduna, Benue & Niger
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mechanism-to-Outcome Feature Tour */}
      <section id="features" className="py-16 lg:py-24 border-b border-[#181a19]/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-[#16422b] tracking-wider uppercase block mb-2">
              The FarmPilot Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#181a19] tracking-tight">
              Built from Ground Truth for Commercial Agriculture
            </h2>
            <p className="text-xs sm:text-sm text-[#181a19]/60 mt-2">
              Every workflow connects field activity to financial certainty, eliminating leakage
              between planting and produce off-take.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#fafaf7] border border-[#181a19]/10 hover:border-[#16422b]/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#16422b]/10 text-[#16422b] flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#181a19] mb-1">
                  1. Field & Parcel Blocks
                </h3>
                <p className="text-xs text-[#181a19]/70 leading-relaxed">
                  Map parcels by soil profile, irrigation type (drip vs rain-fed), and rotation
                  history to isolate performance block by block.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#181a19]/5 text-[11px] text-[#16422b] font-medium">
                Prevents field under-utilization
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#fafaf7] border border-[#181a19]/10 hover:border-[#16422b]/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#16422b]/10 text-[#16422b] flex items-center justify-center mb-4">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#181a19] mb-1">
                  2. Cost Ledger & Input Stocks
                </h3>
                <p className="text-xs text-[#181a19]/70 leading-relaxed">
                  Attribute seeds, NPK/Urea fertilizers, tractor diesel, and day-labor wages directly
                  to specific crop enterprises in Naira.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#181a19]/5 text-[11px] text-[#16422b] font-medium">
                Eliminates hidden overhead bleeding
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#fafaf7] border border-[#181a19]/10 hover:border-[#16422b]/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#16422b]/10 text-[#16422b] flex items-center justify-center mb-4">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#181a19] mb-1">
                  3. Yield & Retained Stock
                </h3>
                <p className="text-xs text-[#181a19]/70 leading-relaxed">
                  Log physical bags, crates, or metric tons from fields. Distinguishes unsold silo
                  stock from realized commercial sales.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#181a19]/5 text-[11px] text-[#16422b] font-medium">
                Zero revenue double-counting
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#fafaf7] border border-[#181a19]/10 hover:border-[#16422b]/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#16422b]/10 text-[#16422b] flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#181a19] mb-1">
                  4. Profit & Off-taker Audits
                </h3>
                <p className="text-xs text-[#181a19]/70 leading-relaxed">
                  Real-time Net Operating Result and crop gross margins. Track customer payment
                  balances and generate audit-ready statements.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#181a19]/5 text-[11px] text-[#16422b] font-medium">
                Complete financial clarity
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Visual Feature Spotlights & Profit Intelligence */}
      <section id="profit-engine" className="py-16 border-b border-[#181a19]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-[#16422b] tracking-wider uppercase">
                Field Agronomy Integration
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#181a19]">
                Empower Field Agronomists & Supervisors on the Ground
              </h2>
              <p className="text-xs sm:text-sm text-[#181a19]/70 leading-relaxed">
                Connect agronomists scouting maize tassels, cassava canopy growth, or tomato
                trellises directly to the farm management ledger. Log spray cycles, moisture
                levels, and harvest readiness before produce spoils.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleLaunchDemo}
                  className="text-xs font-semibold text-[#16422b] hover:underline flex items-center gap-1.5"
                >
                  <span>See How Field Tasks Work</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#181a19]/15 shadow-md aspect-4/3 bg-white">
              <img
                src="/src/assets/images/farm_agronomist_field_1792508338508.jpg"
                alt="Nigerian agronomist inspecting corn leaves with digital tablet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-8 border-t border-[#181a19]/10">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden border border-[#181a19]/15 shadow-md aspect-4/3 bg-white">
              <img
                src="/src/assets/images/farm_harvest_crates_1792508337456.jpg"
                alt="Freshly harvested tomatoes and golden maize sorted in wooden crates"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="order-1 lg:order-2 space-y-4">
              <span className="text-xs font-semibold text-[#16422b] tracking-wider uppercase">
                Harvest & Packhouse Reconciliation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#181a19]">
                Reconcile Field Crates with Weighbridge & Market Slips
              </h2>
              <p className="text-xs sm:text-sm text-[#181a19]/70 leading-relaxed">
                From harvest crates in the packhouse to 50kg grain sacks dispatched to processors in
                Ibadan or Mile 12 Lagos. Track delivery slips, invoice settlements, and unpaid customer
                credit seamlessly.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleLaunchDemo}
                  className="text-xs font-semibold text-[#16422b] hover:underline flex items-center gap-1.5"
                >
                  <span>View Harvest & Invoicing Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Crop Economics & Margin Calculator */}
      <section id="calculator" className="py-16 lg:py-24 border-b border-[#181a19]/10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-[#16422b] tracking-wider uppercase block mb-1">
              Interactive Tool
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#181a19] tracking-tight">
              Simulate Your Crop Enterprise Economics
            </h2>
            <p className="text-xs text-[#181a19]/60 mt-1">
              Test how acreage, yield benchmarks, and input costs impact your net operating outcome in
              Naira.
            </p>
          </div>

          <div className="bg-[#fafaf7] border border-[#181a19]/10 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Crop Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCalcCrop('maize')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  calcCrop === 'maize'
                    ? 'bg-[#16422b] text-white shadow-xs'
                    : 'bg-white border border-[#181a19]/15 text-[#181a19]'
                }`}
              >
                Yellow Grain Maize
              </button>
              <button
                onClick={() => setCalcCrop('cassava')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  calcCrop === 'cassava'
                    ? 'bg-[#16422b] text-white shadow-xs'
                    : 'bg-white border border-[#181a19]/15 text-[#181a19]'
                }`}
              >
                TME-419 Cassava Roots
              </button>
              <button
                onClick={() => setCalcCrop('tomatoes')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  calcCrop === 'tomatoes'
                    ? 'bg-[#16422b] text-white shadow-xs'
                    : 'bg-white border border-[#181a19]/15 text-[#181a19]'
                }`}
              >
                Roma Processing Tomatoes
              </button>
            </div>

            {/* Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#181a19]">
                  Cultivated Parcel Area: {calcHectares} Hectares
                </span>
                <span className="text-[#181a19]/50 font-mono">
                  {Math.round(calcHectares * 2.47)} Acres
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={calcHectares}
                onChange={(e) => setCalcHectares(parseInt(e.target.value))}
                className="w-full accent-[#16422b] cursor-pointer"
              />
            </div>

            {/* Calculation Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono tabular-nums text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#181a19]/10">
                <span className="font-sans text-[#181a19]/60 block mb-1">Projected Gross Yield</span>
                <p className="text-lg font-bold text-[#181a19]">{formatWeight(projectedYieldKg)}</p>
                <span className="font-sans text-[11px] text-[#181a19]/50 block mt-0.5">
                  @{formatNaira(currentCropBench.pricePerKg)}/kg benchmark
                </span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#181a19]/10">
                <span className="font-sans text-[#181a19]/60 block mb-1">
                  Estimated Input & Labor Outflow
                </span>
                <p className="text-lg font-bold text-[#d97706]">{formatNaira(projectedCosts)}</p>
                <span className="font-sans text-[11px] text-[#181a19]/50 block mt-0.5">
                  @{formatNaira(currentCropBench.inputCostPerHa)}/ha
                </span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#181a19]/10">
                <span className="font-sans text-[#181a19]/60 block mb-1">
                  Projected Net Operating Margin
                </span>
                <p className="text-lg font-bold text-[#16422b]">
                  {formatNaira(projectedNetResult)}
                </p>
                <span className="font-sans text-[11px] font-semibold text-[#16422b] block mt-0.5">
                  +{projectedMargin.toFixed(1)}% Net Margin
                </span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={handleLaunchDemo}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs"
              >
                Track This Crop in FarmPilot &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Plans in Nigerian Naira (₦) */}
      <section id="pricing" className="py-16 lg:py-24 border-b border-[#181a19]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-[#16422b] tracking-wider uppercase block mb-1">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#181a19] tracking-tight">
              Invest in Profit Intelligence That Pays for Itself
            </h2>
            <p className="text-xs text-[#181a19]/60 mt-1">
              Billed in Nigerian Naira with no hidden fees or overseas transaction charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Tier 1 */}
            <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#181a19]/60 uppercase tracking-wider block mb-2">
                  Smallholder & Cluster
                </span>
                <div className="flex items-baseline gap-1 font-mono tabular-nums mb-3">
                  <span className="text-2xl font-bold text-[#181a19]">₦15,000</span>
                  <span className="text-xs text-[#181a19]/50">/ month</span>
                </div>
                <p className="text-xs text-[#181a19]/70 mb-6">
                  For individual commercial growers with up to 10 hectares of grain or tubers.
                </p>

                <ul className="space-y-2.5 text-xs text-[#181a19]/80 border-t border-[#181a19]/5 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Up to 3 Field Parcel Blocks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Full Expense Ledger & Receipts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Basic Harvest & Sales Tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Single Manager Account</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleStartBlank}
                className="mt-8 w-full py-2.5 text-xs font-semibold text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-xl transition-colors"
              >
                Start Free Trial
              </button>
            </div>

            {/* Tier 2: Featured */}
            <div className="bg-white border-2 border-[#16422b] rounded-2xl p-6 shadow-md flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#16422b] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular for Outgrowers
              </div>

              <div>
                <span className="text-xs font-semibold text-[#16422b] uppercase tracking-wider block mb-2">
                  Commercial Outgrower
                </span>
                <div className="flex items-baseline gap-1 font-mono tabular-nums mb-3">
                  <span className="text-2xl font-bold text-[#181a19]">₦45,000</span>
                  <span className="text-xs text-[#181a19]/50">/ month</span>
                </div>
                <p className="text-xs text-[#181a19]/70 mb-6">
                  For mid-sized agricultural estates managing multiple crop cycles and off-taker
                  contracts.
                </p>

                <ul className="space-y-2.5 text-xs text-[#181a19]/80 border-t border-[#181a19]/5 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Unlimited Field Blocks & Hectares</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Profit Intelligence & Margin Audits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Off-taker Receivables Reconciliation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Up to 5 Team Seats (Agronomists/Supervisors)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>CSV Financial Statement Exports</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleLaunchDemo}
                className="mt-8 w-full py-2.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs"
              >
                Launch Outgrower Demo
              </button>
            </div>

            {/* Tier 3 */}
            <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#181a19]/60 uppercase tracking-wider block mb-2">
                  Agri-Corporate Estate
                </span>
                <div className="flex items-baseline gap-1 font-mono tabular-nums mb-3">
                  <span className="text-2xl font-bold text-[#181a19]">₦120,000</span>
                  <span className="text-xs text-[#181a19]/50">/ month</span>
                </div>
                <p className="text-xs text-[#181a19]/70 mb-6">
                  For large multi-location corporate farming ventures and processor aggregators.
                </p>

                <ul className="space-y-2.5 text-xs text-[#181a19]/80 border-t border-[#181a19]/5 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Multi-Farm Estate Hierarchy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Dedicated Cloud Firestore Schemas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Unlimited Agronomy Specialists</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16422b]" />
                    <span>Priority Nigerian Phone Support</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleLaunchDemo}
                className="mt-8 w-full py-2.5 text-xs font-semibold text-[#181a19] bg-[#fafaf7] hover:bg-[#181a19]/5 border border-[#181a19]/15 rounded-xl transition-colors"
              >
                Talk to Operations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-16 border-b border-[#181a19]/10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#181a19]">Frequently Asked Questions</h2>
            <p className="text-xs text-[#181a19]/60 mt-1">
              Common questions on financial accuracy, currency, and local farm workflows.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-[#181a19]/10 bg-[#fafaf7]">
              <h4 className="font-bold text-[#181a19] mb-1">
                How does FarmPilot calculate Net Operating Result?
              </h4>
              <p className="text-[#181a19]/70 leading-relaxed">
                Net Operating Result is strictly calculated as recognized sales revenue (invoiced
                produce dispatched) minus eligible operating expenditures (seed, fertilizer,
                mechanization, labor, and logistics). Retained unsold produce is never double-counted
                as revenue until off-take contracts are executed.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#181a19]/10 bg-[#fafaf7]">
              <h4 className="font-bold text-[#181a19] mb-1">
                Can I switch between Demo Data and my real farm records?
              </h4>
              <p className="text-[#181a19]/70 leading-relaxed">
                Yes! A prominent toggle is always available in the top bar. You can inspect the
                realistic Oyo Commercial Farm demo numbers anytime, or switch to a clean blank
                workspace for your real farm records in 1 click.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#181a19]/10 bg-[#fafaf7]">
              <h4 className="font-bold text-[#181a19] mb-1">
                Does FarmPilot support both Hectares and Acres?
              </h4>
              <p className="text-[#181a19]/70 leading-relaxed">
                Yes. While commercial growers in Nigeria typically standardize on hectares (ha), you
                can toggle between hectares and acres in your Farm Settings at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-10 bg-[#143826] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/70">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-bold text-white tracking-tight">FarmPilot</span>
            <span className="text-white/40">·</span>
            <span>Smart Farm Management & Profit Intelligence for Nigerian Agriculture</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={handleLaunchDemo}
              className="text-white hover:underline font-semibold"
            >
              Launch Demo
            </button>
            <button
              onClick={handleStartBlank}
              className="text-white hover:underline"
            >
              New Farm Setup
            </button>
            <span>&copy; {new Date().getFullYear()} FarmPilot Ltd. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
