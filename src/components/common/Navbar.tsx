import React from 'react';
import { Compass, RotateCcw, Sparkles, MapPin, Bookmark, Database, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserMenu } from '../auth/UserMenu';
import { TripPlan, Expense } from '../../types/trip';

interface NavbarProps {
  destination: string;
  savedPlacesCount: number;
  currentTrip: TripPlan;
  currentExpenses: Expense[];
  onResetToDemo: () => void;
  onScrollToSearch: () => void;
  onScrollToExpenses: () => void;
  onToast: (msg: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  destination,
  savedPlacesCount,
  currentTrip,
  currentExpenses,
  onResetToDemo,
  onScrollToSearch,
  onScrollToExpenses,
  onToast,
}) => {
  const { isAuthenticated, openLoginModal, openAtlasModal, atlasStatus } = useAuth();
  const isAtlasConnected = atlasStatus?.isConnected;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 flex-shrink-0">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Trip<span className="text-teal-600">Planner</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                  Atlas
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">
                Personalized Travel Itinerary & MongoDB Atlas Cloud
              </p>
            </div>
          </div>

          {/* Destination pill */}
          {destination && (
            <button
              onClick={onScrollToSearch}
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition"
              title="Click to change destination"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Current: <strong className="text-slate-900">{destination}</strong></span>
            </button>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* MongoDB Atlas Indicator Badge */}
            <button
              onClick={openAtlasModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isAtlasConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80'
              }`}
              title="Click to view or test MongoDB Atlas connection"
            >
              <Database className={`w-3.5 h-3.5 ${isAtlasConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span className="hidden sm:inline">
                {isAtlasConnected ? 'Atlas' : 'Atlas'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isAtlasConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
            </button>

            {savedPlacesCount > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
                <Bookmark className="w-3.5 h-3.5 fill-teal-600 text-teal-600" />
                <span>{savedPlacesCount} saved</span>
              </div>
            )}

            <button
              onClick={onScrollToExpenses}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition hidden md:inline-flex items-center gap-1.5 border border-slate-200"
            >
              <span>Budget</span>
            </button>

            <button
              onClick={onResetToDemo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
              title="Reset to default sample trip"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Authentication: User Profile Menu or Sign In Button */}
            {isAuthenticated ? (
              <UserMenu
                currentTrip={currentTrip}
                currentExpenses={currentExpenses}
                onToast={onToast}
              />
            ) : (
              <button
                onClick={openLoginModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-600" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={onScrollToSearch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Plan Trip</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
