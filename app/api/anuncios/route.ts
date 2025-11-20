import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  sanitizeNomeProduto, 
  sanitizeDescricao, 
  validarPreco, 
  validarWhatsApp,
  validarQuantidadeImagens 
} from '@/lib/security';

// POST - Criar novo anúncio
export async function POST(request: NextRequest) {
  try {
    // **BREAKPOINT AQUI** - Início da função
    console.log('🔥 Iniciando cadastro de anúncio...');
    
    const body = await request.json();
    const { nome, descricao, preco, whatsapp, user_id, imagens_urls, categoria, condicao, formas_pagamento } = body;

    // **BREAKPOINT AQUI** - Após receber os dados
    console.log('📦 Dados recebidos:', { nome, descricao, preco, whatsapp, user_id, categoria, condicao, formas_pagamento });

    // Validações
    if (!nome || !descricao || !preco || !whatsapp || !user_id || !categoria || !condicao) {
      return NextResponse.json(
        { erro: 'todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (!formas_pagamento || formas_pagamento.length === 0) {
      return NextResponse.json(
        { erro: 'selecione pelo menos uma forma de pagamento' },
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
    }

    // **BREAKPOINT AQUI** - Antes de sanitizar
    console.log('🧹 Sanitizando dados...');
    
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

    // **BREAKPOINT AQUI** - Antes de validar preço
    console.log('💰 Validando preço...');
    
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

    // **BREAKPOINT AQUI** - Antes de inserir no banco
    console.log('💾 Inserindo no banco de dados...');
    
    // Inserir no banco (usando supabaseAdmin para bypassar RLS)
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
      console.error('Erro ao inserir:', error);
      return NextResponse.json(
        { erro: error.message },
        { status: 500 }
      );
    }

    // **BREAKPOINT AQUI** - Sucesso
    
    return NextResponse.json(
      { 
        mensagem: 'anúncio criado com sucesso',
        produto: data[0]
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Erro no servidor:', error);
    return NextResponse.json(
      { erro: error.message || 'erro ao criar anúncio' },
      { status: 500 }
    );
  }
}

// GET - Listar todos os anúncios
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Buscando anúncios...');
    
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

