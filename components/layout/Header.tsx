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
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Home className="w-4 h-4 text-slate-400" />
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-bold">Dashboard Admin</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={handleRefresh}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 w-9 h-9 rounded-lg flex items-center justify-center transition-all shadow-sm"
          title="Recargar datos"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
