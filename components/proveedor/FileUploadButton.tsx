"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function FileUploadButton({ 
  documentType, 
  companyId,
  employeeId,
  vehicleId,
  equipmentId
}: { 
  documentType: string, 
  companyId: string,
  employeeId?: string,
  vehicleId?: string,
  equipmentId?: string
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!companyId) {
      alert("Error: No se encontró una empresa válida para asignar el documento.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('documents').insert({
        company_id: companyId,
        document_type: documentType,
        file_url: urlData.publicUrl,
        status: 'PENDING',
        employee_id: employeeId || null,
        vehicle_id: vehicleId || null,
        equipment_id: equipmentId || null
      });

      if (dbError) throw dbError;

      alert("¡PDF subido exitosamente y enviado a revisión!");
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      alert("Error al subir archivo: " + error.message);
    } finally {
      setUploading(false);
      // Limpiamos el input para poder volver a subir si es necesario
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Subiendo...
          </>
        ) : (
          "Subir PDF"
        )}
      </button>
    </div>
  );
}
