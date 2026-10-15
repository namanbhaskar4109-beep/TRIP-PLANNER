import React from 'react';
import { Compass, Heart, Shield, Code, Sparkles, CloudSun, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-slate-900">
                Trip<span className="text-teal-600">Planner</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                Production MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              A responsive, client-side travel planning dashboard. Seamlessly explore accommodations ranked by your budget and interests, browse authentic nearby places, check real-time Open-Meteo weather, and track expenses with local persistence.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-teal-700 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Frontend-Only • No Paid APIs • LocalStorage Persistence</span>
            </div>
          </div>

          {/* Core Features */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Core Capabilities
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Smart Budget & Interest Ranking</li>
              <li>• Real-Time Open-Meteo Weather</li>
              <li>• Transparent Sample Data Labeling</li>
              <li>• Full Expense Category Breakdown</li>
              <li>• CSV Expense Data Export</li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Tech Stack
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• React 19 & TypeScript</li>
              <li>• Vite 8 Build Tooling</li>
              <li>• Tailwind CSS (v4 engine)</li>
              <li>• Lucide React Icons</li>
              <li>• Open-Meteo Free APIs</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Trip Planner. Built for effortless travel organization.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              Designed with care for modern travelers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
