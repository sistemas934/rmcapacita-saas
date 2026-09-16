import { createClient } from "@/utils/supabase/server";
import { Users, FileText, FileCheck2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AddEmployeeForm } from "@/components/proveedor/AddEmployeeForm";
import { DocumentModal } from "@/components/proveedor/DocumentModal";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const EMPLOYEE_REQ = [
  { id: 'AltaAFIP', title: 'Alta Temprana AFIP', desc: 'Constancia de alta del empleado.' },
  { id: 'DNI_Frente', title: 'DNI (Frente y Dorso)', desc: 'Copia legible del documento.' },
];

export default async function ProviderPersonalPage({
  searchParams
}: {
  searchParams: { doc_employee?: string }
}) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;

  const { data: roleData } = await supabase.from('user_roles').select('company_id, tenant_id').eq('email', user.email).single();
  const companyId = roleData?.company_id;
  const tenantId = roleData?.tenant_id;

  if (!companyId) return <div className="p-8 font-bold text-center text-rose-600">Error: No tienes una empresa asignada.</div>;

  // 1. Fetch Employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  // 2. Fetch Employee Documents
  const { data: documents } = await supabase
    .from('documents')
    .select('status, employee_id, document_type')
    .eq('company_id', companyId)
    .not('employee_id', 'is', null);

  const docs = documents || [];

  function getComplianceStatus(employeeId: string) {
    const empDocs = docs.filter(d => d.employee_id === employeeId);
    if (empDocs.length === 0) return "INCOMPLETO";

    let hasRejected = false;
    let hasPending = false;
    let approvedCount = 0;

    for (const req of EMPLOYEE_REQ) {
      const doc = empDocs.find(d => d.document_type === req.id);
      if (!doc) continue;
      if (doc.status === 'REJECTED' || doc.status === 'EXPIRED') hasRejected = true;
      if (doc.status === 'PENDING') hasPending = true;
      if (doc.status === 'APPROVED') approvedCount++;
    }

    if (hasRejected) return "RECHAZADO";
    if (hasPending) return "PENDIENTE";
    if (approvedCount === EMPLOYEE_REQ.length) return "APTO";
    
    return "INCOMPLETO";
  }

  async function addEmployee(formData: FormData) {
    "use server";
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const dni = formData.get("dni") as string;
    const cId = formData.get("companyId") as string;
    
    const db = createClient();
    const { error } = await db.from('employees').insert({
      company_id: cId,
      full_name: `${firstName} ${lastName}`.trim(),
      document_id: dni,
      status: 'active'
    });
    
    if (error) {
      return { error: error.message };
    }
    
    revalidatePath('/proveedor/personal');
    return { success: true };
  }

  const selectedEmployee = searchParams.doc_employee 
    ? employees?.find(e => e.id === searchParams.doc_employee)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {selectedEmployee && tenantId && (
        <DocumentModal
          title={`Documentos: ${selectedEmployee.full_name}`}
          requirements={EMPLOYEE_REQ}
          entityId={selectedEmployee.id}
          entityType="employee"
          companyId={companyId}
          docs={docs.filter(d => d.employee_id === selectedEmployee.id)}
          closeHref="/proveedor/personal"
        />
      )}

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <Users className="w-8 h-8 text-blue-600" />
            Nómina de Personal
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Gestión corporativa de operarios y autorizaciones de ingreso.
          </p>
        </div>
      </div>

      <AddEmployeeForm companyId={companyId} tenantId={tenantId || ''} addAction={addEmployee} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-b from-white to-slate-50">
          <h3 className="text-sm font-bold text-slate-800">Personal Registrado</h3>
          <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
            {employees?.length || 0} Operarios
          </span>
        </div>
        
        {!employees || employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50/30">
            <Users className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-600 font-bold text-sm">No tienes operarios asignados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Nombre Completo</th>
                  <th className="px-5 py-4">DNI</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const status = getComplianceStatus(emp.id);
                  return (
                    <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 font-bold text-slate-800">{emp.full_name}</td>
                      <td className="px-5 py-4 font-medium text-slate-500">{emp.document_id}</td>
                      <td className="px-5 py-4">
                        <Badge status={status} />
                      </td>
                      <td className="px-5 py-4 text-right flex justify-end gap-2">
                        <Link 
                          href={`/proveedor/personal?doc_employee=${emp.id}`}
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
