
const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:Mentalol1101.@db.ephvsrdzldhsvtmmmsbd.supabase.co:5432/postgres'
});
const query = \
  CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    year INTEGER,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
  );

  CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    internal_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('izaje', 'movimiento_suelo', 'otro')),
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
  );
\;
client.connect()
  .then(() => client.query(query))
  .then(() => { console.log('Exito!'); client.end(); })
  .catch(err => { console.error('Error:', err.message); client.end(); });

