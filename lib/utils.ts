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
 * Extrai o ID da URL do produto
 * Ex: "/produto/123/bicicleta-aro-26" -> 123
 */
export function extrairIdDaUrl(params: { id: string }): number {
  return parseInt(params.id, 10);
}

