import { createClient } from "@/utils/supabase/server";
import { Truck, ShieldCheck, Users, FileText } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AddVehicleForm } from "@/components/proveedor/AddVehicleForm";
import { DocumentModal } from "@/components/proveedor/DocumentModal";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const REQ_VEHICLE = [
  { id: 'SeguroVehiculo', title: 'Seguro Automotor', desc: 'Póliza vigente con cláusula de no repetición.' },
];

export default async function ProviderVehiclesPage({
  searchParams
}: {
  searchParams: { doc_vehicle?: string }
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;

  const { data: roleData } = await supabase.from("user_roles").select("company_id, tenant_id").eq("email", user.email).single();
  const companyId = roleData?.company_id;
  const tenantId = roleData?.tenant_id;

  if (!companyId) return <div className="p-8 font-bold text-center text-rose-600">Error: No tienes una empresa asignada.</div>;

  const [
    { data: vehicles },
    { data: documents }
  ] = await Promise.all([
    supabase.from("vehicles").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
    supabase.from("documents").select("*").eq("company_id", companyId)
  ]);

  async function addVehicle(formData: FormData) {
    "use server";
    const domain = formData.get("domain") as string;
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;
    const yearStr = formData.get("year") as string;
    const cId = formData.get("companyId") as string;
    
    const db = createClient();
    const { error } = await db.from("vehicles").insert({
      company_id: cId,
      domain: domain.trim().toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(yearStr) || new Date().getFullYear(),
      status: "ACTIVE"
    });

    if (error) return { error: error.message };
    revalidatePath("/proveedor/vehiculos");
    return { success: true };
  }

  const selectedVehicle = searchParams.doc_vehicle ? vehicles?.find(v => v.id === searchParams.doc_vehicle) : null;

  function getComplianceStatus(entityId: string) {
    const entityDocs = (documents || []).filter((d: any) => d.vehicle_id === entityId);
    let hasMissing = false;
    let hasRejected = false;
    let hasPending = false;

    for (const req of REQ_VEHICLE) {
      const doc = entityDocs.find((d: any) => d.document_type === req.id);
      if (!doc) {
        hasMissing = true;
      } else if (doc.status === 'REJECTED') {
        hasRejected = true;
      } else if (doc.status === 'PENDING') {
        hasPending = true;
      }
    }

    if (hasRejected) return "RECHAZADO";
    if (hasMissing) return "INCOMPLETO";
    if (hasPending) return "PENDIENTE";
    return "APTO";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {selectedVehicle && (
        <DocumentModal 
          title={`Documentos: ${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.domain})`}
          entityId={selectedVehicle.id}
          entityType="vehicle"
          companyId={companyId}
          requirements={REQ_VEHICLE}
          docs={documents || []}
          closeHref="/proveedor/vehiculos"
        />
      )}

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <Truck className="w-8 h-8 text-blue-600" />
            Flota de Vehículos
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Gestión corporativa de patentes y autorizaciones de ingreso.
          </p>
        </div>
      </div>

      <AddVehicleForm companyId={companyId} addAction={addVehicle} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-b from-white to-slate-50">
          <h3 className="text-sm font-bold text-slate-800">Unidades Registradas</h3>
          <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
            {vehicles?.length || 0} Vehículos
          </span>
        </div>
        
        {!vehicles || vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50/30">
            <Truck className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-600 font-bold text-sm">No tienes vehículos registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Patente</th>
                  <th className="px-5 py-4">Marca y Modelo</th>
                  <th className="px-5 py-4">Año</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((veh) => {
                  const status = getComplianceStatus(veh.id);
                  return (
                    <tr key={veh.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 font-bold text-slate-800 uppercase">{veh.domain}</td>
                      <td className="px-5 py-4 font-medium text-slate-500">{veh.brand} {veh.model}</td>
                      <td className="px-5 py-4 text-slate-500">{veh.year}</td>
                      <td className="px-5 py-4">
                        <Badge status={status} />
                      </td>
                      <td className="px-5 py-4 text-right flex justify-end gap-2">
                        <Link 
                          href={`/proveedor/vehiculos?doc_vehicle=${veh.id}`}
                          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-bold text-[11px] uppercase px-3 py-1.5 rounded-md border border-slate-200 hover:border-blue-200 transition-all shadow-sm group-hover:shadow"
                        >
                          <FileText className="w-3.5 h-3.5" /> Documentación
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
