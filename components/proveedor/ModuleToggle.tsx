"use client";

import { useOptimistic, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ModuleToggle({ 
  modKey, 
  label, 
  color, 
  companyId, 
  initialState, 
  toggleAction 
}: { 
  modKey: string, 
  label: string, 
  color: string, 
  companyId: string, 
  initialState: boolean,
  toggleAction: (formData: FormData) => Promise<{error?: string, success?: boolean}>
}) {
  const [isPending, startTransition] = useTransition();
  
  // Interfaz Optimista: Cambia al instante en la pantalla
  const [optimisticState, addOptimisticState] = useOptimistic(
    initialState,
    (state: boolean, newState: boolean) => newState
  );

  return (
    <form action={(formData) => {
      startTransition(async () => {
        addOptimisticState(!optimisticState);
        const res = await toggleAction(formData);
        if (res?.error) toast.error(res.error);
      });
    }}>
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="modulo" value={modKey} />
      <input type="hidden" name="estado" value={optimisticState ? "false" : "true"} />
      
      <button 
        type="submit" 
        className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group text-left ${optimisticState ? "border-brand-primary/50 bg-brand-primary/5 shadow-sm" : "border-slate-200 hover:border-brand-primary/30 hover:bg-slate-50"}`}
      >
        <div className="mt-0.5 relative flex items-center justify-center">
          {isPending ? (
            <Loader2 className={`w-4 h-4 animate-spin ${color}`} />
          ) : (
            <input 
              type="checkbox" 
              checked={optimisticState} 
              readOnly 
              className={`w-4 h-4 rounded border-slate-300 transition-all cursor-pointer ${color}`} 
            />
          )}
        </div>
        <div>
          <span className={`block text-sm font-bold transition-colors ${optimisticState ? "text-brand-primary" : "text-slate-700 group-hover:text-brand-primary"}`}>
            {label}
          </span>
          <span className="block text-[10px] text-slate-500 mt-0.5">Módulo extra</span>
        </div>
      </button>
    </form>
  );
}
