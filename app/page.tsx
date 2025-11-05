// Página inicial - Listagem de produtos
'use client';

import { useEffect, useState } from 'react';
import { supabase, Produto } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { CATEGORIAS } from '@/lib/categorias';
import styles from './page.module.css';

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = !categoriaSelecionada || produto.categoria === categoriaSelecionada;
    return matchBusca && matchCategoria;
  });

  return (
    <>
      {/* Seção Sobre o Used */}
      <div className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>used</h1>
              <p className={styles.heroSubtitle}>
                marketplace minimalista para itens usados e seminovos
              </p>
              <p className={styles.heroDescription}>
                compre e venda produtos de forma simples, rápida e direta. 
                sem complicações. apenas você, o produto e o comprador.
              </p>
            </div>
          </div>
        </div>
        {/* Elementos Decorativos - Direita */}
        <div className={styles.decorativeElements}>
          <div className={styles.floatingIcon} style={{ top: '35%', right: '38%', animationDelay: '1s' }}>🛒</div>
          <div className={styles.floatingIcon} style={{ top: '60%', right: '45%', animationDelay: '2s' }}>🏷️</div>
          <div className={styles.floatingIcon} style={{ top: '20%', right: '55%', animationDelay: '2.5s' }}>📦</div>
          
          <div className={styles.geometricShape} style={{ top: '15%', right: '40%', animationDelay: '0s' }}></div>
          <div className={styles.geometricShape} style={{ top: '50%', right: '35%', animationDelay: '1s' }}></div>
          <div className={styles.geometricShape} style={{ top: '70%', right: '52%', animationDelay: '2s' }}></div>
          
          <div className={styles.priceTag} style={{ top: '30%', right: '45%' }}>#used</div>
          <div className={styles.priceTag} style={{ top: '70%', right: '35%' }}>#semi</div>
        </div>
        
        {/* Elementos Decorativos - Esquerda */}
        <div className={styles.decorativeElementsLeft}>
          
        </div>
      </div>

      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>todos os anúncios</h2>
          <input
            type="text"
            placeholder="buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Filtros de Categoria */}
        <div className={styles.filterContainer}>
          <button
            onClick={() => setCategoriaSelecionada('')}
            className={`${styles.filterButton} ${!categoriaSelecionada ? styles.filterButtonActive : ''}`}
          >
            todas
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoriaSelecionada(cat.value)}
              className={`${styles.filterButton} ${categoriaSelecionada === cat.value ? styles.filterButtonActive : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      {loading ? (
        <div className={styles.loading}>
          <div className="loading"></div>
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <p className={styles.empty}>nenhum anúncio encontrado</p>
      ) : (
        <div className="products-grid">
          {produtosFiltrados.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      )}
      </div>
    </>
  );
}
