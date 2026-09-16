"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <button 
      onClick={handleLogout} 
      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md hover:bg-slate-800 border border-slate-700 transition-colors text-slate-400 hover:text-rose-400 group"
    >
      <LogOut className="w-4 h-4" />
      <span className="text-xs font-bold tracking-wide uppercase">Cerrar Sesión</span>
    </button>
  );
}
