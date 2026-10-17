import React, { useState, useEffect } from 'react';
import { useAuth, AuthMode } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  X,
  Compass,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  KeyRound,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openLoginModal,
    openRegisterModal,
    openForgotPasswordModal,
    login,
    register,
    forgotPassword,
    resetUserPassword,
    atlasStatus,
    openAtlasModal,
    resetTokenParam,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(resetTokenParam || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode from context
  useEffect(() => {
    setMode(authModalMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  // Sync reset token if provided
  useEffect(() => {
    if (resetTokenParam) {
      setResetToken(resetTokenParam);
    }
  }, [resetTokenParam]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', width: 'w-1/3' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500', width: 'w-2/3' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const passwordStrength = getPasswordStrength(password);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleFillDemo = () => {
    setEmail('traveler@tripplanner.com');
    setPassword('AtlasTrip2025!');
    setName('Alex Morgan');
    setConfirmPassword('AtlasTrip2025!');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot-password') {
      setIsSubmitting(true);
      try {
        const res = await forgotPassword(trimmedEmail);
        if (res.success) {
          setSuccessMsg(res.message);
          if (res.resetToken) {
            setDevResetToken(res.resetToken);
            setResetToken(res.resetToken);
          }
        } else {
          setErrorMsg(res.message || 'Failed to request password reset.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === 'reset-password') {
      if (!resetToken.trim()) {
        setErrorMsg('Please enter the reset token.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await resetUserPassword(resetToken.trim(), password);
        if (res.success) {
          setSuccessMsg(res.message);
          setTimeout(() => {
            switchMode('login');
          }, 2000);
        } else {
          setErrorMsg(res.message || 'Password reset failed.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to reset password.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Login & Register
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMsg('Please enter your full name (at least 2 characters).');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await login(trimmedEmail, password);
        if (res.success) {
          setSuccessMsg('Welcome back! Signed in with MongoDB Atlas.');
        } else {
          setErrorMsg(res.message || 'Login failed. Please check your credentials.');
        }
      } else {
        const res = await register(name.trim(), trimmedEmail, password);
        if (res.success) {
          setSuccessMsg('Account created successfully in MongoDB Atlas!');
        } else {
          setErrorMsg(res.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              Trip<span className="text-teal-400">Planner</span>
            </span>

            {/* Atlas Status Pill */}
            <button
              type="button"
              onClick={openAtlasModal}
              className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                atlasStatus?.isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
              }`}
              title="Click to view MongoDB Atlas status"
            >
              <Database className="w-3 h-3" />
              <span>{atlasStatus?.isConnected ? 'Atlas Cloud' : 'Atlas Offline'}</span>
            </button>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'forgot-password' && 'Reset Password'}
            {mode === 'reset-password' && 'Enter New Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Access saved travel itineraries synced to MongoDB Atlas'}
            {mode === 'register' && 'Save itineraries, budgets, and stays directly to MongoDB Atlas'}
            {mode === 'forgot-password' && 'Enter your email to receive password reset instructions'}
            {mode === 'reset-password' && 'Set a new password for your account'}
          </p>

          {/* Tab Switcher (Login vs Register) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="mt-4 flex p-1 bg-white/10 rounded-xl backdrop-blur-xs">
              <button
                type="button"
                onClick={() => {
                  switchMode('login');
                  openLoginModal();
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  switchMode('register');
                  openRegisterModal();
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <span className="font-semibold block">Notice</span>
                <span className="text-[11px] leading-relaxed block">{errorMsg}</span>
                {errorMsg.includes('No account found') && (
                  <button
                    type="button"
                    onClick={() => {
                      switchMode('register');
                      openRegisterModal();
                    }}
                    className="mt-1.5 inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-800 underline cursor-pointer"
                  >
                    Click here to switch to Create Account →
                  </button>
                )}
                {errorMsg.includes('port 5000') && (
                  <div className="mt-1.5 p-1.5 bg-rose-100/70 rounded text-[10px] font-mono text-rose-900">
                    Run: npm run dev:all (or node server/server.js)
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Dev reset token banner */}
          {devResetToken && mode === 'forgot-password' && (
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between text-teal-800 font-bold">
                <span>Reset Token Generated</span>
                <button
                  type="button"
                  onClick={() => switchMode('reset-password')}
                  className="text-teal-700 underline hover:text-teal-900"
                >
                  Set New Password →
                </button>
              </div>
              <p className="font-mono text-[10px] bg-white p-1.5 rounded border border-teal-200 select-all break-all">
                {devResetToken}
              </p>
            </div>
          )}

          {/* Full Name (Sign Up only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          {mode !== 'reset-password' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>
          )}

          {/* Reset Token Input */}
          {mode === 'reset-password' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Reset Token</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste reset token here"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>
          )}

          {/* Password */}
          {mode !== 'forgot-password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {mode === 'reset-password' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      switchMode('forgot-password');
                      openForgotPasswordModal();
                    }}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold transition"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {(mode === 'register' || mode === 'reset-password') && password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>Password strength:</span>
                    <span className="font-bold text-slate-700">{passwordStrength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirm Password */}
          {(mode === 'register' || mode === 'reset-password') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Autofill Demo Details button */}
          <div className="flex items-center justify-end pt-0.5">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 transition cursor-pointer"
              title="Autofill test credentials"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Fill Sample Credentials</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to TripPlanner'}
                  {mode === 'register' && 'Create Free Account'}
                  {mode === 'forgot-password' && 'Request Reset Instructions'}
                  {mode === 'reset-password' && 'Save New Password'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info & toggle */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {mode === 'login' && (
            <>
              <span>Don't have an account?</span>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-bold text-teal-600 hover:text-teal-700 transition"
              >
                Sign up for free
              </button>
            </>
          )}

          {mode === 'register' && (
            <>
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-teal-600 hover:text-teal-700 transition"
              >
                Sign in here
              </button>
            </>
          )}

          {(mode === 'forgot-password' || mode === 'reset-password') && (
            <>
              <span>Back to credentials?</span>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-teal-600 hover:text-teal-700 transition"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
