import Link from "next/link";
import { Building, Clock, UserPlus, Shield, Truck, Wrench } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { LogoutButton } from "./LogoutButton";

export async function Sidebar() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  
  const userEmail = user?.email || "usuario@ejemplo.com";

  // Buscar el rol del usuario
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('email', userEmail)
    .single();

  const userRole = roleData?.role || 'TENANT_ADMIN';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex shrink-0 h-screen sticky top-0 z-20">
      <div>
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg shadow-sm flex items-center justify-center text-white mr-3">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight text-lg">RMcapacita</span>
          <span className="ml-1 text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-1">
            {userRole === 'PROVIDER' ? 'Prov' : 'Admin'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {userRole === 'TENANT_ADMIN' ? (
            <>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Principal</p>
              <Link href="/admin" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors focus:bg-brand-primary/10 focus:text-brand-primary">
                <Building className="w-4 h-4" />
                Directorio
              </Link>
              <Link href="/admin/accesos" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus:bg-slate-50">
                <Clock className="w-4 h-4 text-slate-400" />
                Registro de Accesos
              </Link>
              <Link href="/admin/personal" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus:bg-slate-50">
                <UserPlus className="w-4 h-4 text-slate-400" />
                Personal Autorizado
              </Link>
              
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Administración</p>
              <Link href="/admin/politicas" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus:bg-slate-50">
                <Shield className="w-4 h-4 text-slate-400" />
                Políticas de Ingreso
              </Link>
              <Link href="/admin/usuarios" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus:bg-slate-50">
                <Building className="w-4 h-4 text-slate-400" />
                Nueva Empresa
              </Link>
            </>
          ) : userRole === 'PROVIDER' ? (
            <>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Mi Empresa</p>
              <Link href="/proveedor" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors focus:bg-brand-primary/10 focus:text-brand-primary">
                <Shield className="w-4 h-4" />
                Documentación y Políticas
              </Link>
              <Link href="/proveedor/personal" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus:bg-slate-50">
                <UserPlus className="w-4 h-4 text-slate-400" />
                Personal Autorizado
              </Link>
              <Link href="/proveedor/vehiculos" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus:bg-slate-50">
                <Truck className="w-4 h-4 text-slate-400" />
                Flota de Vehículos
              </Link>
              <Link href="/proveedor/equipos" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus:bg-slate-50">
                <Wrench className="w-4 h-4 text-slate-400" />
                Mis Equipos
              </Link>
            </>
          ) : null}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100">
        <LogoutButton email={userEmail} />
      </div>
    </aside>
  );
}
