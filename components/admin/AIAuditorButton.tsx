"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, FileX } from "lucide-react";
import { auditDocumentWithAI } from "@/app/actions/auditDocument";

export function AIAuditorButton({ docId, docType, fileUrl, companyName }: { docId: string, docType: string, fileUrl: string, companyName: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{verdict: string, suggestedStatus: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async () => {
    setLoading(true);
    setError(null);
    const res = await auditDocumentWithAI(docId, docType, fileUrl, companyName);
    setLoading(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      setResult({ verdict: res.verdict, suggestedStatus: res.suggestedStatus });
    }
  };

  if (result) {
    const isApproved = result.suggestedStatus === 'APPROVED';
    const isRejected = result.suggestedStatus === 'REJECTED';
    
    return (
      <div className={`mt-3 p-3 rounded-lg border text-sm flex gap-3 items-start animate-in fade-in slide-in-from-top-2 ${
        isApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
        isRejected ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <Sparkles className="w-5 h-5 shrink-0 mt-0.5 opacity-70" />
        <div>
          <p className="font-bold mb-1">
            Sugerencia de IA: {isApproved ? 'Aprobar Documento' : isRejected ? 'Rechazar Documento' : 'Revisar Manualmente'}
          </p>
          <p className="opacity-90">{result.verdict}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {error && <p className="text-red-500 text-xs mb-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {error}</p>}
      <button 
        onClick={handleAudit} 
        disabled={loading}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? "Analizando documento..." : "Auditar con IA"}
      </button>
    </div>
  );
}
