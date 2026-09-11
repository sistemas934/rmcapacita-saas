"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Truck, Plus, Loader2 } from "lucide-react";

export default function VehiculosPage() {
  const supabase = createClient();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: company } = await supabase.from('companies').select('id').limit(1).single();
    if (company) {
      setCompanyId(company.id);
      const { data: vehs } = await supabase.from('vehicles').select('*').eq('company_id', company.id).order('created_at', { ascending: false });
      if (vehs) setVehicles(vehs);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const plate_number = formData.get("plate_number") as string;
    const vehicle_type = formData.get("vehicle_type") as string;
    const brand = formData.get("brand") as string;
    
    try {
      const { error } = await supabase.from('vehicles').insert({
        company_id: companyId,
        plate_number: plate_number.toUpperCase(),
        vehicle_type,
        brand
      });

      if (error) {
        if (error.code === '23505') throw new Error("Ya existe un vehículo con esta patente en tu empresa.");
        throw error;
      }
      
      e.currentTarget.reset();
      await fetchData();
      alert("¡Vehículo registrado con éxito!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-4">
      <div className="flex items-center gap-3">
        <Truck className="w-8 h-8 text-brand-primary" />
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Flota de Vehículos</h2>
          <p className="text-slate-500 text-sm">Registra camionetas y maquinaria pesada autorizada para ingresar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-brand-primary" /> Nuevo Vehículo
          </h3>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase">Patente (Dominio)</label>
              <input name="plate_number" required className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none uppercase" placeholder="AB123CD" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase">Tipo</label>
              <select name="vehicle_type" required className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none">
                <option value="Camioneta 4x4">Camioneta 4x4</option>
                <option value="Camión">Camión</option>
                <option value="Máquina Vial">Máquina Vial</option>
                <option value="Auto Sedán">Auto Sedán</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase">Marca / Modelo</label>
              <input name="brand" required className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none" placeholder="Toyota Hilux" />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 rounded-lg text-sm flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar Vehículo"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Patente</th>
                <th className="px-6 py-4 font-bold">Vehículo</th>
                <th className="px-6 py-4 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No hay vehículos registrados.</td></tr>
              )}
              {vehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800 uppercase">{v.plate_number}</td>
                  <td className="px-6 py-4 font-medium">{v.brand} ({v.vehicle_type})</td>
                  <td className="px-6 py-4">
                    <span className="bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20 px-2 py-1 rounded text-xs font-bold">
                      Doc. Pendiente
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
