import { createClient } from "@/utils/supabase/server";
import { UserPlus, Users, Hash, Briefcase } from "lucide-react";
import { revalidatePath } from "next/cache";

// Server action to add employee
async function addEmployee(formData: FormData) {
  "use server";
  const fullName = formData.get("fullName") as string;
  const documentId = formData.get("documentId") as string;
  const companyId = formData.get("companyId") as string;
  
  if (!fullName || !documentId || !companyId) return;

  const supabase = createClient();
  await supabase.from("employees").insert({
    company_id: companyId,
    full_name: fullName,
    document_id: documentId
  });

  revalidatePath("/admin/personal");
}

export const dynamic = 'force-dynamic';

export default async function PersonalPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;

  const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('email', user.email).single();
  const tenantId = roleData?.tenant_id;

  if (!tenantId) return <div className="p-8">Error: No tienes un Tenant asignado.</div>;

  // Traer empresas para el dropdown
  const { data: companies } = await supabase.from('companies').select('id, legal_name').eq('tenant_id', tenantId);

  // Traer empleados de las empresas del tenant
  const { data: employees } = await supabase
    .from('employees')
    .select('*, companies!inner(tenant_id, legal_name)')
    .eq('companies.tenant_id', tenantId)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Users className="w-8 h-8 text-brand-primary" />
          Personal Autorizado
        </h2>
        <p className="text-slate-500 font-medium mt-2 text-sm">
          Registra a los trabajadores (operarios) y asígnalos a su respectiva empresa contratista para que puedan ingresar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Alta */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand-primary" /> Alta de Operario
            </h3>
            
            <form action={addEmployee} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Empresa Contratista</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <select 
                    name="companyId" 
                    required 
                    className="pl-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  >
                    <option value="">Seleccione una empresa...</option>
                    {companies?.map(c => (
                      <option key={c.id} value={c.id}>{c.legal_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Nombre Completo</label>
                <input 
                  type="text" 
                  name="fullName" 
                  required 
                  placeholder="Ej: Juan Carlos Perez"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">DNI / Documento</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="documentId" 
                    required 
                    placeholder="Ej: 33123456"
                    className="pl-9 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4">
                Registrar Operario
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Personal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Nómina Global de Operarios</h3>
              <span className="bg-brand-primary/10 text-brand-primary font-bold text-xs px-2.5 py-1 rounded-full">
                {employees?.length || 0} Registros
              </span>
            </div>
            
            {!employees || employees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold text-sm">No hay operarios registrados aún.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Nombre Completo</th>
                      <th className="px-6 py-4">DNI</th>
                      <th className="px-6 py-4">Empresa (Contratista)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{emp.full_name}</td>
                        <td className="px-6 py-4 font-medium">{emp.document_id}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase px-2.5 py-1 rounded-md">
                            {emp.companies.legal_name}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
