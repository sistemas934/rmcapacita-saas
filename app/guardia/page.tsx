"use client";

import { useState } from "react";
import { ShieldHalf, LogOut, QrCode, Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

type ScanStatus = "IDLE" | "LOADING" | "ALLOWED" | "DENIED";

export default function GuardScanner() {
  const [status, setStatus] = useState<ScanStatus>("IDLE");
  const [inputVal, setInputVal] = useState("");

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal) return;
    
    setStatus("LOADING");
    
    // Simulate Supabase API Call
    setTimeout(() => {
      // Trick for simulation: If input has '1', allow. Otherwise, deny.
      if (inputVal.includes("1")) {
        setStatus("ALLOWED");
      } else {
        setStatus("DENIED");
      }
    }, 800);
  };

  const resetScanner = () => {
    setStatus("IDLE");
    setInputVal("");
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 selection:bg-brand-primary selection:text-white">
      {/* Mobile-first Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm shrink-0">
        <div className="px-5 py-4 flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm">
              <ShieldHalf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-none tracking-tight">Control Accesos</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Puesto 1 - Guardia</p>
            </div>
          </div>
          <Link href="/login" className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center transition-all border border-slate-200" title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto p-5 flex flex-col gap-4 mt-2">
        
        {/* State 1: IDLE or LOADING */}
        {status === "IDLE" || status === "LOADING" ? (
          <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-slate-200 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 text-center">
              Verificar Ingreso
            </h2>
            
            {/* Placeholder for QR Camera */}
            <div className="w-full aspect-square bg-slate-900 rounded-2xl mb-6 flex flex-col items-center justify-center text-slate-600 shadow-inner">
              <QrCode className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-50">Cámara Inactiva</p>
            </div>

            <form onSubmit={handleScan} className="flex flex-col gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                  <Search className="w-6 h-6" />
                </div>
                <input 
                  type="text" 
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={status === "LOADING"}
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-0 focus:border-brand-primary outline-none transition-all font-black text-2xl text-center uppercase tracking-widest placeholder:text-slate-400 placeholder:normal-case placeholder:font-semibold placeholder:text-lg text-slate-900 shadow-inner"
                  placeholder="DNI o Patente..."
                />
              </div>
              
              <div className="flex gap-3">
                <button type="button" className="bg-slate-900 hover:bg-slate-800 text-white w-16 rounded-2xl shadow-md transition-all flex items-center justify-center active:scale-95 shrink-0" title="Activar Cámara">
                  <QrCode className="w-6 h-6" />
                </button>
                <button 
                  type="submit" 
                  disabled={status === "LOADING"}
                  className="flex-1 btn-primary py-4 rounded-2xl shadow-md transition-all active:scale-95 text-lg font-black h-16"
                >
                  {status === "LOADING" ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Buscando...
                    </span>
                  ) : "Buscar"}
                </button>
              </div>
            </form>
          </div>
        ) : 

        /* State 2: ALLOWED */
        status === "ALLOWED" ? (
          <div className="bg-semantic-success rounded-[2rem] p-6 shadow-lg shadow-semantic-success/30 text-white text-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-5 backdrop-blur-sm border-4 border-white/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tight leading-none mb-6 drop-shadow-md">
              ACCESO<br/>AUTORIZADO
            </h2>
            
            <div className="bg-white text-slate-900 rounded-2xl p-5 text-left shadow-lg">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Operario</p>
              <p className="text-2xl font-black leading-tight">Juan Carlos Perez</p>
              <p className="text-sm font-semibold text-slate-500 mt-1">Soldador Especializado</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Contratista</p>
                <p className="text-brand-primary font-black text-lg leading-tight truncate">TechCorp S.R.L.</p>
              </div>
            </div>
            
            <button onClick={resetScanner} className="mt-6 w-full bg-white/20 hover:bg-white/30 text-white font-bold py-4 rounded-xl backdrop-blur-sm transition-colors">
              Escanear Siguiente
            </button>
          </div>
        ) : 

        /* State 3: DENIED */
        (
          <div className="bg-semantic-error rounded-[2rem] p-6 shadow-lg shadow-semantic-error/30 text-white text-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-5 backdrop-blur-sm border-4 border-white/30">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tight leading-none mb-6 drop-shadow-md">
              ACCESO<br/>DENEGADO
            </h2>
            
            <div className="bg-white text-slate-900 rounded-2xl p-5 text-left shadow-lg">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Operario</p>
              <p className="text-xl font-black text-slate-800 leading-tight">Martin Gómez</p>
              <p className="text-sm font-semibold text-slate-500 mt-1">TechCorp S.R.L.</p>
              
              <div className="bg-semantic-error/10 border-l-4 border-semantic-error p-4 rounded-r-xl mt-5">
                <p className="text-semantic-error font-bold text-sm leading-snug flex gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> 
                  Documentación vencida: Certificado de Altura expirado hace 2 días.
                </p>
              </div>
            </div>
            
            <button onClick={resetScanner} className="mt-6 w-full bg-white/20 hover:bg-white/30 text-white font-bold py-4 rounded-xl backdrop-blur-sm transition-colors">
              Escanear Siguiente
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
