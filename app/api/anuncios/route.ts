import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth-server';
import { 
  sanitizeNomeProduto, 
  sanitizeDescricao, 
  validarPreco, 
  validarWhatsApp,
  validarQuantidadeImagens,
  validarCategoria,
  validarCondicao,
  validarFormasPagamento,
  validarUrlsImagens
} from '@/lib/security';
import { CATEGORIAS, CONDICOES, FORMAS_PAGAMENTO } from '@/lib/categorias';

// POST - Criar novo anúncio
export async function POST(request: NextRequest) {
  try {
    // VALIDAÇÃO DE AUTENTICAÇÃO - Extrair user_id do token JWT
    const authResult = await requireAuth(request);
    if ('response' in authResult) {
      return authResult.response;
    }
    const { usuario } = authResult;
    
    const body = await request.json();
    const { nome, descricao, preco, whatsapp, imagens_urls, categoria, condicao, formas_pagamento } = body;

    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 Iniciando cadastro de anúncio...');
      console.log('📦 Dados recebidos:', { nome, categoria, condicao });
    }

    // user_id agora vem do token JWT validado (não do body)
    const user_id = usuario.id;
    
    // Validações de campos obrigatórios
    if (!nome || !descricao || !preco || !whatsapp || !categoria || !condicao) {
      return NextResponse.json(
        { erro: 'todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar categoria
    if (!validarCategoria(categoria, CATEGORIAS)) {
      return NextResponse.json(
        { erro: 'categoria inválida' },
        { status: 400 }
      );
    }

    // Validar condição
    if (!validarCondicao(condicao, CONDICOES)) {
      return NextResponse.json(
        { erro: 'condição inválida' },
        { status: 400 }
      );
    }

    // Validar formas de pagamento
    const validacaoFormas = validarFormasPagamento(formas_pagamento, FORMAS_PAGAMENTO);
    if (!validacaoFormas.valido) {
      return NextResponse.json(
        { erro: validacaoFormas.mensagem },
        { status: 400 }
      );
    }

    // Validar quantidade de imagens
    if (imagens_urls) {
      const validacaoQtd = validarQuantidadeImagens(imagens_urls.length);
      if (!validacaoQtd.valido) {
        return NextResponse.json(
          { erro: validacaoQtd.mensagem },
          { status: 400 }
        );
      }
      
      // Validar URLs de imagens
      const validacaoUrls = validarUrlsImagens(imagens_urls);
      if (!validacaoUrls.valido) {
        return NextResponse.json(
          { erro: validacaoUrls.mensagem },
          { status: 400 }
        );
      }
    }

    // Sanitizar nome
    const nomeSanitizado = sanitizeNomeProduto(nome);
    if (nomeSanitizado.length < 3) {
      return NextResponse.json(
        { erro: 'nome do produto deve ter pelo menos 3 caracteres' },
        { status: 400 }
      );
    }

    // Sanitizar descrição
    const descricaoSanitizada = sanitizeDescricao(descricao);
    if (descricaoSanitizada.length < 10) {
      return NextResponse.json(
        { erro: 'descrição deve ter pelo menos 10 caracteres' },
        { status: 400 }
      );
    }

    // Validar preço
    const validacaoPreco = validarPreco(preco);
    if (!validacaoPreco.valido || !validacaoPreco.valor) {
      return NextResponse.json(
        { erro: validacaoPreco.mensagem || 'preço inválido' },
        { status: 400 }
      );
    }

    // Validar WhatsApp
    if (!validarWhatsApp(whatsapp)) {
      return NextResponse.json(
        { erro: 'por favor, insira um whatsapp válido (11 dígitos)' },
        { status: 400 }
      );
    }

    // Inserir no banco (usando supabaseAdmin para bypassar RLS)
    // NOTA: user_id já foi validado no frontend, mas é do usuário autenticado
    const { data, error } = await supabaseAdmin
      .from('produtos')
      .insert([
        {
          user_id: user_id,
          nome: nomeSanitizado.toLowerCase(),
          descricao: descricaoSanitizada.toLowerCase(),
          preco: validacaoPreco.valor,
          imagens: imagens_urls || [],
          whatsapp: whatsapp,
          categoria: categoria,
          condicao: condicao,
          formas_pagamento: formas_pagamento,
        },
      ])
      .select();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao inserir:', error);
      }
      return NextResponse.json(
        { erro: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        mensagem: 'anúncio criado com sucesso',
        produto: data[0]
      },
      { status: 201 }
    );

  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro no servidor:', error);
    }
    return NextResponse.json(
      { erro: error.message || 'erro ao criar anúncio' },
      { status: 500 }
    );
  }
}

// GET - Listar todos os anúncios
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { erro: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { erro: error.message },
      { status: 500 }
    );
  }
}

