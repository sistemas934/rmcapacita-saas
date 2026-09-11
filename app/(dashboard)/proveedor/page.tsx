import { FolderOpen, Layers, ShieldCheck, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FileUploadButton } from "@/components/proveedor/FileUploadButton";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const REQ_BASIC = [
  { id: 'Seguro de Vida', title: 'Seguro de Vida Obligatorio (SVO)', desc: 'Con subrogación a la empresa contratante.' },
  { id: 'Certificado ART', title: 'Certificado de Cobertura ART', desc: 'Cláusula de no repetición incluida.' },
  { id: 'Constancia CBU', title: 'Constancia de CBU / Certificado Bancario', desc: 'Cuenta bancaria a nombre de la empresa.' },
];

const REQ_EQUIPOS = [
  { id: 'SeguroEquipo', title: 'Seguro del equipo', desc: 'Póliza vigente de la maquinaria.' },
  { id: 'CertEquipo', title: 'Certificación de equipo(s)', desc: 'Unificar en un solo PDF si son varios.' },
  { id: 'AccesoriosIzaje', title: 'Certificados accesorios izaje', desc: 'Eslingas, grilletes, fajas.' },
  { id: 'CertOperador', title: 'Certificación operador', desc: 'Carnet habilitante para operar máquina.' },
  { id: 'CertEslingador', title: 'Certificación eslingador', desc: 'Credencial habilitante.' },
];

const REQ_ALTURA = [
  { id: 'CursoAltura', title: 'Capacitación trabajo en altura', desc: 'Constancia de curso vigente.' },
  { id: 'AptoMedico', title: 'Apto médico', desc: 'Especificar aptitud para altura.' },
  { id: 'PlanRescate', title: 'Plan de rescate (> 6 mts)', desc: 'Procedimiento de emergencia.' },
  { id: 'SeguroAltura', title: 'Seguro de altura (> 4 mts)', desc: 'Cobertura específica requerida.' },
];

const REQ_OBRA = [
  { id: 'ProgSeguridad', title: 'Programa de seguridad', desc: 'Aprobado por ART.' },
  { id: 'PlanTrabajo', title: 'Plan de trabajo (Si aplica)', desc: 'Cronograma detallado.' },
];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server Action para prender/apagar un módulo
async function toggleModule(formData: FormData) {
  "use server";
  const companyId = formData.get('companyId') as string;
  const modKey = formData.get('modulo') as string;
  const isChecked = formData.get('estado') === 'true';

  const supabase = createClient();
  
  // 1. Obtener los módulos actuales
  const { data: comp } = await supabase.from('companies').select('active_modules').eq('id', companyId).single();
  let currentModules = comp?.active_modules || { equipos: false, altura: false, obra: false };
  
  // 2. Modificar el específico
  currentModules[modKey] = isChecked;

  // 3. Guardar
  await supabase.from('companies').update({ active_modules: currentModules }).eq('id', companyId);
  
  revalidatePath('/proveedor');
}

export default async function ProviderDashboard() {
  const supabase = createClient();
  
  // 1. Obtener usuario logueado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-8 font-bold text-center">No has iniciado sesión</div>;

  // 2. Buscar en user_roles qué empresa le corresponde a este correo
  const { data: roleData } = await supabase.from('user_roles').select('company_id').eq('email', user.email).single();
  const companyId = roleData?.company_id;

  if (!companyId) return <div className="p-8 font-bold text-center text-rose-600">Error: No tienes una empresa asignada. Contacta al administrador.</div>;

  // 3. Traer los datos reales de esa empresa
  const { data: company } = await supabase.from('companies').select('id, legal_name, active_modules').eq('id', companyId).single();
  const mods = company?.active_modules || { equipos: false, altura: false, obra: false };

  // 4. Traer documentos
  const { data: documents } = await supabase.from('documents').select('*').eq('company_id', companyId);
  const docs = documents || [];

  const renderSection = (title: string, list: any[], modColor: string) => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className={`px-6 py-4 border-b border-slate-100 bg-${modColor}-50/50 flex items-center gap-3`}>
          <div className={`w-8 h-8 rounded-lg bg-${modColor}-100 text-${modColor}-600 flex items-center justify-center font-black text-sm border border-${modColor}-200`}>
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {list.map((req) => {
            const uploadedDoc = docs.find(d => d.document_type === req.id);
            const status = uploadedDoc ? uploadedDoc.status : 'NO_CARGADO';
            const isApproved = status === 'APPROVED';

            return (
              <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                    isApproved 
                      ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/20' 
                      : 'bg-slate-100 text-slate-400 border-slate-200 group-hover:text-brand-primary group-hover:bg-brand-primary/10'
                  }`}>
                    {isApproved ? <FileCheck2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{req.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{req.desc}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto md:justify-end shrink-0">
                  <Badge status={status} />
                  {!isApproved && (
                    <FileUploadButton documentType={req.id} companyId={companyId} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FolderOpen className="text-brand-primary w-6 h-6" /> Gestión Documental
        </h2>
        <p className="text-slate-500 font-medium text-sm mt-2">
          Empresa Activa: <span className="font-bold text-slate-800">{company?.legal_name || 'Cargando...'}</span>
        </p>
      </div>

      {/* Toggles Decorativos convertidos a Funcionales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 relative z-10">
          <Layers className="text-brand-primary w-4 h-4" /> Módulos de Actividades Específicas
        </h3>
        <p className="text-xs text-slate-500 font-medium mb-4 relative z-10">Active los módulos según el trabajo a realizar en planta para revelar los requisitos documentales.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {[
            { key: 'equipos', label: 'Equipos y Vehículos', color: 'text-indigo-600 focus:ring-indigo-500' },
            { key: 'altura', label: 'Trabajos en Altura', color: 'text-orange-500 focus:ring-orange-500' },
            { key: 'obra', label: 'Obra Constructiva', color: 'text-purple-600 focus:ring-purple-500' }
          ].map((mod) => (
            <form key={mod.key} action={toggleModule}>
              <input type="hidden" name="companyId" value={companyId} />
              <input type="hidden" name="modulo" value={mod.key} />
              <input type="hidden" name="estado" value={(mods as any)[mod.key] ? "false" : "true"} />
              
              <button type="submit" className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50 transition-all cursor-pointer group text-left">
                <div className="mt-0.5">
                  <input type="checkbox" checked={(mods as any)[mod.key] === true} readOnly className={`w-4 h-4 rounded border-slate-300 transition-all cursor-pointer ${mod.color}`} />
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{mod.label}</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Módulo extra</span>
                </div>
              </button>
            </form>
          ))}
        </div>
      </div>

      {renderSection("Requisitos Mínimos (Ingreso Básico)", REQ_BASIC, "slate")}
      
      {mods.equipos && renderSection("Trabajos con Equipos y Maquinaria", REQ_EQUIPOS, "indigo")}
      {mods.altura && renderSection("Trabajos en Altura", REQ_ALTURA, "orange")}
      {mods.obra && renderSection("Trabajos de Obra Constructiva", REQ_OBRA, "purple")}

    </div>
  );
}
