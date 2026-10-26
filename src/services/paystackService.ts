import { BillingTransaction, PlanTier, SUBSCRIPTION_PLANS, SubscriptionInfo } from '../types/farm';

export const DEFAULT_PAYSTACK_TEST_PUBLIC_KEY = 'pk_test_d34a4918f6236b3f71c48202976bc8f4fa24b917';

export interface PaystackInlineOptions {
  key: string;
  email: string;
  amount: number; // in kobo (NGN * 100)
  ref: string;
  currency?: string;
  channels?: string[];
  metadata?: Record<string, unknown>;
  onSuccess: (response: { reference: string; trxref: string; status?: string; message?: string }) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => {
        openIframe: () => void;
      };
    };
  }
}

let paystackScriptPromise: Promise<boolean> | null = null;

export function loadPaystackScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.PaystackPop) return Promise.resolve(true);
  if (paystackScriptPromise) return paystackScriptPromise;

  paystackScriptPromise = new Promise((resolve) => {
    // Check if script element already exists in document
    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.warn('Paystack inline.js script could not be loaded from external CDN; using built-in interactive simulator.');
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return paystackScriptPromise;
}

export function generatePaystackReference(prefix = 'FP'): string {
  const datePart = new Date().toISOString().replace(/\D/g, '').slice(2, 12);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-PSTK-${datePart}-${randomSuffix}`;
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `FP-REC-${year}-${rand}`;
}

export function calculatePeriodDates(billingCycle: 'monthly' | 'annual') {
  const now = new Date();
  const start = now.toISOString();

  const endDate = new Date(now);
  if (billingCycle === 'annual') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  return {
    currentPeriodStart: start,
    currentPeriodEnd: endDate.toISOString(),
  };
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}
