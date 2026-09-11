"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, UserPlus, Shield, Loader2 } from "lucide-react";

export default function OperariosPage() {
  const supabase = createClient();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: company } = await supabase.from('companies').select('id').limit(1).single();
    if (company) {
      setCompanyId(company.id);
      const { data: emps } = await supabase.from('employees').select('*').eq('company_id', company.id).order('created_at', { ascending: false });
      if (emps) setEmployees(emps);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const dni = formData.get("dni") as string;
    
    try {
      const { error } = await supabase.from('employees').insert({
        company_id: companyId,
        full_name: `${first_name} ${last_name}`,
        document_id: dni
      });

      if (error) {
        if (error.code === '23505') throw new Error("Ya existe un operario con este DNI.");
        throw error;
      }
      
      e.currentTarget.reset();
      await fetchData();
      alert("¡Operario registrado con éxito!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-4">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-brand-primary" />
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Nómina de Operarios</h2>
          <p className="text-slate-500 text-sm">Gestiona el personal autorizado para ingresar a planta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-brand-primary" /> Nuevo Operario
          </h3>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase">Nombre</label>
              <input name="first_name" required className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase">Apellido</label>
              <input name="last_name" required className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase">DNI</label>
              <input name="dni" required className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none" />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 rounded-lg text-sm flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar Persona"}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Nombre Completo</th>
                <th className="px-6 py-4 font-bold">DNI</th>
                <th className="px-6 py-4 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No hay operarios registrados en tu nómina.</td></tr>
              )}
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800">{emp.full_name}</td>
                  <td className="px-6 py-4 font-medium">{emp.document_id}</td>
                  <td className="px-6 py-4">
                    <span className="bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20 px-2 py-1 rounded text-xs font-bold">
                      Documentación Pendiente
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
