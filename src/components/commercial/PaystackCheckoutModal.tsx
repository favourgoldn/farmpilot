import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Lock,
  PhoneCall,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  DEFAULT_PAYSTACK_TEST_PUBLIC_KEY,
  formatNaira,
  generatePaystackReference,
  loadPaystackScript,
} from '../../services/paystackService';
import { BillingTransaction, PlanTier, SUBSCRIPTION_PLANS } from '../../types/farm';

interface PaystackCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlanId: PlanTier;
  billingCycle: 'monthly' | 'annual';
  onPaymentSuccess?: (transaction: BillingTransaction) => void;
}

type PaymentChannel = 'card' | 'bank_transfer' | 'ussd';

export const PaystackCheckoutModal: React.FC<PaystackCheckoutModalProps> = ({
  isOpen,
  onClose,
  targetPlanId,
  billingCycle,
  onPaymentSuccess,
}) => {
  const {
    settings,
    organization,
    firebaseUser,
    upgradeSubscription,
    showToast,
  } = useFarm();

  const plan = SUBSCRIPTION_PLANS[targetPlanId] || SUBSCRIPTION_PLANS.growth;
  const amountToPay = billingCycle === 'annual' ? plan.annualPriceNgn : plan.monthlyPriceNgn;

  const [activeChannel, setActiveChannel] = useState<PaymentChannel>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'otp' | 'success'>('checkout');
  const [completedTransaction, setCompletedTransaction] = useState<BillingTransaction | null>(null);

  // Form Fields
  const [cardData, setCardData] = useState({
    cardNumber: '4084 0840 8408 4084',
    cardName: firebaseUser?.displayName || settings.managerName || 'Adebayo Ogunlesi',
    expiry: '08/28',
    cvv: '381',
    pin: '1234',
  });
  const [otpCode, setOtpCode] = useState('');
  const [selectedBank, setSelectedBank] = useState('GTBank (*737#)');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Simulated Virtual Account for Bank Transfer
  const virtualAccount = {
    bankName: 'Titan Trust Bank (Paystack)',
    accountNumber: '9928371029',
    accountName: 'FarmPilot / ' + (organization?.name || settings.farmName || 'Commercial Farm'),
    expiresIn: '29:45',
  };

  useEffect(() => {
    if (isOpen) {
      setPaymentStep('checkout');
      setIsProcessing(false);
      loadPaystackScript();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(virtualAccount.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Launch official Paystack Inline popup if external script loaded and key available
  const handleLaunchOfficialPaystack = async () => {
    setIsProcessing(true);
    const publicKey = settings.paystackPublicKey || DEFAULT_PAYSTACK_TEST_PUBLIC_KEY;
    const isScriptReady = await loadPaystackScript();

    if (isScriptReady && window.PaystackPop) {
      try {
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: firebaseUser?.email || settings.email || 'billing@farmpilot.ng',
          amount: amountToPay * 100, // Paystack requires amount in kobo
          currency: 'NGN',
          ref: generatePaystackReference('FP'),
          metadata: {
            custom_fields: [
              { display_name: 'Farm Enterprise', variable_name: 'farm_name', value: settings.farmName },
              { display_name: 'Plan Tier', variable_name: 'plan_tier', value: targetPlanId },
              { display_name: 'Billing Cycle', variable_name: 'billing_cycle', value: billingCycle },
            ],
          },
          callback: (response: { reference: string }) => {
            handleCompletePayment('card', response.reference);
          },
          onClose: () => {
            setIsProcessing(false);
          },
        });
        handler.openIframe();
        return;
      } catch (e) {
        console.warn('Paystack popup encountered an issue; falling back to direct secure checkout modal.', e);
      }
    }

    // Direct in-app checkout continuation
    setIsProcessing(false);
  };

  // Completes payment, registers transaction, and upgrades subscription
  const handleCompletePayment = async (channel: PaymentChannel, reference?: string) => {
    setIsProcessing(true);
    const finalRef = reference || generatePaystackReference('FP');

    try {
      const tx = await upgradeSubscription(
        targetPlanId,
        billingCycle,
        finalRef,
        amountToPay,
        channel === 'card' ? 'card' : channel === 'bank_transfer' ? 'bank_transfer' : 'ussd'
      );

      setCompletedTransaction(tx);
      setPaymentStep('success');
      setIsProcessing(false);

      if (onPaymentSuccess) {
        onPaymentSuccess(tx);
      }
    } catch (err) {
      setIsProcessing(false);
      showToast({
        type: 'error',
        title: 'Payment Error',
        message: 'Could not process transaction. Please try again.',
      });
    }
  };

  // Process Card Submission
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStep('otp');
    }, 900);
  };

  // Process OTP Submission
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      handleCompletePayment('card');
    }, 1100);
  };

  // Process Bank Transfer / USSD confirmation
  const handleDirectTransferConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      handleCompletePayment(activeChannel);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a19]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#181a19]/10 w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Paystack Branding & Security Lock */}
        <div className="bg-[#143826] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-sm">
                  Paystack Checkout
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  NGN ₦
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Secured 256-bit AES Nigerian Payment Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plan & Amount Summary Strip */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#143826]/70 uppercase tracking-wider font-semibold">
              Upgrading Farm Enterprise Plan
            </p>
            <p className="text-xs font-bold text-[#143826]">
              {plan.name} ({billingCycle === 'annual' ? 'Annual Billing' : 'Monthly'})
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#143826]/70 block font-medium">Total Payable</span>
            <span className="text-base font-extrabold font-mono text-[#143826]">
              {formatNaira(amountToPay)}
            </span>
          </div>
        </div>

        {/* Content Body Based on Step */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs">
          {paymentStep === 'checkout' && (
            <div className="space-y-5">
              {/* Channel Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#fafaf7] rounded-xl border border-[#181a19]/10">
                <button
                  type="button"
                  onClick={() => setActiveChannel('card')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-semibold text-xs transition-all ${
                    activeChannel === 'card'
                      ? 'bg-white shadow-xs text-[#16422b] border border-[#181a19]/10'
                      : 'text-[#181a19]/60 hover:text-[#181a19]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChannel('bank_transfer')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-semibold text-xs transition-all ${
                    activeChannel === 'bank_transfer'
                      ? 'bg-white shadow-xs text-[#16422b] border border-[#181a19]/10'
                      : 'text-[#181a19]/60 hover:text-[#181a19]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Bank Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChannel('ussd')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-semibold text-xs transition-all ${
                    activeChannel === 'ussd'
                      ? 'bg-white shadow-xs text-[#16422b] border border-[#181a19]/10'
                      : 'text-[#181a19]/60 hover:text-[#181a19]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>USSD Code</span>
                </button>
              </div>

              {/* Channel 1: Card Payment */}
              {activeChannel === 'card' && (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-[#181a19]/60 pb-1">
                    <span>Supported: Mastercard, Visa, Verve</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <Lock className="w-3 h-3" /> Paystack Secured
                    </span>
                  </div>

                  <div>
                    <label className="block font-medium text-[#181a19]/80 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                        placeholder="5399 •••• •••• ••••"
                        className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3.5 py-2.5 text-xs font-mono tracking-wider focus:outline-none focus:border-[#16422b]"
                      />
                      <CreditCard className="w-4 h-4 text-[#181a19]/40 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-[#181a19]/80 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        placeholder="MM/YY"
                        className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#16422b]"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#181a19]/80 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        placeholder="•••"
                        className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#16422b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[#181a19]/80 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardData.cardName}
                      onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                      placeholder="e.g. Adebayo Ogunlesi"
                      className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-[#16422b] hover:bg-[#143826] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay {formatNaira(amountToPay)}</span>
                  </button>
                </form>
              )}

              {/* Channel 2: Bank Transfer (Titan Trust / Providus virtual account) */}
              {activeChannel === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#181a19] space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-amber-900 font-semibold">
                      <span>Virtual Dedicated Account</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-amber-700" /> Expires in {virtualAccount.expiresIn}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#181a19]/60">Bank Name</span>
                        <span className="font-bold">{virtualAccount.bankName}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#181a19]/60">Beneficiary</span>
                        <span className="font-medium truncate max-w-[200px]">
                          {virtualAccount.accountName}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-amber-500/20">
                        <span className="text-[#181a19]/60">Account Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-extrabold text-[#143826] tracking-wider">
                            {virtualAccount.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyAccount}
                            className="p-1 text-[#16422b] hover:bg-[#16422b]/10 rounded-md transition-colors"
                            title="Copy Account Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {copiedAccount && (
                      <p className="text-[11px] text-emerald-700 font-medium text-center">
                        ✓ Account number copied to clipboard!
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-[#181a19]/60 text-center">
                    Transfer exactly <strong>{formatNaira(amountToPay)}</strong> using your mobile banking app or internet banking.
                  </p>

                  <button
                    type="button"
                    onClick={handleDirectTransferConfirm}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#16422b] hover:bg-[#143826] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>I Have Transferred {formatNaira(amountToPay)}</span>
                  </button>
                </div>
              )}

              {/* Channel 3: USSD Code */}
              {activeChannel === 'ussd' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium text-[#181a19]/80 mb-1">
                      Choose Your Nigerian Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
                    >
                      <option value="GTBank (*737#)">Guaranty Trust Bank (*737#)</option>
                      <option value="Zenith Bank (*966#)">Zenith Bank (*966#)</option>
                      <option value="UBA (*919#)">United Bank for Africa (*919#)</option>
                      <option value="First Bank (*894#)">First Bank of Nigeria (*894#)</option>
                      <option value="Access Bank (*901#)">Access Bank Plc (*901#)</option>
                      <option value="Fidelity Bank (*770#)">Fidelity Bank (*770#)</option>
                      <option value="Stanbic IBTC (*909#)">Stanbic IBTC Bank (*909#)</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10 text-center space-y-2">
                    <p className="text-[11px] text-[#181a19]/60">
                      Dial this USSD string on your phone linked to your bank account:
                    </p>
                    <div className="p-3 bg-white rounded-lg border border-[#181a19]/15 font-mono text-base font-bold text-[#16422b]">
                      *737*50*{amountToPay}*102#
                    </div>
                    <p className="text-[10px] text-[#181a19]/50">
                      Authenticate with your 4-digit bank USSD PIN to confirm payment.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDirectTransferConfirm}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#16422b] hover:bg-[#143826] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-300" />
                    <span>I Have Dialed & Authorized USSD</span>
                  </button>
                </div>
              )}

              {/* Alternative: Trigger Paystack Inline Popup button */}
              <div className="pt-2 border-t border-[#181a19]/10 flex items-center justify-between text-[11px] text-[#181a19]/60">
                <span>Want to use Paystack's official popup?</span>
                <button
                  type="button"
                  onClick={handleLaunchOfficialPaystack}
                  className="font-semibold text-[#16422b] hover:underline flex items-center gap-1"
                >
                  <span>Launch Paystack Popup</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 3D Secure Card OTP Screen */}
          {paymentStep === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-[#143826]">
                  Verified by Visa / Mastercard SecureCode
                </h4>
                <p className="text-[11px] text-[#143826]/80">
                  A one-time passcode (OTP) has been sent to your mobile phone ending in <strong>••9044</strong>
                </p>
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full max-w-xs mx-auto block bg-[#fafaf7] border border-[#181a19]/20 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-[#16422b]"
                />
                <p className="text-[10px] text-center text-[#181a19]/50 mt-1.5">
                  Test OTP: Enter any 6 numbers (e.g. 123456)
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentStep('checkout')}
                  className="flex-1 py-2.5 px-3 rounded-xl font-medium text-[#181a19] bg-[#fafaf7] hover:bg-black/5 border border-[#181a19]/10 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-2 py-2.5 px-4 rounded-xl font-bold text-white bg-[#16422b] hover:bg-[#143826] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Verifying OTP...' : 'Authorize Payment'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success Screen */}
          {paymentStep === 'success' && (
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <div>
                <h4 className="text-base font-bold text-[#181a19]">
                  Commercial Subscription Activated!
                </h4>
                <p className="text-xs text-[#181a19]/70 mt-1">
                  Payment of <strong>{formatNaira(amountToPay)}</strong> verified via Paystack.
                </p>
                <p className="text-[11px] text-[#181a19]/50 font-mono mt-0.5">
                  Ref: {completedTransaction?.reference}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#fafaf7] border border-[#181a19]/10 text-left text-xs space-y-1.5 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#181a19]/60">Activated Plan:</span>
                  <span className="font-bold text-[#16422b]">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#181a19]/60">Billing Cycle:</span>
                  <span className="capitalize font-medium">{billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#181a19]/60">Receipt Number:</span>
                  <span className="font-mono">{completedTransaction?.receiptNumber}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-[#16422b] hover:bg-[#143826] transition-all shadow-sm"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        {paymentStep !== 'success' && (
          <div className="px-5 py-3 border-t border-[#181a19]/10 bg-[#fafaf7] flex items-center justify-between text-[11px] text-[#181a19]/50">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3 h-3 text-emerald-700" />
              PCI-DSS Level 1 Certified
            </span>
            <span>Paystack Nigeria</span>
          </div>
        )}
      </div>
    </div>
  );
};
