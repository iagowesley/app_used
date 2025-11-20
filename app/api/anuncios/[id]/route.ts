import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

// GET - Buscar anúncio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`🔍 Buscando anúncio ID: ${id}`);
    
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
    const { id } = params;
    
    // Receber dados do body (email e userId do usuário)
    const body = await request.json().catch(() => ({}));
    const { userEmail, userId } = body;
    
    if (!userEmail || !userId) {
      return NextResponse.json(
        { erro: 'dados de autenticação não fornecidos' },
        { status: 401 }
      );
    }
    
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
    const isProprietario = userId === produto.user_id;
    const admin = isAdmin(userEmail);
    
    if (!isProprietario && !admin) {
      return NextResponse.json(
        { erro: 'você não tem permissão para deletar este anúncio' },
        { status: 403 }
      );
    }
    
    console.log(`🗑️ Deletando anúncio ID: ${id} (Admin: ${admin}, Proprietário: ${isProprietario}, Email: ${userEmail})`);
    
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
    const { id } = params;
    const body = await request.json();
    
    console.log(`📝 Atualizando anúncio ID: ${id}`);
    
    const { data, error } = await supabaseAdmin
      .from('produtos')
      .update(body)
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

