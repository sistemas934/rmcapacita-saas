"use client";

import { useState } from "react";
import { Building, Hash, MapPin, Save, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UsuariosPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const legal_name = formData.get("legal_name") as string;
    const tax_id = formData.get("tax_id") as string;
    const city = formData.get("city") as string;
    const providerEmail = formData.get("providerEmail") as string;

    try {
      // 1. Obtenemos el usuario logueado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión expirada");

      // 2. Buscamos a qué tenant pertenece este administrador
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('email', user.email)
        .single();

      if (roleError || !roleData?.tenant_id) {
        throw new Error("No tienes permisos de administrador para un tenant específico.");
      }

      // 3. Insertamos la nueva empresa proveedora asociándola a tu tenant y capturamos su ID
      const { data: newCompany, error: insertError } = await supabase.from("companies").insert([
        {
          tenant_id: roleData.tenant_id,
          legal_name,
          tax_id,
          city,
        },
      ]).select('id').single();

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("Ya existe una empresa registrada con ese CUIT/RUT.");
        }
        throw insertError;
      }

      // 4. Registrar la "Llave" de acceso para el proveedor
      if (providerEmail) {
        const { error: roleInsertError } = await supabase.from('user_roles').insert({
          email: providerEmail,
          role: 'PROVIDER',
          tenant_id: roleData.tenant_id,
          company_id: newCompany.id
        });
        
        if (roleInsertError) throw roleInsertError;
      }

      // 5. Si todo sale bien, volvemos al dashboard y refrescamos la tabla
      alert(`Empresa registrada con éxito. El proveedor ya puede ingresar con el correo: ${providerEmail}`);
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar la empresa.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Registrar Proveedor</h2>
          <p className="text-slate-500 text-sm">Da de alta a una nueva empresa contratista en tu directorio.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {error && (
            <div className="p-4 bg-red-50 text-semantic-error rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Campo: Nombre Legal */}
          <div className="space-y-2">
            <label htmlFor="legal_name" className="block text-sm font-bold text-slate-700">
              Razón Social de la Empresa <span className="text-brand-primary">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="legal_name"
                id="legal_name"
                required
                className="pl-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                placeholder="Ej. Servicios Industriales S.A."
              />
            </div>
          </div>

          {/* Fila: CUIT y Ciudad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo: CUIT */}
            <div className="space-y-2">
              <label htmlFor="tax_id" className="block text-sm font-bold text-slate-700">
                CUIT / RUT <span className="text-brand-primary">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="tax_id"
                  id="tax_id"
                  required
                  className="pl-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                  placeholder="Ej. 30-98765432-1"
                />
              </div>
            </div>

            {/* Campo: Ciudad */}
            <div className="space-y-2">
              <label htmlFor="city" className="block text-sm font-bold text-slate-700">
                Ciudad (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="city"
                  id="city"
                  className="pl-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                  placeholder="Ej. Neuquén"
                />
              </div>
            </div>

            {/* Campo: Email de Acceso */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="providerEmail" className="block text-sm font-bold text-slate-700">
                Correo de Acceso del Proveedor <span className="text-brand-primary">*</span>
              </label>
              <input
                type="email"
                name="providerEmail"
                id="providerEmail"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                placeholder="Ej. accesos@serviciospetroleros.com"
              />
              <p className="text-xs text-slate-500 font-medium">
                La empresa contratista usará este correo para ingresar a su panel privado.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {loading ? "Guardando..." : "Registrar Empresa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
