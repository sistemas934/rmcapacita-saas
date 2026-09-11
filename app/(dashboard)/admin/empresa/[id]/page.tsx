import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, Building, FileText, CheckCircle2, FileX, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { revalidatePath } from "next/cache";

// Server Action para actualizar el estado del documento
async function updateDocumentStatus(formData: FormData) {
  "use server";
  const docId = formData.get("docId") as string;
  const status = formData.get("status") as string;
  const companyId = formData.get("companyId") as string;

  const supabase = createClient();
  await supabase.from("documents").update({ status }).eq("id", docId);
  
  // Refrescar las páginas para que se actualicen los números
  revalidatePath(`/admin/empresa/${companyId}`);
  revalidatePath("/admin");
}

export default async function EmpresaDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // Buscar datos de la empresa
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", params.id)
    .single();
    
  // Buscar documentos de esta empresa
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("company_id", params.id)
    .order('created_at', { ascending: false });

  if (!company) {
    return (
      <div className="p-8 text-center text-slate-500">
        Empresa no encontrada. <Link href="/admin" className="text-brand-primary underline">Volver al panel</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building className="w-6 h-6 text-brand-primary" />
            {company.legal_name}
          </h2>
          <p className="text-slate-500 text-sm">CUIT: {company.tax_id} | Ciudad: {company.city || "No especificada"}</p>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-primary" /> 
            Documentación Subida ({documents?.length || 0})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {documents?.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay documentos subidos por esta empresa todavía.</div>
          ) : (
            documents?.map((doc) => (
              <div key={doc.id} className="p-6 flex flex-col md:flex-row justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                
                {/* Info del Documento */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-base font-bold text-slate-800">{doc.document_type}</h4>
                    <Badge status={doc.status} />
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Subido el: {new Date(doc.created_at).toLocaleString()}
                  </p>
                  
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline bg-brand-primary/5 px-3 py-1.5 rounded-lg border border-brand-primary/10"
                  >
                    <ExternalLink className="w-4 h-4" /> Ver Archivo PDF
                  </a>
                </div>

                {/* Acciones de Auditoría (Aprobar / Rechazar) */}
                {doc.status === 'PENDING' && (
                  <div className="flex items-center gap-3 shrink-0 bg-slate-100/50 p-4 rounded-xl border border-slate-200">
                    <form action={updateDocumentStatus}>
                      <input type="hidden" name="docId" value={doc.id} />
                      <input type="hidden" name="companyId" value={company.id} />
                      <input type="hidden" name="status" value="APPROVED" />
                      <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-semantic-success text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                        <CheckCircle2 className="w-4 h-4" /> Aprobar
                      </button>
                    </form>

                    <form action={updateDocumentStatus}>
                      <input type="hidden" name="docId" value={doc.id} />
                      <input type="hidden" name="companyId" value={company.id} />
                      <input type="hidden" name="status" value="REJECTED" />
                      <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-white border border-semantic-error text-semantic-error text-xs font-bold rounded-lg hover:bg-red-50 transition-colors shadow-sm">
                        <FileX className="w-4 h-4" /> Rechazar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
