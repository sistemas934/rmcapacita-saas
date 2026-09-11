"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Building2, Plus, ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdminPage() {
  const supabase = createClient();
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (data) setTenants(data);
  };

  const handleCreateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const adminEmail = formData.get("adminEmail") as string;
    
    try {
      // 1. Crear el Tenant
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({ name })
        .select()
        .single();
        
      if (tenantError) throw tenantError;

      // 2. Asignarle un administrador en user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          email: adminEmail,
          role: 'TENANT_ADMIN',
          tenant_id: newTenant.id
        });

      if (roleError) throw roleError;

      alert(`¡Cliente ${name} registrado! Pide al administrador (${adminEmail}) que cree su cuenta.`);
      e.currentTarget.reset();
      fetchTenants();
      
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">RMcapacita Console</h1>
              <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mt-1">SuperAdmin Level</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-2 bg-slate-700/50 hover:bg-rose-500/80 px-4 py-2 rounded-lg font-bold transition-all">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario Nuevo Cliente */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 h-fit shadow-xl">
            <h3 className="font-bold text-white flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-brand-primary" /> Dar de Alta un Cliente
            </h3>
            
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Nombre de la Empresa (Mandante)</label>
                <input name="name" required placeholder="Ej: Petrolera YPF" className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-brand-primary outline-none text-white transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Email del Administrador</label>
                <input name="adminEmail" type="email" required placeholder="gerente@ypf.com" className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-brand-primary outline-none text-white transition-colors" />
              </div>
              
              <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-xl mt-4">
                <p className="text-xs text-brand-primary/80 leading-relaxed font-medium">Al crear el cliente, el administrador asignado deberá ir a la pantalla de Login y hacer clic en "Crear Cuenta" usando ese correo exacto para acceder a su panel.</p>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3.5 rounded-xl text-sm flex justify-center items-center gap-2 transition-colors mt-2 shadow-lg shadow-brand-primary/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar Mandante"}
              </button>
            </form>
          </div>

          {/* Lista de Clientes */}
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-white">Clientes Activos (Tenants)</h3>
            </div>
            <div className="p-2 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/50 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Empresa Mandante</th>
                    <th className="px-6 py-4">Fecha de Alta</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {tenants.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No hay clientes registrados en la plataforma.</td></tr>
                  )}
                  {tenants.map(t => (
                    <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-5 font-bold text-white">{t.name}</td>
                      <td className="px-6 py-5 text-slate-400 font-mono text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-5">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">Activo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
