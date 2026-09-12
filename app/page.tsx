import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-slate-50">
      {/* Elementos de fondo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl bg-white/70 backdrop-blur-xl p-10 md:p-16 rounded-[3rem] shadow-2xl border border-white">
        
        {/* Logo */}
        <div className="mb-10 relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-500">
          <Image 
            src="/logo.png" 
            alt="RM Sistemas y Capacitaciones" 
            fill 
            className="object-cover"
            priority
          />
        </div>
        
        {/* Títulos redactados a medida */}
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
          Software de Control de Proveedores <br className="hidden md:block"/> y Documentación
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 font-medium mb-12 leading-relaxed max-w-2xl">
          Plataforma corporativa especializada en la gestión centralizada de contratistas, validación de requisitos legales, políticas de seguridad industrial y control automatizado de accesos.
        </p>
        
        {/* Botón de Ingreso */}
        <Link href="/login" className="bg-[#1f4ae5] hover:bg-[#1638b3] text-white font-black uppercase tracking-widest py-5 px-12 rounded-2xl transition-all shadow-xl shadow-[#1f4ae5]/30 text-lg hover:-translate-y-1 active:translate-y-0">
          Ingresar al Portal
        </Link>
      </div>
    </main>
  );
}
