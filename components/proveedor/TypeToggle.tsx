"use client";

import { useOptimistic, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TypeToggle({ 
  companyId, 
  initialType, 
  toggleAction 
}: { 
  companyId: string, 
  initialType: string, 
  toggleAction: (formData: FormData) => Promise<{error?: string, success?: boolean}>
}) {
  const [isPending, startTransition] = useTransition();
  
  const [optimisticType, addOptimisticType] = useOptimistic(
    initialType,
    (state: string, newType: string) => newType
  );

  return (
    <div className="flex bg-slate-100 p-1 rounded-lg relative">
      {isPending && <div className="absolute -left-6 top-1/2 -translate-y-1/2"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>}
      <form action={(formData) => {
        startTransition(async () => {
          addOptimisticType("relacion_dependencia");
          const res = await toggleAction(formData);
          if (res?.error) toast.error(res.error);
        });
      }}>
        <input type="hidden" name="companyId" value={companyId} />
        <input type="hidden" name="provider_type" value="relacion_dependencia" />
        <button type="submit" disabled={isPending} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${optimisticType === "relacion_dependencia" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Relación de Dependencia
        </button>
      </form>
      
      <form action={(formData) => {
        startTransition(async () => {
          addOptimisticType("autonomo");
          const res = await toggleAction(formData);
          if (res?.error) toast.error(res.error);
        });
      }}>
        <input type="hidden" name="companyId" value={companyId} />
        <input type="hidden" name="provider_type" value="autonomo" />
        <button type="submit" disabled={isPending} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${optimisticType === "autonomo" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Trabajador Autónomo
        </button>
      </form>
    </div>
  );
}
