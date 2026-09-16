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
    { label: "Proveedores", value: numCompanies, icon: Building, color: "text-slate-500", gradient: "from-slate-500 to-slate-700" },
    { label: "Documentos", value: numDocs, icon: FileText, color: "text-blue-500", gradient: "from-blue-600 to-indigo-600" },
    { label: "En Revisión", value: numPending, icon: Clock, color: "text-amber-500", gradient: "from-amber-500 to-orange-500" },
    { label: "Rechazados", value: numRejected, icon: AlertTriangle, color: "text-rose-500", gradient: "from-rose-500 to-red-600" },
  ];

  const debugError = errComp || errDoc;

  return (
    <div className="space-y-6">
      
      {debugError && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg font-bold border border-red-200">
          Error Supabase: {debugError.message || JSON.stringify(debugError)}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="relative bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow overflow-hidden group">
            {/* Top Gradient Accent */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${kpi.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
            
            <div className="flex justify-between items-start mb-2 mt-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <h3 className="text-4xl font-black text-slate-800 tracking-tight mt-2">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Main View Placeholder: Provider Grid & Chart */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Placeholder Gráfico */}
        <div className="w-full xl:w-1/3 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col min-h-[300px]">
          <h3 className="text-sm font-bold text-slate-800 mb-8 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            Estado General
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-medium text-sm">
            <div className="w-32 h-32 rounded-full border-[12px] border-slate-50 flex items-center justify-center mb-4 relative shadow-inner bg-white">
              <div className="absolute inset-0 rounded-full border-t-[12px] border-blue-500 opacity-20 rotate-45"></div>
              <span className="text-3xl text-slate-300">📊</span>
            </div>
            Aún no hay datos suficientes
          </div>
        </div>

        {/* Directory Table */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[300px]">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-b from-white to-slate-50">
            <h3 className="text-sm font-bold text-slate-800">Directorio de Empresas</h3>
            <input 
              type="text" 
              placeholder="Buscar proveedor..." 
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all w-64 shadow-sm"
            />
          </div>
          
          {numCompanies === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 bg-slate-50/30">
              <Building className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-600 font-bold text-sm">No hay empresas registradas</p>
              <p className="text-slate-400 font-medium text-xs mt-1">Cuando los contratistas se registren, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4">Empresa</th>
                    <th className="px-5 py-4">CUIT / RUT</th>
                    <th className="px-5 py-4">Ciudad</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companiesList?.map((company) => (
                    <tr key={company.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 font-bold text-slate-800">{company.legal_name}</td>
                      <td className="px-5 py-4 font-medium">{company.tax_id}</td>
                      <td className="px-5 py-4 text-slate-500">{company.city || '-'}</td>
                      <td className="px-5 py-4">
                        <Badge status={getCompanyStatus(company.id)} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a 
                          href={`/admin/empresa/${company.id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all opacity-80 group-hover:opacity-100"
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
