import { FolderOpen, ShieldCheck, FileCheck2, AlertCircle, FileText, Users, Truck, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ModuleToggle } from "@/components/proveedor/ModuleToggle";
import { TypeToggle } from "@/components/proveedor/TypeToggle";
import { FileUploadButton } from "@/components/proveedor/FileUploadButton";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";

const REQ_RELACION = [
  { id: 'Seguro SVO', title: 'Seguro de Vida Obligatorio (SVO)', desc: 'Con subrogación a la empresa contratante.' },
  { id: 'Seguro ART', title: 'Certificado de Cobertura ART', desc: 'Cláusula de no repetición incluida.' },
  { id: 'Planilla EPP', title: 'Planilla de Entrega EPP 299/11', desc: 'Firmada por el empleado.' },
];

const REQ_AUTONOMO = [
  { id: 'Seguro AP', title: 'Seguro de Accidentes Personales', desc: 'Con subrogación a la empresa contratante.' },
  { id: 'DDJJ EPP', title: 'Declaración Jurada de EPP', desc: 'Uso de elementos de protección personal.' },
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

// Acciones de Servidor
async function toggleModule(formData: FormData) {
  "use server";
  const companyId = formData.get('companyId') as string;
  const modKey = formData.get('modulo') as string;
  const isChecked = formData.get('estado') === 'true';

  const supabase = createClient();
  const { data: comp } = await supabase.from('companies').select('active_modules').eq('id', companyId).single();
  let currentModules = comp?.active_modules || { equipos: false, altura: false, obra: false };
  currentModules[modKey] = isChecked;

  const { error } = await supabase.from('companies').update({ active_modules: currentModules }).eq('id', companyId);
  if (error) return { error: error.message };
  revalidatePath('/proveedor');
  return { success: true };
}

async function toggleType(formData: FormData) {
  "use server";
  const companyId = formData.get('companyId') as string;
  const pType = formData.get('provider_type') as string;
  const supabase = createClient();
  const { error } = await supabase.from('companies').update({ provider_type: pType }).eq('id', companyId);
  if (error) return { error: error.message };
  revalidatePath('/proveedor');
  return { success: true };
}

async function acceptPolicy(companyId: string, policyId: string, email: string) {
  "use server";
  const supabase = createClient();
  await supabase.from('company_policies_acceptance').insert({
    company_id: companyId,
    policy_id: policyId,
    accepted_by_user: email
  });
  revalidatePath('/proveedor');
}

export default async function ProviderDashboard() {
  const supabase = createClient();
  
  // 1. Obtener usuario y tenant
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-8 font-bold text-center">No autorizado</div>;

  const { data: roleData } = await supabase.from('user_roles').select('company_id, tenant_id').eq('email', user.email).single();
  const companyId = roleData?.company_id;
  const tenantId = roleData?.tenant_id;

  if (!companyId) return <div className="p-8 font-bold text-center text-rose-600">Error: No tienes una empresa asignada. Contacta al administrador.</div>;

  // 2. Traer datos
  const [
    { data: comp },
    { data: documents },
    { data: allPolicies },
    { data: acceptedPolicies }
  ] = await Promise.all([
    supabase.from('companies').select('legal_name, active_modules, provider_type').eq('id', companyId).single(),
    supabase.from('documents').select('*').eq('company_id', companyId),
    supabase.from('policies').select('*').eq('tenant_id', tenantId),
    supabase.from('company_policies_acceptance').select('policy_id').eq('company_id', companyId)
  ]);

  const mods = comp?.active_modules || { equipos: false, altura: false, obra: false };
  const providerType = comp?.provider_type || 'relacion_dependencia';
  const docs = documents || [];

  // Políticas
  const acceptedIds = acceptedPolicies?.map(p => p.policy_id) || [];
  const pendingPolicies = allPolicies?.filter(p => !acceptedIds.includes(p.id)) || [];
  const hasPendingPolicies = pendingPolicies.length > 0;

  // Requisitos Base
  const baseReqs = providerType === 'autonomo' ? REQ_AUTONOMO : REQ_RELACION;
  const globalDocs = docs.filter(d => !d.employee_id && !d.vehicle_id && !d.equipment_id);

  let approvedBaseDocs = 0;
  let hasRejectedBaseDocs = false;
  let hasPendingBaseDocs = false;

  for (const req of baseReqs) {
    const doc = globalDocs.find(d => d.document_type === req.id);
    if (doc?.status === 'APPROVED') approvedBaseDocs++;
    if (doc?.status === 'REJECTED') hasRejectedBaseDocs = true;
    if (doc?.status === 'PENDING') hasPendingBaseDocs = true;
  }

  const isBaseComplete = approvedBaseDocs === baseReqs.length;
  const progressPercent = Math.round((approvedBaseDocs / baseReqs.length) * 100);
  
  let masterStatus = "APTO";
  if (!isBaseComplete) masterStatus = "INCOMPLETO";
  if (hasPendingBaseDocs) masterStatus = "PENDIENTE";
  if (hasRejectedBaseDocs) masterStatus = "RECHAZADO";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* HEADER WIZARD */}
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Portal de Ingreso
          <Badge status={masterStatus} />
        </h2>
        <p className="text-slate-500 font-medium text-sm mt-2">
          {isBaseComplete 
            ? "¡Excelente! La base de tu empresa está validada. Ya puedes gestionar ingresos de personal o activos."
            : "Completa la documentación legal de la empresa para habilitar los pases de ingreso."}
        </p>
      </div>

      {/* WARNING PENDING POLICIES */}
      {hasPendingPolicies && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm mb-8 relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-red-900 mb-2">Atención: Términos y Políticas Pendientes</h3>
              <p className="text-red-700 text-sm font-medium mb-4">
                Debes leer y aceptar las políticas del predio antes de subir documentación de tu empresa o de tus operarios.
              </p>
              
              <div className="space-y-4">
                {pendingPolicies.map(policy => (
                  <div key={policy.id} className="bg-white p-5 rounded-lg border border-red-100 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">{policy.title}</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap mb-4">{policy.content}</p>
                    
                    <form action={async () => {
                      "use server";
                      await acceptPolicy(companyId, policy.id, user.email || '');
                    }}>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-md text-sm transition-colors shadow-sm">
                        Comprendo y Acepto las Condiciones
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MASTER WIZARD STEPS */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative ${hasPendingPolicies ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
        
        {/* PASO 1 */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-lg shadow-blue-900/5 p-6 flex flex-col items-center text-center relative transition-all">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-sm border-4 border-white ${isBaseComplete ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
            {isBaseComplete ? <FileCheck2 className="w-6 h-6" /> : "1"}
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Entidad Legal</h3>
          <p className="text-xs text-slate-500 font-medium px-2 h-8">Documentos fiscales, SVO y ART.</p>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className={`h-full transition-all ${isBaseComplete ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* PASO 2 */}
        <div className={`bg-white rounded-xl border ${isBaseComplete ? 'border-blue-200 shadow-lg shadow-blue-900/5' : 'border-slate-200'} p-6 flex flex-col items-center text-center relative transition-all`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-sm border-4 border-white ${isBaseComplete ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
            2
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Personal</h3>
          <p className="text-xs text-slate-500 font-medium px-2 h-8">Nómina de operarios.</p>
          {isBaseComplete && (
            <Link href="/proveedor/personal" className="mt-4 text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-4 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
              Ir a Personal
            </Link>
          )}
        </div>

        {/* PASO 3 */}
        <div className={`bg-white rounded-xl border ${isBaseComplete ? 'border-blue-200 shadow-lg shadow-blue-900/5' : 'border-slate-200'} p-6 flex flex-col items-center text-center relative transition-all`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-sm border-4 border-white ${isBaseComplete ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
            3
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Activos</h3>
          <p className="text-xs text-slate-500 font-medium px-2 h-8">Vehículos y maquinaria.</p>
          {isBaseComplete && (
            <div className="mt-4 flex gap-2">
              <Link href="/proveedor/vehiculos" className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md hover:bg-slate-100 border border-slate-200 transition-colors">
                Flota
              </Link>
              <Link href="/proveedor/equipos" className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md hover:bg-slate-100 border border-slate-200 transition-colors">
                Equipos
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${hasPendingPolicies ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
              <h3 className="text-sm font-bold text-slate-800">1. Tipo de Entidad</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Define qué documentos legales debes presentar obligatoriamente.</p>
            </div>
            <div className="p-5">
              <TypeToggle companyId={companyId} initialType={providerType} toggleAction={toggleType} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
              <h3 className="text-sm font-bold text-slate-800">2. Tareas Especiales</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Activa solo si aplica a tus tareas.</p>
            </div>
            <div className="p-5 space-y-4">
              <ModuleToggle companyId={companyId} id="altura" title="Trabajo en Altura" desc="Andamios o más de 2 metros." isChecked={mods.altura} toggleAction={toggleModule} />
              <ModuleToggle companyId={companyId} id="obra" title="Trabajo de Obra" desc="Modificaciones civiles." isChecked={mods.obra} toggleAction={toggleModule} />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: DOCUMENTACIÓN BASE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">3. Sube la Documentación Base</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Obligatorio para que tus empleados y activos puedan ingresar.</p>
              </div>
              <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wider shrink-0">
                {approvedBaseDocs} / {baseReqs.length} Aprobados
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {baseReqs.map((req) => {
                const doc = globalDocs.find(d => d.document_type === req.id);
                const status = doc ? doc.status : 'NO_CARGADO';
                const isApproved = status === 'APPROVED';

                return (
                  <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 border transition-colors shadow-sm ${
                        isApproved 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : 'bg-white text-slate-400 border-slate-200 group-hover:text-blue-600 group-hover:border-blue-200'
                      }`}>
                        {isApproved ? <FileCheck2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isApproved ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {req.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {req.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto md:justify-end shrink-0">
                      <Badge status={status} />
                      {status !== 'APPROVED' && status !== 'PENDING' && (
                        <FileUploadButton 
                          companyId={companyId}
                          tenantId={tenantId}
                          documentType={req.id}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Módulos extra si están activos */}
          {mods.altura && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
              <div className="p-5 border-b border-slate-100 bg-orange-50/30">
                <h3 className="text-sm font-bold text-slate-800 text-orange-800">Módulo Activado: Trabajo en Altura</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {REQ_ALTURA.map(req => {
                  const doc = globalDocs.find(d => d.document_type === req.id);
                  const status = doc ? doc.status : 'NO_CARGADO';
                  return (
                    <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{req.title}</h4>
                          <p className="text-xs text-slate-500">{req.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge status={status} />
                        {status !== 'APPROVED' && status !== 'PENDING' && (
                          <FileUploadButton companyId={companyId} tenantId={tenantId} documentType={req.id} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mods.obra && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
              <div className="p-5 border-b border-slate-100 bg-purple-50/30">
                <h3 className="text-sm font-bold text-slate-800 text-purple-800">Módulo Activado: Obra Constructiva</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {REQ_OBRA.map(req => {
                  const doc = globalDocs.find(d => d.document_type === req.id);
                  const status = doc ? doc.status : 'NO_CARGADO';
                  return (
                    <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{req.title}</h4>
                          <p className="text-xs text-slate-500">{req.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge status={status} />
                        {status !== 'APPROVED' && status !== 'PENDING' && (
                          <FileUploadButton companyId={companyId} tenantId={tenantId} documentType={req.id} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
