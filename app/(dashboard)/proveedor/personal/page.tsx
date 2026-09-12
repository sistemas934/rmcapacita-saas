import { createClient } from "@/utils/supabase/server";
import { Users, Info, ShieldCheck } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProviderPersonalPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;

  const { data: roleData } = await supabase.from('user_roles').select('company_id').eq('email', user.email).single();
  const companyId = roleData?.company_id;

  if (!companyId) return <div className="p-8 font-bold text-center text-rose-600">Error: No tienes una empresa asignada.</div>;

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Users className="w-8 h-8 text-brand-primary" />
          Personal Autorizado
        </h2>
        <p className="text-slate-500 font-medium mt-2 text-sm">
          Consulta la nómina de operarios que el Administrador ha habilitado para tu empresa.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <strong>Aviso:</strong> El alta de nuevo personal la realiza exclusivamente la empresa mandante (Administrador). Si un operario no aparece en esta lista, por favor solicita su alta a tu contacto administrativo.
        </p>
      </div>

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
