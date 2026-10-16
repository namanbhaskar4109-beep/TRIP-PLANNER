import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  LogOut,
  Cloud,
  Database,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { TripPlan, Expense } from '../../types/trip';

interface UserMenuProps {
  currentTrip: TripPlan;
  currentExpenses: Expense[];
  onToast: (msg: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ currentTrip, currentExpenses, onToast }) => {
  const { user, logout, atlasStatus, openAtlasModal, syncTrip } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleSyncToAtlas = async () => {
    setIsSyncing(true);
    try {
      const res = await syncTrip(currentTrip, currentExpenses);
      if (res.success) {
        onToast(`Synced trip to ${currentTrip.destination} with MongoDB Atlas!`);
      } else {
        onToast(res.message || 'Failed to sync with MongoDB Atlas.');
      }
    } catch (err: any) {
      onToast(err.message || 'Sync error');
    } finally {
      setIsSyncing(false);
      setIsOpen(false);
    }
  };

  const isConnected = atlasStatus?.isConnected;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-2xs"
      >
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-7 h-7 rounded-lg object-cover ring-2 ring-teal-500/20"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
              isConnected ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
          />
        </div>
        <div className="hidden sm:block text-left">
          <span className="block text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
            {user.name}
          </span>
          <span className="block text-[10px] text-teal-600 font-semibold leading-none">
            {isConnected ? 'Atlas Cloud' : 'Atlas Offline'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-teal-500/30"
            />
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-slate-900 truncate">{user.name}</span>
              <span className="block text-[11px] text-slate-500 truncate">{user.email}</span>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-[10px] text-slate-500 font-medium">
                  {isConnected ? 'MongoDB Atlas Connected' : 'Atlas Config Needed'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-2 space-y-1">
            <button
              onClick={handleSyncToAtlas}
              disabled={isSyncing}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
              ) : (
                <Cloud className="w-4 h-4 text-teal-600" />
              )}
              <span>{isSyncing ? 'Syncing with Atlas...' : 'Sync Current Trip to Atlas'}</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                openAtlasModal();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>MongoDB Atlas Status</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-1" />

          {/* Sign Out */}
          <div className="p-2">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
                onToast('Signed out successfully.');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
