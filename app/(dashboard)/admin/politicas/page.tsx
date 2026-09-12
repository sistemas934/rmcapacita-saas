import { createClient } from "@/utils/supabase/server";
import { Shield, FileText, Plus, Trash2, ShieldAlert } from "lucide-react";
import { revalidatePath } from "next/cache";

// Server action to create a policy
async function createPolicy(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tenantId = formData.get("tenantId") as string;

  if (!title || !content || !tenantId) return;

  const supabase = createClient();
  await supabase.from("policies").insert({
    tenant_id: tenantId,
    title,
    content
  });

  revalidatePath("/admin/politicas");
}

// Server action to delete a policy
async function deletePolicy(formData: FormData) {
  "use server";
  const policyId = formData.get("policyId") as string;
  
  if (!policyId) return;

  const supabase = createClient();
  await supabase.from("policies").delete().eq("id", policyId);

  revalidatePath("/admin/politicas");
}

export const dynamic = 'force-dynamic';

export default async function PoliticasPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;

  const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('email', user.email).single();
  const tenantId = roleData?.tenant_id;

  if (!tenantId) return <div className="p-8">Error: No tienes un Tenant asignado.</div>;

  // Fetch policies
  const { data: policies } = await supabase
    .from('policies')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-brand-primary" />
          Políticas de Ingreso y Cumplimiento
        </h2>
        <p className="text-slate-500 font-medium mt-2 text-sm">
          Define las normas, seguros exigidos y condiciones que las empresas contratistas deben aceptar de forma obligatoria antes de poder subir su documentación.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Formulario para Nueva Política */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-primary" /> Nueva Política
            </h3>
            
            <form action={createPolicy} className="space-y-4">
              <input type="hidden" name="tenantId" value={tenantId} />
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Título</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="Ej: Normas de Seguridad Industrial"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Contenido / Términos</label>
                <textarea 
                  name="content" 
                  required 
                  rows={6}
                  placeholder="Redacta las normas que el proveedor deberá leer y aceptar..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all resize-none custom-scrollbar"
                ></textarea>
              </div>

              <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
                Guardar Política
              </button>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Lista de Políticas Activas */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-slate-400" /> Políticas Activas ({policies?.length || 0})
          </h3>

          {!policies || policies.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">No has definido ninguna política aún.</p>
              <p className="text-slate-400 text-xs mt-1">Los proveedores no tendrán bloqueos al registrarse.</p>
            </div>
          ) : (
            policies.map((policy) => (
              <div key={policy.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-lg mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-brand-primary" /> {policy.title}
                    </h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{policy.content}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                      CREADA: {new Date(policy.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <form action={deletePolicy}>
                    <input type="hidden" name="policyId" value={policy.id} />
                    <button type="submit" className="text-slate-400 hover:text-semantic-error hover:bg-semantic-error/10 p-2 rounded-lg transition-colors" title="Eliminar Política">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
