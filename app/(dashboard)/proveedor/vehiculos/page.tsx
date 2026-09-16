import { createClient } from "@/utils/supabase/server";
import { Truck, ShieldCheck, Users, FileText } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AddVehicleForm } from "@/components/proveedor/AddVehicleForm";
import { DocumentModal } from "@/components/proveedor/DocumentModal";
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
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Truck className="w-8 h-8 text-brand-primary" />
            Flota de Vehículos
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Registra camionetas, autos y camiones de tu empresa.
          </p>
        </div>
      </div>

      <AddVehicleForm companyId={companyId} addAction={addVehicle} />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">Mis Vehículos</h3>
          <span className="bg-brand-primary/10 text-brand-primary font-bold text-xs px-2.5 py-1 rounded-full">
            {vehicles?.length || 0} Registrados
          </span>
        </div>
        
        {!vehicles || vehicles.length === 0 ? (
          <div className="text-center py-16">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">No tienes vehículos registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Patente</th>
                  <th className="px-6 py-4">Marca y Modelo</th>
                  <th className="px-6 py-4">Año</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehicles.map((veh) => (
                  <tr key={veh.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 uppercase">{veh.domain}</td>
                    <td className="px-6 py-4 font-medium text-slate-500">{veh.brand} {veh.model}</td>
                    <td className="px-6 py-4 text-slate-500">{veh.year}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link 
                        href={`/proveedor/vehiculos?doc_vehicle=${veh.id}`}
                        className="inline-flex items-center gap-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold text-[11px] uppercase px-3 py-1.5 rounded border border-brand-primary/20 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Docs
                      </Link>
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
