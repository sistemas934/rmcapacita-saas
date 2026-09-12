"use client";
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("¡Cuenta creada exitosamente! Ahora inicias sesión automáticamente.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      // Lógica de Redirección (El Patovica Inteligente)
      const { data: roleData } = await supabase.from('user_roles').select('*').eq('email', email).single();
      
      if (roleData?.role === 'SUPERADMIN') {
        router.push('/superadmin');
      } else if (roleData?.role === 'TENANT_ADMIN') {
        router.push('/admin');
      } else {
        // Por defecto, o si es PROVIDER
        router.push('/proveedor');
      }

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl border border-slate-100">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 relative rounded-xl overflow-hidden mb-5 border-2 border-slate-100 shadow-sm">
            <img src="/logo.png" alt="RM Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center leading-tight">Control de Proveedores<br/>y Documentación</h1>
          <p className="text-slate-500 font-bold text-xs mt-2 uppercase tracking-widest">Portal de Acceso Corporativo</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-medium text-slate-800" 
              placeholder="admin@empresa.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">Contraseña</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-medium text-slate-800" 
              placeholder="••••••••" 
            />
          </div>
          
          <button disabled={loading} type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 mt-4 text-lg shadow-lg shadow-brand-primary/30">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? 'Crear Cuenta' : 'Ingresar al Portal')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-sm text-slate-500 hover:text-brand-primary hover:underline font-bold transition-colors"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
