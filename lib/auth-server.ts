// Helper para autenticação no servidor (API Routes)
// Extrai e valida o token JWT do header Authorization
import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase';

export interface UsuarioAutenticado {
  id: string;
  email: string;
}

/**
 * Extrai e valida o token JWT do header Authorization
 * Retorna o usuário autenticado ou null se não autenticado
 */
export async function obterUsuarioDoToken(request: NextRequest): Promise<UsuarioAutenticado | null> {
  try {
    // Obter o token do header Authorization
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    // Extrair o token (remover "Bearer ")
    const token = authHeader.substring(7);
    
    if (!token) {
      return null;
    }
    
    // Validar o token usando o Supabase Admin
    // O Supabase valida automaticamente o JWT e retorna o usuário
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[auth] Erro ao validar token:', error?.message);
      }
      return null;
    }
    
    // Retornar usuário autenticado
    return {
      id: user.id,
      email: user.email || '',
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[auth] Erro ao extrair usuário do token:', error);
    }
    return null;
  }
}

/**
 * Middleware helper para proteger rotas
 * Retorna o usuário autenticado ou uma resposta de erro
 */
export async function requireAuth(request: NextRequest): Promise<{
  usuario: UsuarioAutenticado;
} | {
  response: Response;
}> {
  const usuario = await obterUsuarioDoToken(request);
  
  if (!usuario) {
    return {
      response: new Response(
        JSON.stringify({ erro: 'não autenticado. token inválido ou ausente' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }
  
  return { usuario };
}

