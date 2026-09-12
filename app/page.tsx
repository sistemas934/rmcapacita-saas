import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        
        {/* Logo Container */}
        <div className="mb-8 w-32 h-32 relative bg-white rounded-2xl shadow-sm border border-slate-200 p-2 overflow-hidden flex items-center justify-center">
          <Image 
            src="/logo.png" 
            alt="RM Sistemas y Capacitaciones" 
            fill 
            className="object-contain p-2"
            priority
          />
        </div>
        
        {/* Typography */}
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Gestión de Contratistas
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed px-4">
            Plataforma B2B para el control documental, validación de requisitos y habilitación de accesos en planta.
          </p>
        </div>
        
        {/* Actions */}
        <Link 
          href="/login" 
          className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm shadow-brand-primary/20 text-sm"
        >
          Iniciar Sesión
          <ArrowRight className="w-4 h-4" />
        </Link>
        
        {/* Footer/Trust Badge */}
        <div className="mt-12 flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Plataforma Segura Empresarial</span>
        </div>
      </div>
    </main>
  );
}
