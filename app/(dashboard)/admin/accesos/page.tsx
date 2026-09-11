"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, CheckCircle, XCircle, Loader2, ShieldAlert, Camera, X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function AccesosPage() {
  const supabase = createClient();
  const [cuit, setCuit] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (scannerOpen) {
      const scanner = new Html5QrcodeScanner("reader", {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        rememberLastUsedCamera: true
      }, false);

      scanner.render(
        (decodedText) => {
          // Cuando lee un código, lo limpia y cierra el escáner
          scanner.clear().catch(e => console.error(e));
          setScannerOpen(false);
          setCuit(decodedText);
          
          // Enviamos el formulario automáticamente 500ms después
          setTimeout(() => {
            document.getElementById("btnBuscar")?.click();
          }, 500);
        },
        (err) => { /* Silencioso para evitar saturar consola mientras enfoca */ }
      );

      return () => {
        scanner.clear().catch(e => console.error(e));
      }
    }
  }, [scannerOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuit) return;
    
    setLoading(true);
    setResult(null);

    try {
      // 1. Buscar al operario por su DNI (incluyendo el nombre de su empresa y CUIT)
      const { data: employee, error: empError } = await supabase
        .from("employees")
        .select("*, companies(legal_name, tax_id)")
        .eq("document_id", cuit)
        .single();

      if (empError || !employee) {
        setResult({ type: "not_found" });
        setLoading(false);
        return;
      }

      // 2. Buscar TODOS los documentos de la EMPRESA
      const { data: compDocs } = await supabase
        .from("documents")
        .select("status, document_type")
        .eq("company_id", employee.company_id);

      const allDocs = compDocs || [];

      // 3. Lógica del Guardia en Cascada (Empresa + Persona):
      const hasDocs = allDocs.length > 0;
      const hasPendingOrRejected = allDocs.some(d => d.status !== 'APPROVED');
      
      const isApto = hasDocs && !hasPendingOrRejected;

      setResult({
        type: "success",
        company: employee.companies,
        employee: employee,
        isApto,
        docs: allDocs
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <ShieldAlert className="w-8 h-8 text-brand-primary" />
          Terminal de Control de Acceso
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          Escanea el código QR de la credencial o ingresa el DNI del operario.
        </p>
      </div>

      {/* Contenedor del Escáner QR */}
      {scannerOpen && (
        <div className="bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-700 mx-auto max-w-sm text-center animate-in fade-in zoom-in duration-300">
          <div id="reader" className="w-full rounded-xl overflow-hidden bg-black border-2 border-brand-primary mb-4"></div>
          <button 
            onClick={() => setScannerOpen(false)}
            className="bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-500/80 px-6 py-2 rounded-xl font-bold transition-all shadow-sm inline-flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Cancelar Escáner
          </button>
        </div>
      )}

      {/* Buscador Manual */}
      {!scannerOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            
            <button 
              type="button"
              onClick={() => setScannerOpen(true)}
              className="bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-600 px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center border border-slate-200 hover:border-brand-primary group shrink-0"
              title="Escanear Código QR"
            >
              <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                placeholder="Ingrese DNI del operario..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all text-center tracking-widest"
              />
            </div>
            
            <button 
              id="btnBuscar"
              type="submit" 
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center min-w-[140px]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verificar"}
            </button>
          </form>
        </div>
      )}

      {/* Resultados */}
      {result && result.type === "not_found" && (
        <div className="bg-slate-100 p-8 rounded-2xl text-center border border-slate-200">
          <p className="text-slate-500 font-bold text-lg">No se encontró ninguna persona con ese DNI registrado.</p>
        </div>
      )}

      {result && result.type === "success" && (
        <div className={`p-8 rounded-2xl border-2 transition-all shadow-xl ${result.isApto ? 'bg-semantic-success/10 border-semantic-success/30 shadow-semantic-success/10' : 'bg-semantic-error/10 border-semantic-error/30 shadow-semantic-error/10'}`}>
          <div className="flex flex-col items-center text-center">
            {result.isApto ? (
              <div className="w-24 h-24 bg-semantic-success/20 rounded-full flex items-center justify-center mb-6 border-4 border-semantic-success/30">
                <CheckCircle className="w-12 h-12 text-semantic-success" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-semantic-error/20 rounded-full flex items-center justify-center mb-6 border-4 border-semantic-error/30">
                <XCircle className="w-12 h-12 text-semantic-error" />
              </div>
            )}
            
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Operario Autorizado</p>
            <h3 className="text-3xl font-black text-slate-900 mb-2 leading-none">{result.employee.full_name}</h3>
            
            <div className="mt-4 pt-4 border-t border-slate-200 w-full mb-8">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Contratista Titular</p>
              <h3 className="text-xl font-black text-slate-800 mb-1">{result.company.legal_name}</h3>
              <p className="text-slate-600 font-medium text-sm">CUIT: {result.company.tax_id}</p>
            </div>

            <div className={`text-4xl font-black tracking-widest uppercase px-12 py-5 rounded-2xl shadow-lg w-full ${result.isApto ? 'bg-semantic-success text-white' : 'bg-semantic-error text-white'}`}>
              {result.isApto ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
            </div>

            {!result.isApto && (
              <div className="mt-8 bg-white p-6 rounded-2xl w-full text-left shadow-sm border border-slate-200">
                <div className="flex items-start gap-3 mb-4">
                  <ShieldAlert className="w-6 h-6 text-semantic-error shrink-0" />
                  <h4 className="font-bold text-slate-800">Motivo del bloqueo (Fallas en documentación):</h4>
                </div>
                
                <ul className="space-y-3">
                  {result.docs.length === 0 && (
                    <li className="text-semantic-error font-bold text-sm bg-semantic-error/10 p-3 rounded-lg border border-semantic-error/20">
                      La empresa contratista no ha subido ningún documento al portal.
                    </li>
                  )}
                  {result.docs.map((doc: any, i: number) => (
                    <li key={i} className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-slate-700 font-medium text-sm">{doc.document_type}</span>
                      <span className={`font-bold text-[10px] uppercase px-3 py-1.5 rounded-full tracking-wider ${
                        doc.status === 'APPROVED' ? 'bg-semantic-success/10 text-semantic-success border border-semantic-success/20' : 
                        doc.status === 'REJECTED' ? 'bg-semantic-error/10 text-semantic-error border border-semantic-error/20' : 
                        'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20'
                      }`}>
                        {doc.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
