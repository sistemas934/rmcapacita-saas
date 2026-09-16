import { FileUploadButton } from "./FileUploadButton";
import { Badge } from "../ui/Badge";
import { ShieldCheck, FileCheck2, X } from "lucide-react";
import Link from "next/link";

export function DocumentModal({ 
  title, 
  entityId, 
  entityType, 
  companyId, 
  requirements, 
  docs,
  closeHref
}: {
  title: string;
  entityId: string;
  entityType: "vehicle" | "equipment" | "employee";
  companyId: string;
  requirements: any[];
  docs: any[];
  closeHref: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <Link href={closeHref} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </Link>
        </div>
        
        <div className="overflow-y-auto p-2">
          <div className="divide-y divide-slate-100">
            {requirements.map((req) => {
              const uploadedDoc = docs.find(d => {
                if (d.document_type !== req.id) return false;
                if (entityType === "vehicle") return d.vehicle_id === entityId;
                if (entityType === "equipment") return d.equipment_id === entityId;
                if (entityType === "employee") return d.employee_id === entityId;
                return true;
              });
              const status = uploadedDoc ? uploadedDoc.status : "NO_CARGADO";
              const isApproved = status === "APPROVED";

              return (
                <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${isApproved ? "bg-semantic-success/10 text-semantic-success border-semantic-success/20" : "bg-slate-100 text-slate-400 border-slate-200 group-hover:text-brand-primary group-hover:bg-brand-primary/10"}`}>
                      {isApproved ? <FileCheck2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isApproved ? "text-semantic-success" : "text-slate-800"}`}>
                        {req.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {req.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-2">
                    <Badge status={status} />
                    {(status === "NO_CARGADO" || status === "REJECTED") && (
                      <FileUploadButton 
                        documentType={req.id} 
                        companyId={companyId} 
                        vehicleId={entityType === "vehicle" ? entityId : undefined}
                        equipmentId={entityType === "equipment" ? entityId : undefined}
                        employeeId={entityType === "employee" ? entityId : undefined}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
