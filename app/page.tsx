import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 lg:p-24 relative overflow-hidden bg-white">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-brand-secondary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-glow flex items-center justify-center text-white mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-factory"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>
        </div>
        
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
          RMcapacita SaaS
        </h1>
        <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
          El proyecto ha sido inicializado exitosamente. Esta es la base comercial para el Portal de Proveedores Multi-Tenant y el Control de Accesos de Guardia.
        </p>
        
        <Link href="/login" className="btn-primary">
          Ir al Login
        </Link>
      </div>
    </main>
  );
}
