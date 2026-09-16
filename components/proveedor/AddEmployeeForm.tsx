"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AddEmployeeForm({ companyId, tenantId, addAction }: { companyId: string, tenantId: string, addAction: (formData: FormData) => Promise<{error?: string, success?: boolean}> }) {
  const [loading, setLoading] = useState(false);

  return (
    <form 
      className="bg-white border border-slate-200 p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-end shadow-sm"
      action={async (formData) => {
        setLoading(true);
        const res = await addAction(formData);
        setLoading(false);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Empleado agregado exitosamente");
          // Clear form (could use a ref, but resetting inputs works)
          const elements = document.querySelectorAll('input[type="text"]');
          elements.forEach(el => (el as HTMLInputElement).value = '');
        }
      }}
    >
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="tenantId" value={tenantId} />
      
      <div className="w-full">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
        <input type="text" name="firstName" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none" placeholder="Ej. Juan" />
      </div>
      <div className="w-full">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apellido</label>
        <input type="text" name="lastName" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none" placeholder="Ej. Pérez" />
      </div>
      <div className="w-full">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">DNI</label>
        <input type="text" name="dni" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none" placeholder="Ej. 30123456" />
      </div>
      
      <button disabled={loading} type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold px-6 py-2 rounded-lg flex items-center justify-center gap-2 h-[38px] min-w-[140px] transition-colors disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Agregar</>}
      </button>
    </form>
  );
}
