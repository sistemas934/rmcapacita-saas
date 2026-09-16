"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AddEmployeeForm({ companyId, tenantId, addAction }: { companyId: string, tenantId: string, addAction: (formData: FormData) => Promise<{error?: string, success?: boolean}> }) {
  const [loading, setLoading] = useState(false);

  return (
    <form 
      className="bg-white border border-slate-200 p-6 rounded-xl mb-8 flex flex-col md:flex-row gap-4 items-end shadow-sm"
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
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Nombre</label>
        <input type="text" name="firstName" required className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm transition-all bg-slate-50 focus:bg-white" placeholder="Ej. Juan" />
      </div>
      <div className="w-full">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Apellido</label>
        <input type="text" name="lastName" required className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm transition-all bg-slate-50 focus:bg-white" placeholder="Ej. Pérez" />
      </div>
      <div className="w-full shrink-0">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">DNI</label>
        <input type="text" name="dni" required className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm transition-all bg-slate-50 focus:bg-white" placeholder="Ej. 30123456" />
      </div>
      
      <button disabled={loading} type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-2 rounded-md flex items-center justify-center gap-2 h-[38px] shrink-0 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Agregar</>}
      </button>
    </form>
  );
}
