// Middleware de Rate Limiting e Segurança
import { NextRequest, NextResponse } from 'next/server';

// Configuração de Rate Limiting
const RATE_LIMIT_CONFIG = {
  // Limite de requisições por IP
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: {
    // Rotas públicas (GET)
    public: 100, // 100 requisições por minuto
    // Rotas autenticadas (POST, PUT, DELETE)
    authenticated: 30, // 30 requisições por minuto
    // Rotas de upload
    upload: 10, // 10 requisições por minuto
  },
};

// Armazenamento em memória para rate limiting
// Em produção, considere usar Redis ou outro sistema distribuído
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Obtém o IP do cliente da requisição
 */
function getClientIP(request: NextRequest): string {
  // Tentar obter o IP de vários headers (para proxies/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  // Fallback para conexão direta
  return request.ip || 'unknown';
}

/**
 * Verifica se a requisição excedeu o rate limit
 */
function verificarRateLimit(
  ip: string,
  method: string,
  pathname: string
): { permitido: boolean; resetTime?: number } {
  const agora = Date.now();
  
  // Determinar o tipo de rota
  let tipoRota: 'public' | 'authenticated' | 'upload';
  
  if (pathname.includes('/upload') || pathname.includes('/storage')) {
    tipoRota = 'upload';
  } else if (method === 'GET' || method === 'HEAD') {
    tipoRota = 'public';
  } else {
    tipoRota = 'authenticated';
  }
  
  const maxRequests = RATE_LIMIT_CONFIG.maxRequests[tipoRota];
  const chave = `${ip}:${tipoRota}`;
  
  // Obter registro existente
  const registro = rateLimitMap.get(chave);
  
  // Se não há registro ou a janela expirou, criar novo
  if (!registro || agora > registro.resetTime) {
    rateLimitMap.set(chave, {
      count: 1,
      resetTime: agora + RATE_LIMIT_CONFIG.windowMs,
    });
    return { permitido: true };
  }
  
  // Verificar se excedeu o limite
  if (registro.count >= maxRequests) {
    return {
      permitido: false,
      resetTime: registro.resetTime,
    };
  }
  
  // Incrementar contador
  registro.count++;
  return { permitido: true };
}

/**
 * Limpa registros expirados periodicamente
 */
function limparRegistrosExpirados() {
  const agora = Date.now();
  const chavesParaRemover: string[] = [];
  
  rateLimitMap.forEach((registro, chave) => {
    if (agora > registro.resetTime) {
      chavesParaRemover.push(chave);
    }
  });
  
  chavesParaRemover.forEach(chave => rateLimitMap.delete(chave));
}

// Limpar registros expirados a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(limparRegistrosExpirados, 5 * 60 * 1000);
}

/**
 * Middleware principal
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // Aplicar rate limiting apenas em rotas de API
  if (pathname.startsWith('/api/')) {
    const ip = getClientIP(request);
    const rateLimit = verificarRateLimit(ip, method, pathname);
    
    if (!rateLimit.permitido) {
      const resetTime = rateLimit.resetTime || Date.now() + RATE_LIMIT_CONFIG.windowMs;
      const resetDate = new Date(resetTime).toISOString();
      
      return new NextResponse(
        JSON.stringify({
          erro: 'muitas requisições. tente novamente mais tarde.',
          resetTime: resetDate,
        }),
        {
          status: 429, // Too Many Requests
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.maxRequests.authenticated),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
          },
        }
      );
    }
  }
  
  // Continuar com a requisição normalmente
  return NextResponse.next();
}

// Configuração de quais rotas o middleware deve interceptar
export const config = {
  matcher: [
    '/api/:path*', // Aplicar em todas as rotas de API
  ],
};

