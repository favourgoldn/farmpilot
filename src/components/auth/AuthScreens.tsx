import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Sprout,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';

export const AuthScreens: React.FC<{ mode: 'signin' | 'signup' }> = ({ mode }) => {
  const {
    setCurrentView,
    signUp,
    signIn,
    signInWithGoogle,
    sendPasswordReset,
    resetDemoData,
  } = useFarm();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    farmName: '',
    state: 'Oyo State',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signIn(formData.email, formData.password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.farmName,
        formData.state
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      await sendPasswordReset(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to dispatch reset email.');
    }
  };

  const handleLaunchDemo = () => {
    resetDemoData();
    setCurrentView('app');
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#16422b] hover:underline mx-auto mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to FarmPilot Overview</span>
        </button>

        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#16422b] text-white flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#143826]">FarmPilot</span>
        </div>

        <h2 className="mt-3 text-center text-lg font-bold tracking-tight text-[#181a19]">
          {mode === 'signin'
            ? 'Sign in to FarmPilot Operations'
            : 'Register Your Commercial Farm Estate'}
        </h2>
        <p className="mt-1 text-center text-xs text-[#181a19]/60">
          {mode === 'signin'
            ? 'Access real-time field ledgers and cloud profit intelligence'
            : 'Configure your cloud workspace with Firebase Authentication'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-[#181a19]/10 sm:rounded-2xl sm:px-10 space-y-5">
          {/* Error feedback */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 border border-[#181a19]/15 rounded-xl text-xs font-semibold text-[#181a19] bg-white hover:bg-[#fafaf7] transition-colors flex items-center justify-center gap-2.5 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#181a19]/10 w-full" />
            <span className="bg-white px-3 text-[11px] text-[#181a19]/40 uppercase tracking-wider relative shrink-0">
              Or with email
            </span>
          </div>

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Manager Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="manager@farm.ng"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-[#181a19]/80">Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(formData.email);
                      setIsResetModalOpen(true);
                      setResetSent(false);
                    }}
                    className="text-[11px] text-[#16422b] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Sign In to Dashboard</span>
              </button>

              <div className="pt-2 border-t border-[#181a19]/10">
                <button
                  type="button"
                  onClick={handleLaunchDemo}
                  className="w-full py-2 text-xs font-semibold text-amber-950 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition-colors text-center"
                >
                  Explore Demo Estate (No Sign-in Required)
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[#181a19]/60">Don't have an enterprise account? </span>
                <button
                  type="button"
                  onClick={() => setCurrentView('signup')}
                  className="font-semibold text-[#16422b] hover:underline"
                >
                  Register Farm
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Full Name (Farm Manager) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adebayo Ogunlesi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Farm Enterprise Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alafia Agro Holdings Ltd"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Primary Nigerian State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                >
                  <option value="Oyo State">Oyo State</option>
                  <option value="Ogun State">Ogun State</option>
                  <option value="Kaduna State">Kaduna State</option>
                  <option value="Benue State">Benue State</option>
                  <option value="Niger State">Niger State</option>
                  <option value="Ondo State">Ondo State</option>
                  <option value="Edo State">Edo State</option>
                  <option value="Kano State">Kano State</option>
                  <option value="Plateau State">Plateau State</option>
                  <option value="Other State">Other Nigerian State</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="adebayo@alafiafarms.ng"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#181a19]/80 mb-1">
                  Set Secure Password (min 6 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Cloud Account &rarr;</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-[#181a19]/60">Already registered? </span>
                <button
                  type="button"
                  onClick={() => setCurrentView('signin')}
                  className="font-semibold text-[#16422b] hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a19]/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-[#181a19]/10 p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-[#16422b]">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[#181a19]">Reset FarmPilot Password</h3>
            </div>
            <p className="text-xs text-[#181a19]/60">
              Enter your registered manager email. We will send a secure password reset link.
            </p>

            {resetSent ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs space-y-2">
                <p className="font-semibold">Reset Link Sent!</p>
                <p>Check your email inbox and follow the instructions to set a new password.</p>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="w-full mt-2 py-1.5 bg-[#16422b] text-white font-semibold rounded-lg text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-[#181a19]/80 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-3 py-1.5 text-[#181a19]/60 hover:text-[#181a19]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-semibold text-white bg-[#16422b] rounded-lg"
                  >
                    Send Reset Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
