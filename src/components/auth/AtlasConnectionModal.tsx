import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Server,
  Zap,
} from 'lucide-react';

export const AtlasConnectionModal: React.FC = () => {
  const { atlasStatus, isCheckingAtlas, isAtlasModalOpen, closeAtlasModal, refreshAtlasStatus, testUri } = useAuth();
  const [customUri, setCustomUri] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);

  if (!isAtlasModalOpen) return null;

  const handleCopyExample = () => {
    navigator.clipboard.writeText(
      'mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tripplanner?retryWrites=true&w=majority'
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUri.trim()) return;

    setTesting(true);
    setTestResult(null);
    try {
      const res = await testUri(customUri.trim());
      setTestResult({
        success: res.success,
        message: res.message,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const isConnected = atlasStatus?.isConnected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">MongoDB Atlas Integration</h2>
              <p className="text-xs text-emerald-100">Live cloud database status & connection manager</p>
            </div>
          </div>
          <button
            onClick={closeAtlasModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 transition ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base">
                  {isConnected ? 'MongoDB Atlas Cluster Connected' : 'MongoDB Atlas Setup Required'}
                </span>
                <button
                  onClick={refreshAtlasStatus}
                  disabled={isCheckingAtlas}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white font-medium border border-slate-200 shadow-xs transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isCheckingAtlas ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isConnected ? (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/50">
                    <span className="text-slate-500 block">Host Cluster</span>
                    <strong className="text-slate-800 truncate block">{atlasStatus?.clusterHost || 'Atlas'}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/50">
                    <span className="text-slate-500 block">Database</span>
                    <strong className="text-slate-800 block">{atlasStatus?.databaseName || 'tripplanner'}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/50">
                    <span className="text-slate-500 block">Latency</span>
                    <strong className="text-emerald-700 block">{atlasStatus?.lastPingMs ? `${atlasStatus.lastPingMs}ms` : 'Healthy'}</strong>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  {atlasStatus?.error ||
                    'Your application is ready to connect to MongoDB Atlas. Follow the 4 steps below or test your connection URI.'}
                </p>
              )}
            </div>
          </div>

          {/* Test URI Form */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              <span>Test Atlas Connection String</span>
            </h3>
            <form onSubmit={handleTestConnection} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={customUri}
                  onChange={(e) => setCustomUri(e.target.value)}
                  placeholder="mongodb+srv://user:password@cluster0.xxx.mongodb.net/tripplanner..."
                  className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-xs"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-500">
                  You can also set this in <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">.env</code> as <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">MONGODB_URI</code>
                </p>
                <button
                  type="submit"
                  disabled={testing || !customUri.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                  <span>{testing ? 'Testing...' : 'Test & Connect'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </form>
          </div>

          {/* Step-by-Step Atlas Setup Guide */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              How to get your MongoDB Atlas URI:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Create Free Cluster</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Go to{' '}
                  <a
                    href="https://cloud.mongodb.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    cloud.mongodb.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and deploy a free <strong>M0 Shared Cluster</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Allow Network Access</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Go to <strong>Network Access</strong> → <strong>Add IP Address</strong> → select <strong>Allow Access from Anywhere</strong> (<code className="font-mono text-teal-700">0.0.0.0/0</code>).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Create Database User</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Go to <strong>Database Access</strong> → <strong>Add New Database User</strong> with username & password (Built-in role: Read and write to any database).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Copy Connection String</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Click <strong>Connect</strong> → <strong>Drivers</strong> → Node.js → copy your URI and paste it into <code className="font-mono text-teal-700">.env</code>.
                </p>
              </div>
            </div>

            {/* Example Box */}
            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl font-mono text-[11px] relative flex items-center justify-between">
              <span className="truncate pr-8 select-all">
                MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/tripplanner
              </span>
              <button
                onClick={handleCopyExample}
                className="text-slate-400 hover:text-white p-1 rounded transition"
                title="Copy URI pattern"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            TripPlanner with MongoDB Atlas Cluster Cloud Storage
          </span>
          <button
            onClick={closeAtlasModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
