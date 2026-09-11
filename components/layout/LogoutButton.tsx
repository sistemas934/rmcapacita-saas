"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton({ email }: { email: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = email.substring(0, 2).toUpperCase();

  return (
    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left group">
      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 group-hover:bg-slate-300 transition-colors uppercase">
        {initials}
      </div>
      <div className="overflow-hidden flex-1">
        <p className="text-sm font-bold text-slate-700 truncate">{email}</p>
        <p className="text-xs font-medium text-slate-500 truncate group-hover:text-semantic-error transition-colors">Cerrar Sesión</p>
      </div>
      <LogOut className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-semantic-error transition-colors" />
    </button>
  );
}
