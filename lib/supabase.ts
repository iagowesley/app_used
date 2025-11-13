// Cliente do Supabase configurado para uso no frontend
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing or not configured. Please check your .env.local file and add your Supabase project URL from https://app.supabase.com > Settings > API');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or not configured. Please check your .env.local file and add your Supabase anon key from https://app.supabase.com > Settings > API');
}

// Cliente para uso no CLIENT-SIDE (com RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para uso no SERVER-SIDE (API Routes) - BYPASSA RLS
// Use este cliente nas rotas API para evitar problemas com RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

// Tipos para o banco de dados
export interface Produto {
  id: number;
  user_id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagens: string[]; // Array de URLs das imagens
  whatsapp: string; // Número do WhatsApp
  categoria: string; // Categoria do produto
  condicao: string; // Condição do produto (novo, seminovo, usado)
  formas_pagamento: string[]; // Formas de pagamento aceitas
  faz_entrega: boolean; // Se o vendedor faz entrega
  created_at?: string;
}

export interface Pedido {
  id: number;
  produto_id: number | null;
  payment_id: string;
  status: string;
  valor: number;
  payer_email: string | null;
  external_reference: string | null;
  data_pagamento: string;
  created_at: string;
  updated_at: string;
  produto?: Produto; // Produto relacionado (join)
}
