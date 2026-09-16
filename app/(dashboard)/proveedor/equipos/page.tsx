import { createClient } from "@/utils/supabase/server";
import { Wrench, ShieldCheck } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AddEquipmentForm } from "@/components/proveedor/AddEquipmentForm";

export const dynamic = "force-dynamic";

export default async function ProviderEquipmentPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;

  const { data: roleData } = await supabase.from("user_roles").select("company_id, tenant_id").eq("email", user.email).single();
  const companyId = roleData?.company_id;
  const tenantId = roleData?.tenant_id;

  if (!companyId) return <div className="p-8 font-bold text-center text-rose-600">Error: No tienes una empresa asignada.</div>;

  const { data: equipment } = await supabase.from("equipment").select("*").eq("company_id", companyId).order("created_at", { ascending: false });

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
      status: "active"
    });

    if (error) return { error: error.message };
    revalidatePath("/proveedor/equipos");
    return { success: true };
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Wrench className="w-8 h-8 text-brand-primary" />
            Mis Equipos
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Registra grúas, maquinaria vial, elevadores u otros equipos especiales.
          </p>
        </div>
      </div>

      <AddEquipmentForm companyId={companyId} addAction={addEquipment} />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">Equipos Registrados</h3>
          <span className="bg-brand-primary/10 text-brand-primary font-bold text-xs px-2.5 py-1 rounded-full">
            {equipment?.length || 0} Registrados
          </span>
        </div>
        
        {!equipment || equipment.length === 0 ? (
          <div className="text-center py-16">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">No tienes maquinaria registrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">ID Interno</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {equipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {eq.category === "izaje" ? "🏗️ Izaje" : eq.category === "movimiento_suelo" ? "🚜 Mov. de Suelo" : "Otro"}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 uppercase">{eq.internal_id}</td>
                    <td className="px-6 py-4 font-medium text-slate-500">{eq.description}</td>
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
