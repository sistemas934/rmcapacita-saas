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
    <aside className="w-[260px] bg-[#0f172a] flex flex-col justify-between hidden md:flex shrink-0 h-screen sticky top-0 z-20 text-slate-300 shadow-xl shadow-slate-900/20">
      <div>
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-[#0B1221]">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white mr-3 shadow-md">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-white tracking-wide text-lg">RMcapacita</span>
          <span className="ml-2 text-[9px] font-bold bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase tracking-widest">
            {userRole === 'PROVIDER' ? 'PROV' : 'ADMIN'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-0.5">
          {userRole === 'TENANT_ADMIN' ? (
            <>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Gestión Corporativa</p>
              <Link href="/admin" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                <Building className="w-4 h-4" />
                Directorio
              </Link>
              <Link href="/admin/accesos" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                <Clock className="w-4 h-4" />
                Registro de Accesos
              </Link>
              <Link href="/admin/personal" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                <UserPlus className="w-4 h-4" />
                Personal Interno
              </Link>
            </>
          ) : userRole === 'PROVIDER' ? (
            <>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Mi Empresa</p>
              <Link href="/proveedor" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                <Shield className="w-4 h-4" />
                Documentación General
              </Link>
              <Link href="/proveedor/personal" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                <UserPlus className="w-4 h-4" />
                Personal Autorizado
              </Link>
              <Link href="/proveedor/vehiculos" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                <Truck className="w-4 h-4" />
                Flota de Vehículos
              </Link>
              <Link href="/proveedor/equipos" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                <Wrench className="w-4 h-4" />
                Mis Equipos
              </Link>
            </>
          ) : null}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800 bg-[#0B1221]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 shadow-inner">
            {userEmail.substring(0,2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{userEmail}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{userRole}</p>
          </div>
        </div>
        
        <LogoutButton />
      </div>
    </aside>
  );
}
