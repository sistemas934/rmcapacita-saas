"use client";

import { Home, RefreshCw } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="h-16 bg-white/40 backdrop-blur-xl border-b border-white/50 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Home className="w-4 h-4 text-slate-400" />
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-bold tracking-tight">Dashboard Admin</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={handleRefresh}
          className="bg-white/60 hover:bg-white border border-white/80 text-slate-700 w-9 h-9 rounded-md flex items-center justify-center transition-all shadow-sm backdrop-blur-md"
          title="Recargar datos"
        >
          <RefreshCw className={`w-4 h-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
