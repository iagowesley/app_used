// Dashboard do Admin
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Produto } from '@/lib/supabase';
import styles from './dashboard.module.css';

interface Estatisticas {
  totalAnuncios: number;
  anunciosVendidos: number;
  anunciosDisponiveis: number;
  anunciosRecentes: number;
  valorTotalDisponivel: number;
  valorTotalVendido: number;
  valorTotalGeral: number;
  anunciosPorCategoria: Record<string, number>;
  anunciosPorCondicao: Record<string, number>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'disponiveis' | 'vendidos'>('todos');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    verificarAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin && user) {
      carregarDados();
    }
  }, [isAdmin, user]);

  const verificarAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      // Verificar se é admin
      const response = await fetch('/api/admin/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });
      
      const data = await response.json();
      
      if (!data.isAdmin) {
        alert('acesso negado. apenas administradores podem acessar esta página.');
        router.push('/');
        return;
      }
      
      setIsAdmin(true);
    } catch (error) {
      console.error('erro ao verificar admin:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const carregarDados = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/admin/dashboard?email=${encodeURIComponent(user.email)}`);
      
      if (!response.ok) {
        throw new Error('erro ao carregar dados');
      }
      
      const data = await response.json();
      setEstatisticas(data.estatisticas);
      setProdutos(data.produtos || []);
    } catch (error) {
      console.error('erro ao carregar dados do dashboard:', error);
      alert('erro ao carregar dados do dashboard');
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const produtosFiltrados = produtos.filter(p => {
    // Filtro de status
    if (filtro === 'disponiveis' && p.vendido) return false;
    if (filtro === 'vendidos' && !p.vendido) return false;
    
    // Filtro de busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      return (
        p.nome?.toLowerCase().includes(buscaLower) ||
        p.descricao?.toLowerCase().includes(buscaLower) ||
        p.categoria?.toLowerCase().includes(buscaLower)
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loadingContainer}>
          <div className="loading"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container">
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1 className={styles.title}>dashboard admin</h1>
          <button 
            onClick={() => router.push('/')}
            className={styles.backButton}
          >
            ← voltar
          </button>
        </div>

        {/* Cards de Estatísticas */}
        {estatisticas && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>total de anúncios</h3>
              <p className={styles.statValue}>{estatisticas.totalAnuncios}</p>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>disponíveis</h3>
              <p className={styles.statValue}>{estatisticas.anunciosDisponiveis}</p>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>vendidos</h3>
              <p className={styles.statValue}>{estatisticas.anunciosVendidos}</p>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>recentes (7 dias)</h3>
              <p className={styles.statValue}>{estatisticas.anunciosRecentes}</p>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>valor total disponível</h3>
              <p className={styles.statValue}>{formatarMoeda(estatisticas.valorTotalDisponivel)}</p>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>valor total vendido</h3>
              <p className={styles.statValue}>{formatarMoeda(estatisticas.valorTotalVendido)}</p>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>valor total geral</h3>
              <p className={styles.statValue}>{formatarMoeda(estatisticas.valorTotalGeral)}</p>
            </div>
          </div>
        )}

        {/* Filtros e Busca */}
        <div className={styles.filters}>
          <div className={styles.filterButtons}>
            <button
              onClick={() => setFiltro('todos')}
              className={`${styles.filterButton} ${filtro === 'todos' ? styles.active : ''}`}
            >
              todos
            </button>
            <button
              onClick={() => setFiltro('disponiveis')}
              className={`${styles.filterButton} ${filtro === 'disponiveis' ? styles.active : ''}`}
            >
              disponíveis
            </button>
            <button
              onClick={() => setFiltro('vendidos')}
              className={`${styles.filterButton} ${filtro === 'vendidos' ? styles.active : ''}`}
            >
              vendidos
            </button>
          </div>

          <input
            type="text"
            placeholder="buscar anúncio..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Tabela de Anúncios */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>id</th>
                <th>nome</th>
                <th>categoria</th>
                <th>preço</th>
                <th>status</th>
                <th>data criação</th>
                <th>ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.noData}>
                    nenhum anúncio encontrado
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.id}</td>
                    <td className={styles.productName}>{produto.nome}</td>
                    <td>{produto.categoria}</td>
                    <td>{formatarMoeda(produto.preco)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${produto.vendido ? styles.vendido : styles.disponivel}`}>
                        {produto.vendido ? 'vendido' : 'disponível'}
                      </span>
                    </td>
                    <td>
                      {produto.created_at
                        ? new Date(produto.created_at).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td>
                      <button
                        onClick={() => router.push(`/produto/${produto.id}/${produto.nome?.toLowerCase().replace(/\s+/g, '-')}`)}
                        className={styles.actionButton}
                      >
                        ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

