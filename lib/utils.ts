// Funções utilitárias

/**
 * Gera um slug amigável a partir do nome do produto
 * Ex: "Bicicleta Aro 26" -> "bicicleta-aro-26"
 */
export function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
}

/**
 * Gera a URL completa do produto com ID e slug
 * Ex: "/produto/123/bicicleta-aro-26"
 */
export function gerarUrlProduto(id: number, nome: string): string {
  const slug = gerarSlug(nome);
  return `/produto/${id}/${slug}`;
}

/**
 * Obtém a URL base do site
 * Prioriza NEXT_PUBLIC_SITE_URL (configurado no Netlify)
 * Se não estiver disponível, usa window.location.origin (funciona automaticamente)
 * 
 * Use esta função sempre que precisar da URL do site para redirecionamentos
 * 
 * @returns URL válida do site (sem barra final)
 */
export function getSiteUrl(): string {
  // Em client-side, priorizar variável de ambiente, senão usar window.location.origin
  if (typeof window !== 'undefined') {
    const url = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    // Remover barra final se houver e garantir que seja uma URL válida
    return url.replace(/\/+$/, '');
  }
  
  // Em server-side, usar variável de ambiente ou retornar string vazia
  // (não podemos usar window.location.origin em server-side)
  const url = process.env.NEXT_PUBLIC_SITE_URL || '';
  return url.replace(/\/+$/, '');
}

/**
 * Extrai o ID da URL do produto
 * Ex: "/produto/123/bicicleta-aro-26" -> 123
 */
export function extrairIdDaUrl(params: { id: string }): number {
  return parseInt(params.id, 10);
}

/**
 * Gera URL completa do produto para compartilhamento
 */
export function gerarUrlCompletaProduto(id: number, nome: string): string {
  const slug = gerarSlug(nome);
  const siteUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_SITE_URL || '';
  return `${siteUrl}/produto/${id}/${slug}`;
}

/**
 * Gera mensagem de compartilhamento para o produto
 */
export function gerarMensagemCompartilhamento(nome: string, preco: number, url: string): string {
  return `🔔 Olha que oportunidade incrível que encontrei!\n\n` +
         `✨ ${nome}\n` +
         `💰 Apenas R$ ${preco.toFixed(2)}\n\n` +
         `👉 Confira aqui: ${url}\n\n` +
         `💬 Mostre pro seu amigo que tá precisando! Compartilhe e indique! 😊`;
}

