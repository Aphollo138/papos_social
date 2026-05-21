/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Usando os valores fornecidos como fallback para evitar erros de inicialização no preview
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wizcjbmsxjflzfwiipaa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ayB_r6gz_VMN_0Piwsnkaw_kobSUXqc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
