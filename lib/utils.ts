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
 */
export function getSiteUrl(): string {
  // Em server-side, tentar usar a variável de ambiente
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || '';
  }
  
  // Em client-side, priorizar variável de ambiente, senão usar window.location.origin
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}

/**
 * Extrai o ID da URL do produto
 * Ex: "/produto/123/bicicleta-aro-26" -> 123
 */
export function extrairIdDaUrl(params: { id: string }): number {
  return parseInt(params.id, 10);
}

