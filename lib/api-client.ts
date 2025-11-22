// Helper para fazer requisições autenticadas no frontend
// Obtém o token JWT do Supabase e adiciona ao header Authorization
import { supabase } from './supabase';

/**
 * Obtém o token JWT da sessão atual do Supabase
 */
export async function obterTokenJWT(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.access_token) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[api-client] Erro ao obter token:', error?.message);
      }
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[api-client] Erro ao obter token:', error);
    }
    return null;
  }
}

/**
 * Cria headers para requisições autenticadas
 */
export async function criarHeadersAutenticados(
  contentType: string = 'application/json'
): Promise<HeadersInit> {
  const token = await obterTokenJWT();
  
  const headers: HeadersInit = {
    'Content-Type': contentType,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Wrapper para fetch com autenticação automática
 */
export async function fetchAutenticado(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await criarHeadersAutenticados();
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
}

