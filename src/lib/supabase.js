import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

console.log('--- Environment Check ---');
console.log('Supabase URL Loaded:', !!import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key Loaded:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
