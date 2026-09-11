import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl);
console.log("KEY:", supabaseKey ? "Present" : "Missing");

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error, count } = await supabase.from('companies').select('*', { count: 'exact', head: true });
  console.log("Error:", error);
  console.log("Count:", count);
  console.log("Data:", data);
}

test();
