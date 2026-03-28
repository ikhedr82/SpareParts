'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCcw, CheckCircle } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-rose-600 text-white px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500 sticky top-0 z-[100] shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <WifiOff className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-black text-sm tracking-tight">Offline Mode Active</p>
          <p className="text-[10px] text-rose-100 font-bold uppercase tracking-widest leading-none mt-1">
            Data being stored locally. Will sync when reconnected.
          </p>
        </div>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/20 transition-all"
      >
        Check Connection
      </button>
    </div>
  );
}

export function SyncStatusBar({ pendingCount = 0, isSyncing = false }) {
  if (pendingCount === 0 && !isSyncing) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4 bg-white/80 backdrop-blur-2xl border border-slate-200 p-4 rounded-3xl shadow-2xl shadow-indigo-200/50 animate-in fade-in slide-in-from-bottom-5 duration-700 group hover:scale-105 transition-transform">
      <div className={`p-3 rounded-2xl ${isSyncing ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-700 ring-4 ring-amber-50'}`}>
        {isSyncing ? (
          <RefreshCcw className="w-6 h-6 animate-spin" />
        ) : (
          <RefreshCcw className="w-6 h-6" />
        )}
      </div>
      <div>
        <p className="font-black text-slate-900 text-sm leading-none">
          {isSyncing ? 'Synchronizing Ecosystem...' : `${pendingCount} Local Changes`}
        </p>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
          {isSyncing ? 'Pushing encrypted batch to cloud' : 'Stored in secure local buffer'}
        </p>
      </div>
      {!isSyncing && pendingCount > 0 && (
        <div className="ml-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      )}
    </div>
  );
}
