// Sistema de administração

// Lista de emails de administradores
// Adicione aqui os emails dos admins
const ADMIN_EMAILS = [
  'admin@used.com',
  // Adicione mais emails de admin aqui
];

/**
 * Verifica se um email é de um administrador
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Verifica se o usuário logado é admin
 */
export async function verificarAdmin(user: any): Promise<boolean> {
  if (!user || !user.email) return false;
  return isAdmin(user.email);
}

