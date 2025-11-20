// API Route para buscar dados do dashboard do admin
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin via query param (vindo do frontend)
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    
    if (!userEmail) {
      return NextResponse.json(
        { erro: 'email não fornecido' },
        { status: 401 }
      );
    }
    
    if (!isAdmin(userEmail)) {
      return NextResponse.json(
        { erro: 'acesso negado. apenas administradores' },
        { status: 403 }
      );
    }
    
    // Buscar todos os anúncios
    const { data: produtos, error } = await supabaseAdmin
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json(
        { erro: error.message },
        { status: 500 }
      );
    }
    
    // Calcular estatísticas
    const totalAnuncios = produtos?.length || 0;
    const anunciosVendidos = produtos?.filter(p => p.vendido)?.length || 0;
    const anunciosDisponiveis = totalAnuncios - anunciosVendidos;
    
    // Calcular valores
    const valorTotalDisponivel = produtos
      ?.filter(p => !p.vendido)
      ?.reduce((sum, p) => sum + (p.preco || 0), 0) || 0;
    
    const valorTotalVendido = produtos
      ?.filter(p => p.vendido)
      ?.reduce((sum, p) => sum + (p.preco || 0), 0) || 0;
    
    const valorTotalGeral = valorTotalDisponivel + valorTotalVendido;
    
    // Anúncios por categoria
    const anunciosPorCategoria: Record<string, number> = {};
    produtos?.forEach(p => {
      const categoria = p.categoria || 'sem categoria';
      anunciosPorCategoria[categoria] = (anunciosPorCategoria[categoria] || 0) + 1;
    });
    
    // Anúncios por condição
    const anunciosPorCondicao: Record<string, number> = {};
    produtos?.forEach(p => {
      const condicao = p.condicao || 'sem condição';
      anunciosPorCondicao[condicao] = (anunciosPorCondicao[condicao] || 0) + 1;
    });
    
    // Anúncios recentes (últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const anunciosRecentes = produtos?.filter(p => {
      if (!p.created_at) return false;
      return new Date(p.created_at) >= seteDiasAtras;
    })?.length || 0;
    
    return NextResponse.json({
      estatisticas: {
        totalAnuncios,
        anunciosVendidos,
        anunciosDisponiveis,
        anunciosRecentes,
        valorTotalDisponivel,
        valorTotalVendido,
        valorTotalGeral,
        anunciosPorCategoria,
        anunciosPorCondicao,
      },
      produtos: produtos || [],
    });
  } catch (error: any) {
    console.error('erro ao buscar dados do dashboard:', error);
    return NextResponse.json(
      { erro: error.message },
      { status: 500 }
    );
  }
}

