import { FolderOpen, Layers, ShieldCheck, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ModuleToggle } from "@/components/proveedor/ModuleToggle";
import { TypeToggle } from "@/components/proveedor/TypeToggle";
import { FileUploadButton } from "@/components/proveedor/FileUploadButton";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

const REQ_VEHICLE = [
  { id: 'SeguroVehiculo', title: 'Seguro Automotor', desc: 'Póliza vigente con cláusula de no repetición.' },
];

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
  const { error } = await supabase.from('companies').update({ active_modules: currentModules }).eq('id', companyId);
  if (error) return { error: error.message };
  
  revalidatePath('/proveedor');
  return { success: true };
}

export default async function ProviderDashboard() {
  const supabase = createClient();
  
  // 1. Obtener usuario logueado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-8 font-bold text-center">No has iniciado sesión</div>;

  // 2. Buscar en user_roles qué empresa le corresponde a este correo
  const { data: roleData } = await supabase.from('user_roles').select('company_id, tenant_id').eq('email', user.email).single();
  const companyId = roleData?.company_id;

  if (!companyId) return <div className="p-8 font-bold text-center text-rose-600">Error: No tienes una empresa asignada. Contacta al administrador.</div>;

  const tenantId = roleData?.tenant_id;

  // 3. Traer todos los datos en paralelo (Modo Turbo)
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

  const docs = documents || [];

  // 5. Políticas y Cumplimiento
  const acceptedIds = acceptedPolicies?.map(p => p.policy_id) || [];
  
  const pendingPolicies = allPolicies?.filter(p => !acceptedIds.includes(p.id)) || [];
  const hasPendingPolicies = pendingPolicies.length > 0;

  // Server action inside component for accepting policy (must be passed to a form or extracted)
  // Actually, we need to extract the server action to the top level.

  const renderSection = (title: string, list: any[], modColor: string, entityId?: string, entityType?: 'vehicle' | 'equipment') => {
    return (
      <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8 ${hasPendingPolicies ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className={`px-6 py-4 border-b border-slate-100 bg-${modColor}-50/50 flex items-center gap-3`}>
          <div className={`w-8 h-8 rounded-lg bg-${modColor}-100 text-${modColor}-600 flex items-center justify-center font-black text-sm border border-${modColor}-200`}>
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {list.map((req) => {
            const uploadedDoc = docs.find(d => {
              if (d.document_type !== req.id) return false;
              if (entityType === 'vehicle') return d.vehicle_id === entityId;
              if (entityType === 'equipment') return d.equipment_id === entityId;
              return true; // global documents
            });
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
                    <h4 className={`text-sm font-bold ${isApproved ? 'text-semantic-success' : 'text-slate-800'}`}>
                      {req.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {req.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto md:justify-end shrink-0">
                  <Badge status={status} />
                  {!isApproved && !hasPendingPolicies && (
                    <FileUploadButton 
                      documentType={req.id} 
                      companyId={companyId} 
                      vehicleId={entityType === 'vehicle' ? entityId : undefined}
                      equipmentId={entityType === 'equipment' ? entityId : undefined}
                    />
                  )}
                  {hasPendingPolicies && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-2 rounded-lg">Bloqueado</span>
                  )}
                </div>
              </div>
            );
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
          Empresa Activa: <span className="font-bold text-slate-800">{comp?.legal_name || 'Cargando...'}</span>
        </p>
      </div>

      {hasPendingPolicies && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-red-900 mb-2">Atención: Términos y Políticas Pendientes</h3>
              <p className="text-red-700 text-sm font-medium mb-4">
                El administrador ha establecido políticas de ingreso que debes leer y aceptar antes de poder subir documentación de tu empresa o de tus operarios.
              </p>
              
              <div className="space-y-4">
                {pendingPolicies.map(policy => (
                  <div key={policy.id} className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">{policy.title}</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap mb-4">{policy.content}</p>
                    
                    <form action={async () => {
                      "use server";
                      const supabase = createClient();
                      await supabase.from('company_policies_acceptance').insert({
                        company_id: companyId,
                        policy_id: policy.id
                      });
                      revalidatePath('/proveedor');
                    }}>
                      <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm">
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

      {/* Toggles Decorativos convertidos a Funcionales */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden ${hasPendingPolicies ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 relative z-10">
          <Layers className="text-brand-primary w-4 h-4" /> Módulos de Actividades Específicas
        </h3>
        <p className="text-xs text-slate-500 font-medium mb-4 relative z-10">Active los módulos según el trabajo a realizar en planta para revelar los requisitos documentales.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {[
              { key: 'altura', label: 'Trabajos en Altura', color: 'text-orange-500 focus:ring-orange-500' },
              { key: 'obra', label: 'Obra Constructiva', color: 'text-purple-600 focus:ring-purple-500' }
            ].map((mod) => (
              <ModuleToggle 
                key={mod.key}
                modKey={mod.key}
                label={mod.label}
                color={mod.color}
                companyId={companyId}
                initialState={(mods as any)[mod.key] === true}
                toggleAction={toggleModule}
              />
            ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800">Tipo de Contratista</h3>
          <p className="text-xs text-slate-500">Seleccione si es empresa con empleados o trabajador autónomo.</p>
        </div>
        <TypeToggle 
          companyId={companyId} 
          initialType={providerType} 
          toggleAction={toggleType} 
        />
      </div>

      {providerType === 'autonomo' 
        ? renderSection("Requisitos Autónomo (Ingreso Básico)", REQ_AUTONOMO, "slate")
        : renderSection("Requisitos Relación de Dependencia", REQ_RELACION, "slate")}
      
      {mods.altura && renderSection("Trabajos en Altura", REQ_ALTURA, "orange")}
      {mods.obra && renderSection("Trabajos de Obra Constructiva", REQ_OBRA, "purple")}

    </div>
  );
}
