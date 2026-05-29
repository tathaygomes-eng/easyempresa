import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase] URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NAO CONFIGURADA');
console.log('[Supabase] Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NAO CONFIGURADA');

if (!supabaseUrl || !supabaseKey) {
    console.error('Variaveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nao configuradas.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
);
