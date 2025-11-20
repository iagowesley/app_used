// Sistema de administração

// Lista de emails de administradores
// Os emails são carregados de variáveis de ambiente para segurança
// Configure ADMIN_EMAILS no arquivo .env.local separando por vírgula
// Exemplo: ADMIN_EMAILS=admin@used.com,outro@email.com
const getAdminEmails = (): string[] => {
  // Server-side apenas: carregar de variáveis de ambiente
  if (typeof window !== 'undefined') {
    // Client-side: retornar array vazio (não expor emails)
    return [];
  }
  
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  if (!adminEmailsEnv) {
    // Fallback para desenvolvimento (remover em produção)
    return ['admin@used.com'];
  }
  
  return adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
};

/**
 * Verifica se um email é de um administrador (server-side apenas)
 * Para client-side, use a API route /api/admin/verificar
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Verifica se o usuário logado é admin
 * @deprecated Use a API route /api/admin/verificar no client-side
 * Esta função só funciona no server-side
 */
export async function verificarAdmin(user: any): Promise<boolean> {
  if (!user || !user.email) return false;
  return isAdmin(user.email);
}

