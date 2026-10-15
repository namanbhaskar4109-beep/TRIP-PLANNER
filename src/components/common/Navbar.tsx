import React from 'react';
import { Compass, RotateCcw, Sparkles, MapPin, Bookmark } from 'lucide-react';

interface NavbarProps {
  destination: string;
  savedPlacesCount: number;
  onResetToDemo: () => void;
  onScrollToSearch: () => void;
  onScrollToExpenses: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  destination,
  savedPlacesCount,
  onResetToDemo,
  onScrollToSearch,
  onScrollToExpenses,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Trip<span className="text-teal-600">Planner</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                  MVP
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">
                Personalized Travel Itinerary & Budget Manager
              </p>
            </div>
          </div>

          {/* Quick Info & Destination pill */}
          {destination && (
            <button
              onClick={onScrollToSearch}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition"
              title="Click to change destination"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Current: <strong className="text-slate-900">{destination}</strong></span>
            </button>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {savedPlacesCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
                <Bookmark className="w-3.5 h-3.5 fill-teal-600 text-teal-600" />
                <span>{savedPlacesCount} saved</span>
              </div>
            )}

            <button
              onClick={onScrollToExpenses}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition hidden sm:inline-flex items-center gap-1.5 border border-slate-200"
            >
              <span>Budget & Expenses</span>
            </button>

            <button
              onClick={onResetToDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
              title="Reset to default sample trip"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              onClick={onScrollToSearch}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plan New Trip</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
