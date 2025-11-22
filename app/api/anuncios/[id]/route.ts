import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';
import { requireAuth } from '@/lib/auth-server';
import { 
  sanitizeNomeProduto, 
  sanitizeDescricao,
  validarPreco,
  validarWhatsApp,
  validarCategoria,
  validarCondicao,
  validarFormasPagamento,
  validarUrlsImagens,
  validarQuantidadeImagens
} from '@/lib/security';
import { CATEGORIAS, CONDICOES, FORMAS_PAGAMENTO } from '@/lib/categorias';

// GET - Buscar anúncio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const { data, error } = await supabaseAdmin
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { erro: error.message },
        { status: 404 }
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

// DELETE - Deletar anúncio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // VALIDAÇÃO DE AUTENTICAÇÃO - Extrair user_id do token JWT
    const authResult = await requireAuth(request);
    if ('response' in authResult) {
      return authResult.response;
    }
    const { usuario } = authResult;
    
    const { id } = params;
    
    // Buscar o produto para verificar o dono
    const { data: produto, error: produtoError } = await supabaseAdmin
      .from('produtos')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (produtoError || !produto) {
      return NextResponse.json(
        { erro: 'anúncio não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se é admin ou proprietário
    const isProprietario = usuario.id === produto.user_id;
    const admin = isAdmin(usuario.email);
    
    if (!isProprietario && !admin) {
      return NextResponse.json(
        { erro: 'você não tem permissão para deletar este anúncio' },
        { status: 403 }
      );
    }
    
    // Log apenas em desenvolvimento (sem expor email)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🗑️ Deletando anúncio ID: ${id} (Admin: ${admin}, Proprietário: ${isProprietario})`);
    }
    
    const { error } = await supabaseAdmin
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { erro: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { mensagem: 'anúncio deletado com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { erro: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar anúncio
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // VALIDAÇÃO DE AUTENTICAÇÃO - Extrair user_id do token JWT
    const authResult = await requireAuth(request);
    if ('response' in authResult) {
      return authResult.response;
    }
    const { usuario } = authResult;
    
    const { id } = params;
    
    // Receber dados do body (sem userEmail e userId, que agora vêm do token)
    const body = await request.json().catch(() => ({}));
    const { ...dadosAtualizacao } = body;
    
    // Buscar o produto para verificar o dono
    const { data: produto, error: produtoError } = await supabaseAdmin
      .from('produtos')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (produtoError || !produto) {
      return NextResponse.json(
        { erro: 'anúncio não encontrado' },
        { status: 404 }
      );
    }
    
    // VALIDAÇÃO DE AUTORIZAÇÃO
    const isProprietario = usuario.id === produto.user_id;
    const admin = isAdmin(usuario.email);
    
    if (!isProprietario && !admin) {
      return NextResponse.json(
        { erro: 'você não tem permissão para atualizar este anúncio' },
        { status: 403 }
      );
    }
    
    // Sanitizar dados antes de atualizar
    const dadosAtualizados: any = {};
    
    if (dadosAtualizacao.nome !== undefined) {
      dadosAtualizados.nome = sanitizeNomeProduto(dadosAtualizacao.nome).toLowerCase();
    }
    
    if (dadosAtualizacao.descricao !== undefined) {
      dadosAtualizados.descricao = sanitizeDescricao(dadosAtualizacao.descricao).toLowerCase();
    }
    
    if (dadosAtualizacao.preco !== undefined) {
      const validacaoPreco = validarPreco(dadosAtualizacao.preco);
      if (!validacaoPreco.valido || !validacaoPreco.valor) {
        return NextResponse.json(
          { erro: validacaoPreco.mensagem || 'preço inválido' },
          { status: 400 }
        );
      }
      dadosAtualizados.preco = validacaoPreco.valor;
    }
    
    if (dadosAtualizacao.whatsapp !== undefined) {
      if (!validarWhatsApp(dadosAtualizacao.whatsapp)) {
        return NextResponse.json(
          { erro: 'whatsapp inválido (deve ter 11 dígitos)' },
          { status: 400 }
        );
      }
      dadosAtualizados.whatsapp = dadosAtualizacao.whatsapp;
    }
    
    if (dadosAtualizacao.categoria !== undefined) {
      if (!validarCategoria(dadosAtualizacao.categoria, CATEGORIAS)) {
        return NextResponse.json(
          { erro: 'categoria inválida' },
          { status: 400 }
        );
      }
      dadosAtualizados.categoria = dadosAtualizacao.categoria;
    }
    
    if (dadosAtualizacao.condicao !== undefined) {
      if (!validarCondicao(dadosAtualizacao.condicao, CONDICOES)) {
        return NextResponse.json(
          { erro: 'condição inválida' },
          { status: 400 }
        );
      }
      dadosAtualizados.condicao = dadosAtualizacao.condicao;
    }
    
    if (dadosAtualizacao.formas_pagamento !== undefined) {
      const validacaoFormas = validarFormasPagamento(dadosAtualizacao.formas_pagamento, FORMAS_PAGAMENTO);
      if (!validacaoFormas.valido) {
        return NextResponse.json(
          { erro: validacaoFormas.mensagem },
          { status: 400 }
        );
      }
      dadosAtualizados.formas_pagamento = dadosAtualizacao.formas_pagamento;
    }
    
    if (dadosAtualizacao.imagens !== undefined) {
      if (!Array.isArray(dadosAtualizacao.imagens)) {
        return NextResponse.json(
          { erro: 'imagens deve ser um array' },
          { status: 400 }
        );
      }
      
      const validacaoQtd = validarQuantidadeImagens(dadosAtualizacao.imagens.length);
      if (!validacaoQtd.valido) {
        return NextResponse.json(
          { erro: validacaoQtd.mensagem },
          { status: 400 }
        );
      }
      
      const validacaoUrls = validarUrlsImagens(dadosAtualizacao.imagens);
      if (!validacaoUrls.valido) {
        return NextResponse.json(
          { erro: validacaoUrls.mensagem },
          { status: 400 }
        );
      }
      
      dadosAtualizados.imagens = dadosAtualizacao.imagens;
    }
    
    if (dadosAtualizacao.faz_entrega !== undefined) {
      dadosAtualizados.faz_entrega = dadosAtualizacao.faz_entrega;
    }
    
    if (dadosAtualizacao.cidade !== undefined) {
      dadosAtualizados.cidade = dadosAtualizacao.cidade?.toLowerCase();
    }
    
    if (dadosAtualizacao.bairro !== undefined) {
      dadosAtualizados.bairro = dadosAtualizacao.bairro?.toLowerCase();
    }
    
    if (dadosAtualizacao.nome_vendedor !== undefined) {
      dadosAtualizados.nome_vendedor = dadosAtualizacao.nome_vendedor ? sanitizeNomeProduto(dadosAtualizacao.nome_vendedor).toLowerCase() : null;
    }
    
    // Não permitir atualizar user_id, id ou created_at
    delete dadosAtualizados.user_id;
    delete dadosAtualizados.id;
    delete dadosAtualizados.created_at;
    
    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Atualizando anúncio ID: ${id} (Admin: ${admin}, Proprietário: ${isProprietario})`);
    }
    
    const { data, error } = await supabaseAdmin
      .from('produtos')
      .update(dadosAtualizados)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json(
        { erro: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        mensagem: 'anúncio atualizado com sucesso',
        produto: data[0]
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { erro: error.message },
      { status: 500 }
    );
  }
}

