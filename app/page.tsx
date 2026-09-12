import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Factory } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden">
      
      {/* Dynamic Gradients Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle mesh gradient feel */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent opacity-80"></div>
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-brand-secondary/20 to-brand-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-10 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        
        {/* Floating Logo CSS */}
        <div className="mb-10 relative">
          <div className="absolute -inset-2 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full blur-xl opacity-20"></div>
          <div className="relative w-32 h-32 bg-white rounded-full shadow-2xl border border-slate-50 flex items-center justify-center transform transition-transform hover:scale-105 duration-300">
            {/* "ЯM" Puro CSS */}
            <div className="flex text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-brand-primary to-brand-secondary">
              <span className="transform -scale-x-100 translate-x-[2px]">R</span>
              <span>M</span>
            </div>
          </div>
        </div>
        
        {/* Typography */}
        <div className="text-center space-y-5 mb-10 w-full">
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
            Gestión Inteligente <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
              de Contratistas
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed px-4 max-w-md mx-auto">
            Plataforma B2B para el control documental, validación de requisitos legales y habilitación de accesos.
          </p>
        </div>
        
        {/* Action Button */}
        <Link 
          href="/login" 
          className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-[0_8px_30px_rgb(29,78,216,0.25)] hover:shadow-[0_8px_30px_rgb(29,78,216,0.4)] hover:-translate-y-1 text-lg w-full md:w-auto"
        >
          Ingresar al Portal
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        {/* Feature Badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm font-semibold">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <span>Seguridad Industrial</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            <Factory className="w-4 h-4 text-brand-primary" />
            <span>Control de Accesos</span>
          </div>
        </div>

      </div>
    </main>
  );
}
