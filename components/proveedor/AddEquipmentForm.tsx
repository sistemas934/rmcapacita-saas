"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AddEquipmentForm({ companyId, addAction }: { companyId: string, addAction: (formData: FormData) => Promise<{error?: string, success?: boolean}> }) {
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
          toast.success("Equipo agregado exitosamente");
          const elements = document.querySelectorAll('input[type="text"]');
          elements.forEach(el => (el as HTMLInputElement).value = '');
        }
      }}
    >
      <input type="hidden" name="companyId" value={companyId} />
      
      <div className="w-[200px] shrink-0">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
        <select name="category" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none">
          <option value="izaje">Equipos de Izaje</option>
          <option value="movimiento_suelo">Movimiento de Suelo</option>
          <option value="otro">Otro / General</option>
        </select>
      </div>
      <div className="w-[150px] shrink-0">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Interno / Patente</label>
        <input type="text" name="internalId" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none uppercase" placeholder="Ej. GRUA-01" />
      </div>
      <div className="w-full">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
        <input type="text" name="description" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none" placeholder="Ej. Grúa Liebherr 50T" />
      </div>
      
      <button disabled={loading} type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold px-6 py-2 rounded-lg flex items-center justify-center gap-2 h-[38px] shrink-0 transition-colors disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Agregar</>}
      </button>
    </form>
  );
}
