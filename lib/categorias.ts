// Constantes de categorias de produtos

export const CATEGORIAS = [
  { value: 'eletronicos', label: 'eletrônicos' },
  { value: 'eletrodomesticos', label: 'eletrodomésticos' },
  { value: 'moveis', label: 'móveis' },
  { value: 'veiculos', label: 'veículos' },
  { value: 'esportes', label: 'esportes e lazer' },
  { value: 'moda', label: 'moda e acessórios' },
  { value: 'livros', label: 'livros e revistas' },
  { value: 'games', label: 'games e consoles' },
  { value: 'infantil', label: 'infantil' },
  { value: 'instrumentos', label: 'instrumentos musicais' },
  { value: 'ferramentas', label: 'ferramentas' },
  { value: 'decoracao', label: 'decoração' },
  { value: 'outros', label: 'outros' },
] as const;

export type CategoriaValue = typeof CATEGORIAS[number]['value'];

export const getCategoriaLabel = (value: string): string => {
  const categoria = CATEGORIAS.find(c => c.value === value);
  return categoria ? categoria.label : value;
};

// Condições do produto
export const CONDICOES = [
  { value: 'novo', label: 'novo', emoji: '' },
  { value: 'seminovo', label: 'seminovo', emoji: '' },
  { value: 'usado', label: 'usado', emoji: '' },
] as const;

export type CondicaoValue = typeof CONDICOES[number]['value'];

export const getCondicaoLabel = (value: string): string => {
  const condicao = CONDICOES.find(c => c.value === value);
  return condicao ? condicao.label : value;
};

export const getCondicaoEmoji = (value: string): string => {
  const condicao = CONDICOES.find(c => c.value === value);
  return condicao ? condicao.emoji : '';
};

// Formas de pagamento
export const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'pix', emoji: '' },
  { value: 'dinheiro', label: 'dinheiro', emoji: '' },
  { value: 'cartao_credito', label: 'cartão de crédito', emoji: '' },
  { value: 'cartao_debito', label: 'cartão de débito', emoji: '' },
  { value: 'transferencia', label: 'transferência', emoji: '' },
] as const;

export type FormaPagamentoValue = typeof FORMAS_PAGAMENTO[number]['value'];

export const getFormaPagamentoLabel = (value: string): string => {
  const forma = FORMAS_PAGAMENTO.find(f => f.value === value);
  return forma ? forma.label : value;
};

export const getFormaPagamentoEmoji = (value: string): string => {
  const forma = FORMAS_PAGAMENTO.find(f => f.value === value);
  return forma ? forma.emoji : '';
};

// Cidades do Vale do Jaguaribe - CE (ordenadas alfabeticamente)
export const CIDADES_VALE_JAGUARIBE = [
  { value: 'alto santo', label: 'alto santo' },
  { value: 'aracati', label: 'aracati' },
  { value: 'ererê', label: 'ererê' },
  { value: 'fortim', label: 'fortim' },
  { value: 'ibicuitinga', label: 'ibicuitinga' },
  { value: 'icapuí', label: 'icapuí' },
  { value: 'iracema', label: 'iracema' },
  { value: 'itaiçaba', label: 'itaiçaba' },
  { value: 'jaguaretama', label: 'jaguaretama' },
  { value: 'jaguaribara', label: 'jaguaribara' },
  { value: 'jaguaribe', label: 'jaguaribe' },
  { value: 'jaguaruana', label: 'jaguaruana' },
  { value: 'limoeiro do norte', label: 'limoeiro do norte' },
  { value: 'morada nova', label: 'morada nova' },
  { value: 'palhano', label: 'palhano' },
  { value: 'pereiro', label: 'pereiro' },
  { value: 'potiretama', label: 'potiretama' },
  { value: 'quixeré', label: 'quixeré' },
  { value: 'russas', label: 'russas' },
  { value: 'são joão do jaguaribe', label: 'são joão do jaguaribe' },
  { value: 'tabuleiro do norte', label: 'tabuleiro do norte' },
] as const;

export type CidadeValeJaguaribeValue = typeof CIDADES_VALE_JAGUARIBE[number]['value'];

