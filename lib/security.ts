// Funções de segurança e validação

/**
 * Sanitiza uma string removendo caracteres potencialmente perigosos
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e > para prevenir XSS básico
    .substring(0, 1000); // Limita tamanho
}

/**
 * Valida força da senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */
export function validarSenhaForte(senha: string): { valida: boolean; mensagem: string } {
  if (!senha) {
    return { valida: false, mensagem: 'senha é obrigatória' };
  }

  if (senha.length < 8) {
    return { valida: false, mensagem: 'senha deve ter pelo menos 8 caracteres' };
  }

  if (senha.length > 128) {
    return { valida: false, mensagem: 'senha muito longa (máximo 128 caracteres)' };
  }

  if (!/[a-z]/.test(senha)) {
    return { valida: false, mensagem: 'senha deve conter pelo menos uma letra minúscula' };
  }

  if (!/[A-Z]/.test(senha)) {
    return { valida: false, mensagem: 'senha deve conter pelo menos uma letra maiúscula' };
  }

  if (!/[0-9]/.test(senha)) {
    return { valida: false, mensagem: 'senha deve conter pelo menos um número' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
    return { valida: false, mensagem: 'senha deve conter pelo menos um caractere especial (!@#$%^&* etc)' };
  }

  // Senhas comuns/fracas
  const senhasComuns = [
    'password', '12345678', 'qwerty123', 'abc123456', 
    'password123', 'admin123', 'letmein123'
  ];
  
  if (senhasComuns.some(comum => senha.toLowerCase().includes(comum))) {
    return { valida: false, mensagem: 'senha muito comum, escolha uma senha mais forte' };
  }

  return { valida: true, mensagem: 'senha válida' };
}

/**
 * Valida formato de email
 */
export function validarEmail(email: string): boolean {
  if (!email) return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 254;
}

/**
 * Valida formato de WhatsApp (11 dígitos)
 */
export function validarWhatsApp(whatsapp: string): boolean {
  if (!whatsapp) return false;
  
  const numeros = whatsapp.replace(/\D/g, '');
  return numeros.length === 11;
}

/**
 * Valida preço
 */
export function validarPreco(preco: string | number): { valido: boolean; valor?: number; mensagem?: string } {
  const precoNum = typeof preco === 'string' ? parseFloat(preco) : preco;
  
  if (isNaN(precoNum)) {
    return { valido: false, mensagem: 'preço inválido' };
  }
  
  if (precoNum < 0) {
    return { valido: false, mensagem: 'preço não pode ser negativo' };
  }
  
  if (precoNum > 1000000) {
    return { valido: false, mensagem: 'preço muito alto (máximo R$ 1.000.000)' };
  }
  
  return { valido: true, valor: precoNum };
}

/**
 * Valida tipo e tamanho de arquivo de imagem
 */
export function validarImagem(file: File): { valido: boolean; mensagem?: string } {
  // Verificar tipo
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!tiposPermitidos.includes(file.type)) {
    return { valido: false, mensagem: 'tipo de arquivo não permitido. use jpg, png, webp ou gif' };
  }
  
  // Verificar tamanho (máximo 5MB)
  const tamanhoMaximo = 5 * 1024 * 1024; // 5MB em bytes
  
  if (file.size > tamanhoMaximo) {
    return { valido: false, mensagem: 'arquivo muito grande. tamanho máximo: 5mb' };
  }
  
  if (file.size < 1024) { // Mínimo 1KB
    return { valido: false, mensagem: 'arquivo muito pequeno ou corrompido' };
  }
  
  return { valido: true };
}

/**
 * Valida quantidade de imagens
 */
export function validarQuantidadeImagens(quantidade: number): { valido: boolean; mensagem?: string } {
  if (quantidade < 3) {
    return { valido: false, mensagem: 'envie pelo menos 3 fotos do produto' };
  }
  
  if (quantidade > 6) {
    return { valido: false, mensagem: 'máximo de 6 fotos permitidas' };
  }
  
  return { valido: true };
}

/**
 * Sanitiza texto de descrição
 */
export function sanitizeDescricao(descricao: string): string {
  if (!descricao) return '';
  
  return descricao
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 2000); // Limite de 2000 caracteres
}

/**
 * Sanitiza nome de produto
 */
export function sanitizeNomeProduto(nome: string): string {
  if (!nome) return '';
  
  return nome
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 200); // Limite de 200 caracteres
}

/**
 * Verifica se o usuário é proprietário do recurso
 */
export function verificarProprietario(userId: string | undefined, resourceOwnerId: string): boolean {
  if (!userId || !resourceOwnerId) return false;
  return userId === resourceOwnerId;
}

/**
 * Rate limiting simples no cliente (evita spam)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function verificarRateLimit(chave: string, limiteRequisicoes: number = 5, janelaTempo: number = 60000): boolean {
  const agora = Date.now();
  const registro = rateLimitMap.get(chave);
  
  if (!registro || agora > registro.resetTime) {
    // Nova janela de tempo
    rateLimitMap.set(chave, {
      count: 1,
      resetTime: agora + janelaTempo
    });
    return true;
  }
  
  if (registro.count >= limiteRequisicoes) {
    return false; // Excedeu o limite
  }
  
  // Incrementa contador
  registro.count++;
  return true;
}

/**
 * Gera hash simples para identificação (não use para senhas!)
 */
export function gerarHashSimples(texto: string): string {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    const char = texto.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Valida URL de imagem do Supabase
 */
export function validarUrlSupabase(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase.co') && 
           (urlObj.protocol === 'https:' || urlObj.protocol === 'http:');
  } catch {
    return false;
  }
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
export function escaparHTML(texto: string): string {
  if (!texto) return '';
  
  const mapa: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return texto.replace(/[&<>"'/]/g, (char) => mapa[char]);
}

