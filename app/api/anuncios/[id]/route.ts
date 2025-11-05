import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
    
    console.log(`🗑️ Deletando anúncio ID: ${id}`);
    
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

