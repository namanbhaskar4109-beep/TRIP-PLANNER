import React, { useState, useEffect } from 'react';
import { useAuth, AuthMode } from '../../context/AuthContext';
import {
  Compass,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Database,
  KeyRound,
  ShieldCheck,
  MapPin,
  Sparkles,
  Plane,
  Loader2,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: AuthMode;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const {
    user,
    isAuthenticated,
    login,
    register,
    forgotPassword,
    resetUserPassword,
    navigateTo,
    resetTokenParam,
    atlasStatus,
    openAtlasModal,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
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

  // If already authenticated, redirect to home dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigateTo('/');
    }
  }, [isAuthenticated, user, navigateTo]);

  // Sync token if supplied in URL
  useEffect(() => {
    if (resetTokenParam) {
      setResetToken(resetTokenParam);
      setMode('reset-password');
    }
  }, [resetTokenParam]);

  // Password strength calculator
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

    // Client-side validations
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email format (e.g. traveler@example.com).');
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
        setErrorMsg('Please provide the reset token.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
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

    // Login or Register flow
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMsg('Please enter your full name (minimum 2 characters).');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
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
          setSuccessMsg('Welcome back! Signed in successfully.');
          navigateTo('/');
        } else {
          setErrorMsg(res.message || 'Login failed. Please check your credentials.');
        }
      } else {
        const res = await register(name.trim(), trimmedEmail, password);
        if (res.success) {
          setSuccessMsg('Account created successfully in MongoDB Atlas!');
          navigateTo('/');
        } else {
          setErrorMsg(res.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConnected = atlasStatus?.isConnected;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden font-sans">
      {/* Background Images & Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
          alt="Scenic Travel Destination"
          className="w-full h-full object-cover opacity-25 scale-105 transition-all duration-1000 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/40" />
        <div className="absolute inset-0 bg-radial from-teal-500/10 via-transparent to-slate-950/90" />
      </div>

      {/* Top Bar with Brand and Return Button */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <button
          onClick={() => navigateTo('/')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Planner</span>
        </button>

        {/* MongoDB Atlas Indicator */}
        <button
          onClick={openAtlasModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition cursor-pointer ${
            isConnected
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
          }`}
          title="Click to check MongoDB Atlas cloud status"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isConnected ? 'MongoDB Atlas Cloud' : 'Atlas Offline'}</span>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        </button>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl">
          
          {/* Left Hero Sidebar (Visible on LG screens) */}
          <div className="hidden lg:flex lg:col-span-5 p-8 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-teal-900/90 via-slate-900 to-slate-950 border-r border-white/10 text-white">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/30">
                  <Compass className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-white">
                    Trip<span className="text-teal-400">Planner</span>
                  </span>
                  <p className="text-[10px] text-teal-300/80 uppercase tracking-widest font-bold">
                    Atlas Cloud Sync
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <h3 className="text-2xl font-bold leading-snug">
                  Plan effortlessly. Travel authentically.
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join travelers crafting personalized itineraries with live weather, budget breakdowns, curated stays, and secure cloud sync.
                </p>
              </div>

              {/* Highlights List */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Secure HttpOnly cookie session management</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>MongoDB Atlas cloud persistence for all trips</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Brute-force protection & account lockouts</span>
                </div>
              </div>
            </div>

            {/* Bottom Testimonial / Badge */}
            <div className="pt-8 border-t border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-400/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-300">
                <strong className="block text-white">Production-Ready Auth</strong>
                <span>Bcrypt hashing & parameterized queries</span>
              </div>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="lg:col-span-7 p-6 sm:p-10 bg-white text-slate-900 flex flex-col justify-center">
            {/* Header Titles */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 lg:hidden">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                    <Compass className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <span className="font-extrabold text-lg text-slate-900">
                    Trip<span className="text-teal-600">Planner</span>
                  </span>
                </div>

                {/* Subtitle / Mode Badge */}
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200">
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot-password' && 'Password Recovery'}
                  {mode === 'reset-password' && 'Set New Password'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {mode === 'login' && 'Welcome back, traveler'}
                {mode === 'register' && 'Start your journey'}
                {mode === 'forgot-password' && 'Reset your password'}
                {mode === 'reset-password' && 'Create new password'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {mode === 'login' && 'Enter your credentials to access your trips and preferences.'}
                {mode === 'register' && 'Sign up for free to save itineraries and track expenses.'}
                {mode === 'forgot-password' && 'Enter your registered email and we will generate reset instructions.'}
                {mode === 'reset-password' && 'Enter your verified reset token and choose a secure new password.'}
              </p>

              {/* Mode Switcher Tabs (Login vs Register) */}
              {(mode === 'login' || mode === 'register') && (
                <div className="mt-4 flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <strong className="block font-bold">Authentication Notice</strong>
                  <span className="leading-relaxed block mt-0.5">{errorMsg}</span>
                  {errorMsg.includes('No account found') && (
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="mt-1.5 inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-800 underline cursor-pointer"
                    >
                      Click here to switch to Create Account →
                    </button>
                  )}
                  {errorMsg.includes('port 5000') && (
                    <div className="mt-1.5 p-2 bg-rose-100/70 rounded text-[11px] font-mono text-rose-900">
                      Run: npm run dev:all (or node server/server.js in a separate terminal)
                    </div>
                  )}
                </div>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                <div className="flex-1">
                  <strong className="block font-bold">Success</strong>
                  <span className="leading-relaxed block mt-0.5">{successMsg}</span>
                </div>
              </div>
            )}

            {/* Developer Test Token Helper Box (Only if token returned in dev) */}
            {devResetToken && mode === 'forgot-password' && (
              <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between text-teal-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                    <span>Reset Token Generated (Local Dev)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => switchMode('reset-password')}
                    className="text-xs text-teal-700 underline font-semibold hover:text-teal-800 cursor-pointer"
                  >
                    Proceed to Reset →
                  </button>
                </div>
                <div className="p-2 bg-white rounded-lg border border-teal-200 font-mono text-[11px] text-teal-900 break-all select-all">
                  {devResetToken}
                </div>
              </div>
            )}

            {/* Interactive Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              )}

              {/* Email Address (Login, Register, Forgot Password) */}
              {mode !== 'reset-password' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="traveler@example.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              )}

              {/* Reset Token Input (Only on reset-password mode) */}
              {mode === 'reset-password' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Reset Token</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste your 64-character reset token"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              )}

              {/* Password Input (Login, Register, Reset-Password) */}
              {mode !== 'forgot-password' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {mode === 'reset-password' ? 'New Password' : 'Password'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot-password')}
                        className="text-xs text-teal-600 hover:text-teal-700 font-semibold transition cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {(mode === 'register' || mode === 'reset-password') && password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
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

              {/* Confirm Password (Register and Reset-Password) */}
              {(mode === 'register' || mode === 'reset-password') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Autofill Demo Details button */}
              <div className="flex items-center justify-end pt-1">
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

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {mode === 'login' && 'Signing in with MongoDB Atlas...'}
                      {mode === 'register' && 'Creating your account...'}
                      {mode === 'forgot-password' && 'Generating reset token...'}
                      {mode === 'reset-password' && 'Updating password...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In to TripPlanner'}
                      {mode === 'register' && 'Create Free Account'}
                      {mode === 'forgot-password' && 'Send Password Reset Link'}
                      {mode === 'reset-password' && 'Save New Password'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Navigation Links */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              {mode === 'login' && (
                <>
                  <span>Don't have an account yet?</span>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-bold text-teal-600 hover:text-teal-700 transition cursor-pointer"
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
                    className="font-bold text-teal-600 hover:text-teal-700 transition cursor-pointer"
                  >
                    Sign in here
                  </button>
                </>
              )}

              {(mode === 'forgot-password' || mode === 'reset-password') && (
                <>
                  <span>Remember your credentials?</span>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-bold text-teal-600 hover:text-teal-700 transition cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
