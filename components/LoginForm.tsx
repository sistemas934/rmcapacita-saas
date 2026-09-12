"use client";

import { useState } from "react";
import { User, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // Autenticación Real usando Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg("Credenciales incorrectas o usuario no encontrado.");
      setIsLoading(false);
    } else {
      // Si es exitoso, redirigimos al dashboard comercial
      router.refresh();
      router.push("/admin");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      
      {/* Mensaje de Error (solo visible si Supabase falla) */}
      {errorMsg && (
        <div className="bg-semantic-error/10 border-l-4 border-semantic-error text-semantic-error p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
          Correo Electrónico
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
            <User className="w-5 h-5" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="saas-input pl-11"
            placeholder="correo@empresa.com"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
            Contraseña
          </label>
          <a href="#" className="text-xs font-bold text-brand-primary hover:text-brand-hover transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
            <Lock className="w-5 h-5" />
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="saas-input pl-11"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 mt-2 text-sm">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Validando credenciales...</span>
          </>
        ) : (
          <>
            <span>Ingresar a tu cuenta</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
