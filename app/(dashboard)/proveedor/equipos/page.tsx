import { createClient } from "@/utils/supabase/server";
import { Wrench, ShieldCheck, FileText } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AddEquipmentForm } from "@/components/proveedor/AddEquipmentForm";
import { DocumentModal } from "@/components/proveedor/DocumentModal";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const REQ_EQUIP_IZAJE = [
  { id: 'SeguroEquipo', title: 'Seguro del Equipo', desc: 'Póliza vigente con cláusula de no repetición.' },
  { id: 'CertOperatividad', title: 'Certificado de Operatividad', desc: 'Vigencia máxima 1 año.' },
  { id: 'CertAccesorios', title: 'Certificado de Accesorios', desc: 'Eslingas, grilletes, fajas.' },
  { id: 'CheckList', title: 'Check List del Equipo', desc: 'Revisión técnica o mantenimiento.' },
];

const REQ_EQUIP_SUELO = [
  { id: 'SeguroEquipo', title: 'Seguro del Equipo', desc: 'Póliza vigente con cláusula de no repetición.' },
  { id: 'CheckList', title: 'Mantenimiento / Check List', desc: 'Revisión preventiva.' },
];

export default async function ProviderEquipmentPage({
  searchParams
}: {
  searchParams: { doc_equipment?: string }
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;

  const { data: roleData } = await supabase.from("user_roles").select("company_id, tenant_id").eq("email", user.email).single();
  const companyId = roleData?.company_id;
  const tenantId = roleData?.tenant_id;

  if (!companyId) return <div className="p-8 font-bold text-center text-rose-600">Error: No tienes una empresa asignada.</div>;

  const [
    { data: equipment },
    { data: documents }
  ] = await Promise.all([
    supabase.from("equipment").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
    supabase.from("documents").select("*").eq("company_id", companyId)
  ]);

  async function addEquipment(formData: FormData) {
    "use server";
    const internalId = formData.get("internalId") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const cId = formData.get("companyId") as string;
    
    const db = createClient();
    const { error } = await db.from("equipment").insert({
      company_id: cId,
      tenant_id: tenantId,
      internal_id: internalId.trim().toUpperCase(),
      category: category,
      description: description.trim(),
      status: "ACTIVE"
    });

    if (error) return { error: error.message };
    revalidatePath("/proveedor/equipos");
    return { success: true };
  }

  const selectedEquipment = searchParams.doc_equipment ? equipment?.find(e => e.id === searchParams.doc_equipment) : null;
  const reqList = selectedEquipment?.category === 'izaje' ? REQ_EQUIP_IZAJE : REQ_EQUIP_SUELO;

  function getComplianceStatus(entityId: string, category: string) {
    const entityDocs = (documents || []).filter((d: any) => d.equipment_id === entityId);
    const reqs = category === 'izaje' ? REQ_EQUIP_IZAJE : REQ_EQUIP_SUELO;
    let hasMissing = false;
    let hasRejected = false;
    let hasPending = false;

    for (const req of reqs) {
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
      
      {selectedEquipment && (
        <DocumentModal 
          title={`Documentos: ${selectedEquipment.description} (${selectedEquipment.internal_id})`}
          entityId={selectedEquipment.id}
          entityType="equipment"
          companyId={companyId}
          requirements={reqList}
          docs={documents || []}
          closeHref="/proveedor/equipos"
        />
      )}

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <Wrench className="w-8 h-8 text-blue-600" />
            Mis Equipos
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Gestión corporativa de grúas, maquinaria vial y equipos especiales.
          </p>
        </div>
      </div>

      <AddEquipmentForm companyId={companyId} addAction={addEquipment} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-b from-white to-slate-50">
          <h3 className="text-sm font-bold text-slate-800">Equipos Registrados</h3>
          <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
            {equipment?.length || 0} Equipos
          </span>
        </div>
        
        {!equipment || equipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50/30">
            <Wrench className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-600 font-bold text-sm">No tienes maquinaria registrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Categoría</th>
                  <th className="px-5 py-4">ID Interno</th>
                  <th className="px-5 py-4">Descripción</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipment.map((eq) => {
                  const status = getComplianceStatus(eq.id, eq.category);
                  return (
                    <tr key={eq.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {eq.category === "izaje" ? "🏗️ Izaje" : eq.category === "movimiento_suelo" ? "🚜 Mov. de Suelo" : "Otro"}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 uppercase">{eq.internal_id}</td>
                      <td className="px-5 py-4 font-medium text-slate-500">{eq.description}</td>
                      <td className="px-5 py-4">
                        <Badge status={status} />
                      </td>
                      <td className="px-5 py-4 text-right flex justify-end gap-2">
                        <Link 
                          href={`/proveedor/equipos?doc_equipment=${eq.id}`}
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
