import { Building, FileText, Clock, AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Badge } from "@/components/ui/Badge";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = createClient();

  // 1. Obtener quién está logueado y a qué Tenant pertenece
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;

  const { data: roleData } = await supabase.from('user_roles').select('*').eq('email', user.email).single();
  const tenantId = roleData?.tenant_id;

  if (!tenantId) return <div className="p-8">Error: No tienes un Tenant asignado. Comunicate con RMcapacita.</div>;

  // 2. Traer SOLO las empresas de este Tenant
  const { data: companiesList, error: errComp } = await supabase
    .from('companies')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  const numCompanies = companiesList?.length || 0;

  // 3. Traer SOLO los documentos de este Tenant
  const { data: documents, error: errDoc } = await supabase
    .from('documents')
    .select('status, company_id, companies!inner(tenant_id)')
    .eq('companies.tenant_id', tenantId);

  const docs = documents || [];
  
  // Helper to calculate company status
  function getCompanyStatus(companyId: string) {
    const compDocs = docs.filter(d => d.company_id === companyId);
    if (compDocs.length === 0) return "INCOMPLETO"; // or "NO_CARGADO"
    
    const hasRejected = compDocs.some(d => d.status === 'REJECTED' || d.status === 'EXPIRED');
    const hasPending = compDocs.some(d => d.status === 'PENDING');
    
    if (hasRejected) return "RECHAZADO";
    if (hasPending) return "PENDIENTE";
    return "APTO";
  }

  // Calcular métricas
  const numDocs = docs.length;
  const numPending = docs.filter(d => d.status === 'PENDING').length;
  const numRejected = docs.filter(d => d.status === 'REJECTED' || d.status === 'EXPIRED').length;

  const kpis = [
    { label: "Proveedores", value: numCompanies, icon: Building, color: "text-slate-400" },
    { label: "Documentos", value: numDocs, icon: FileText, color: "text-brand-primary" },
    { label: "En Revisión", value: numPending, icon: Clock, color: "text-semantic-warning" },
    { label: "Rechazados", value: numRejected, icon: AlertTriangle, color: "text-semantic-error" },
  ];

  const debugError = errComp || errDoc;

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      {debugError && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg font-bold">
          Error Supabase: {debugError.message || JSON.stringify(debugError)}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Main View Placeholder: Provider Grid & Chart */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Placeholder Gráfico */}
        <div className="w-full xl:w-1/3 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col min-h-[300px] justify-center items-center">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 self-start">
            <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
            Estado General
          </h3>
          <div className="text-slate-400 font-medium text-sm flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            Aún no hay datos suficientes
          </div>
        </div>

        {/* Directory Table */}
        <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">Directorio de Empresas</h3>
            <input 
              type="text" 
              placeholder="Buscar proveedor..." 
              className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary transition-all w-64"
            />
          </div>
          
          {numCompanies === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Building className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">No hay empresas registradas</p>
              <p className="text-slate-400 font-medium text-xs mt-1">Cuando los contratistas se registren, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">CUIT / RUT</th>
                    <th className="px-4 py-3">Ciudad</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companiesList?.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{company.legal_name}</td>
                      <td className="px-4 py-3">{company.tax_id}</td>
                      <td className="px-4 py-3">{company.city || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge status={getCompanyStatus(company.id)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a 
                          href={`/admin/empresa/${company.id}`}
                          className="text-brand-primary font-semibold hover:underline text-xs"
                        >
                          Ver Panel
                        </a>
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
  );
}
