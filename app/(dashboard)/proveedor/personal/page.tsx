import { createClient } from "@/utils/supabase/server";
import { Users, Info, ShieldCheck, Plus, Loader2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AddEmployeeForm } from "@/components/proveedor/AddEmployeeForm";

export const dynamic = 'force-dynamic';

export default async function ProviderPersonalPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;

  const { data: roleData } = await supabase.from('user_roles').select('company_id, tenant_id').eq('email', user.email).single();
  const companyId = roleData?.company_id;
  const tenantId = roleData?.tenant_id;

  if (!companyId) return <div className="p-8 font-bold text-center text-rose-600">Error: No tienes una empresa asignada.</div>;

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  async function addEmployee(formData: FormData) {
    "use server";
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const dni = formData.get("dni") as string;
    const cId = formData.get("companyId") as string;
    const tId = formData.get("tenantId") as string;
    
    const db = createClient();
    await db.from('employees').insert({
      company_id: cId,
      full_name: `${firstName} ${lastName}`.trim(),
      document_id: dni,
      status: 'active'
    });
    revalidatePath('/proveedor/personal');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-primary" />
            Personal Autorizado
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Administra la nómina de operarios de tu empresa.
          </p>
        </div>
      </div>

      <AddEmployeeForm companyId={companyId} tenantId={tenantId} addAction={addEmployee} />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">Mi Nómina</h3>
          <span className="bg-brand-primary/10 text-brand-primary font-bold text-xs px-2.5 py-1 rounded-full">
            {employees?.length || 0} Registros
          </span>
        </div>
        
        {!employees || employees.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">No tienes operarios asignados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">DNI</th>
                  <th className="px-6 py-4 text-right">Estado Inicial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{emp.full_name}</td>
                    <td className="px-6 py-4 font-medium text-slate-500">{emp.document_id}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 bg-semantic-success/10 text-semantic-success font-bold text-[10px] uppercase px-2.5 py-1 rounded-full border border-semantic-success/20">
                        <ShieldCheck className="w-3 h-3" /> Registrado
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
  );
}
