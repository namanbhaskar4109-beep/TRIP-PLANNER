import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openLoginModal,
    openRegisterModal,
    login,
    register,
    atlasStatus,
    openAtlasModal,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode from context
  useEffect(() => {
    setMode(authModalMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

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
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
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
        const res = await login(email.trim(), password);
        if (res.success) {
          setSuccessMsg('Welcome back! Signed in with MongoDB Atlas.');
        } else {
          setErrorMsg(res.message || 'Login failed. Please check your credentials.');
        }
      } else {
        const res = await register(name.trim(), email.trim(), password);
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

  const handleDemoFill = () => {
    setEmail('demo.traveler@tripplanner.com');
    setPassword('AtlasTrip2025!');
    setName('Alex Morgan');
    setConfirmPassword('AtlasTrip2025!');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
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
              title="Click to manage MongoDB Atlas configuration"
            >
              <Database className="w-3 h-3" />
              <span>{atlasStatus?.isConnected ? 'Atlas Connected' : 'Atlas Config'}</span>
            </button>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create Your Free Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Access saved travel itineraries synced to MongoDB Atlas'
              : 'Save itineraries, budgets, and stays directly to MongoDB Atlas'}
          </p>

          {/* Tab Switcher */}
          <div className="mt-4 flex p-1 bg-white/10 rounded-xl backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                openLoginModal();
                setErrorMsg(null);
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
                setMode('register');
                openRegisterModal();
                setErrorMsg(null);
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
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <span className="font-semibold block">Authentication Notice</span>
                <span className="text-[11px] leading-relaxed block">{errorMsg}</span>
                {errorMsg.includes('server on port 5000') && (
                  <span className="text-[10px] text-rose-800 font-mono mt-1 block bg-rose-100/70 p-1.5 rounded">
                    Run: npm run dev:all (starts both Vite and MongoDB Atlas backend)
                  </span>
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
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('Password reset is tied to your MongoDB Atlas user collection. You can register a new account or update directly in Atlas.')}
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
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength meter on register */}
            {mode === 'register' && password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>Password strength:</span>
                  <span className="font-bold">{passwordStrength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${
                      passwordStrength.score >= 1 ? 'w-1/3' : 'w-0'
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${
                      passwordStrength.score >= 2 ? 'w-1/3' : 'w-0'
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${
                      passwordStrength.score >= 3 ? 'w-1/3' : 'w-0'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password (Sign Up only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>
          )}

          {/* Remember Me & Demo Fill */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleDemoFill}
              className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 transition"
              title="Autofill demo credentials"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Fill Demo Details</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to MongoDB Atlas...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to TripPlanner' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info & toggle */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMsg(null);
            }}
            className="font-bold text-teal-600 hover:text-teal-700 transition"
          >
            {mode === 'login' ? 'Sign up for free' : 'Sign in here'}
          </button>
        </div>
      </div>
    </div>
  );
};
