// Página inicial - Listagem de produtos
'use client';

import { useEffect, useState } from 'react';
import { supabase, Produto } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { CATEGORIAS } from '@/lib/categorias';
import AdSidebar from '@/components/AdSidebar';
import styles from './page.module.css';

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState(''); // Valor do input
  const [termoBusca, setTermoBusca] = useState(''); // Termo de busca aplicado
  const [buscando, setBuscando] = useState(false); // Loading da busca
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [condicaoSelecionada, setCondicaoSelecionada] = useState('');

  // Detectar hash fragments de recuperação de senha e redirecionar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    // Verificar se há hash fragments de reset (Supabase usa #access_token=...&type=recovery)
    const hasResetToken = hash.length > 0 && (hash.includes('access_token') || hash.includes('recovery') || hash.includes('type=recovery'));

    if (hasResetToken) {
      // Redirecionar imediatamente para a página de login com reset=true
      // Preservar o hash fragment na URL para que o Supabase possa processá-lo
      // Usar window.location.href para preservar o hash fragment
      window.location.href = `/login?reset=true${hash}`;
      return;
    }
  }, []);

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

  // Função para verificar se produto vendido ainda está dentro das 24 horas
  const produtoAindaVisivel = (produto: Produto): boolean => {
    if (!produto.vendido || !produto.data_vendido) {
      return true; // Produto não vendido, sempre visível
    }

    const dataVendido = new Date(produto.data_vendido);
    const agora = new Date();
    const diferencaHoras = (agora.getTime() - dataVendido.getTime()) / (1000 * 60 * 60);

    return diferencaHoras <= 24; // Visível se vendido há menos de 24 horas
  };

  const executarBusca = async () => {
    setBuscando(true);

    // Simular loading de 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Aplicar o termo de busca
    setTermoBusca(busca);
    setBuscando(false);
  };

  const produtosFiltrados = produtos.filter(produto => {
    // Filtrar produtos vendidos há mais de 24 horas
    if (!produtoAindaVisivel(produto)) {
      return false;
    }

    const matchBusca = !termoBusca || produto.nome.toLowerCase().includes(termoBusca.toLowerCase());
    const matchCategoria = !categoriaSelecionada || produto.categoria === categoriaSelecionada;

    // Filtro de preço
    const preco = produto.preco;
    const min = precoMin ? parseFloat(precoMin) : 0;
    const max = precoMax ? parseFloat(precoMax) : Infinity;
    const matchPreco = preco >= min && preco <= max;

    // Filtro de condição
    const matchCondicao = !condicaoSelecionada || produto.condicao === condicaoSelecionada;

    // Filtro de cidade
    const matchCidade = !cidadeSelecionada || (produto.cidade && produto.cidade.toLowerCase() === cidadeSelecionada.toLowerCase());

    return matchBusca && matchCategoria && matchPreco && matchCondicao && matchCidade;
  });

  // Extrair cidades únicas dos produtos
  const cidades = Array.from(new Set(produtos.map(p => p.cidade).filter(Boolean))) as string[];

  return (
    <>
      {/* Seção Sobre o Used */}
      <div className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.heroTitleContainer}>
                <img src="/logoused.svg" alt="used" className={styles.heroLogo} />
                <h1 className={styles.heroTitle}>used</h1>
              </div>
              <p className={styles.heroSubtitle}>
                marketplace minimalista para itens usados e seminovos
              </p>
              <p className={styles.heroDescription}>
                compre e venda produtos de forma simples, rápida e direta.
                sem complicações. apenas você, o produto e o comprador.
              </p>
            </div>
          </div>

          {/* Cards de Benefícios */}
          <div className={styles.benefitsCards}>
            <div className={styles.benefitCard}>
              <img src="/rapido.png" alt="rápido" className={styles.benefitIcon} />
              <h3 className={styles.benefitTitle}>rápido e simples</h3>
              <p className={styles.benefitDescription}>
                anuncie em minutos. sem burocracias ou complicações.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <img src="/bolsa-de-dinheiro.png" alt="economize" className={styles.benefitIcon} />
              <h3 className={styles.benefitTitle}>economize dinheiro</h3>
              <p className={styles.benefitDescription}>
                encontre produtos por preços muito mais acessíveis.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <img src="/energia-sustentavel.png" alt="sustentável" className={styles.benefitIcon} />
              <h3 className={styles.benefitTitle}>sustentável</h3>
              <p className={styles.benefitDescription}>
                dê nova vida aos produtos e contribua para um consumo mais consciente.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <img src="/direto.png" alt="direto" className={styles.benefitIcon} />
              <h3 className={styles.benefitTitle}>direto com o vendedor</h3>
              <p className={styles.benefitDescription}>
                negocie diretamente, sem intermediários.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Como Funciona */}
      <div id="como-funciona" className={styles.comoFuncionaSection}>
        <div className="container">
          <div className={styles.comoFuncionaHeader}>
            <h2 className={styles.sectionTitle}>como funciona</h2>
            <p className={styles.sectionSubtitle}>
              vender e comprar na used é simples e rápido
            </p>
          </div>

          <div className={styles.stepsContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepIconWrapper}>
                <span className={styles.stepNumber}>1</span>
                <img src="/profile.png" alt="cadastro" className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>crie sua conta</h3>
              <p className={styles.stepDescription}>
                faça seu cadastro gratuito em segundos. é rápido e seguro.
              </p>
            </div>

            <div className={styles.connectorLine}></div>

            <div className={styles.stepItem}>
              <div className={styles.stepIconWrapper}>
                <span className={styles.stepNumber}>2</span>
                <img src="/bolsa-de-dinheiro.png" alt="anuncie" className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>anuncie grátis</h3>
              <p className={styles.stepDescription}>
                tire fotos, descreva seu produto e defina o preço. pronto!
              </p>
            </div>

            <div className={styles.connectorLine}></div>

            <div className={styles.stepItem}>
              <div className={styles.stepIconWrapper}>
                <span className={styles.stepNumber}>3</span>
                <img src="/direto.png" alt="negocie" className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>negocie direto</h3>
              <p className={styles.stepDescription}>
                converse pelo chat e combine a entrega com o comprador.
              </p>
            </div>
          </div>

          <div className={styles.ctaContainer}>
            <a href="/novo-anuncio" className={styles.sectionCTA}>
              anunciar agora
            </a>
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.sidebarLeft}>
          <AdSidebar side="left" />
        </div>

        <div className={styles.centerContent}>
          <div className={styles.header}>
            <h2 className={styles.title}>todos os anúncios</h2>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="buscar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !buscando) {
                    executarBusca();
                  }
                }}
                className={styles.searchInput}
                disabled={buscando}
              />
              <button
                className={styles.searchButton}
                onClick={executarBusca}
                disabled={buscando}
                aria-label="pesquisar"
              >
                {buscando ? 'buscando...' : 'buscar'}
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className={styles.filterContainer}>
            {/* Categorias */}
            <div className={styles.filterSection}>
              <span className={styles.filterLabel}>categorias</span>
              <div className={styles.filterOptions}>
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
            </div>

            {/* Preço */}
            <div className={styles.filterSection}>
              <span className={styles.filterLabel}>preço</span>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="mínimo"
                  value={precoMin}
                  onChange={(e) => setPrecoMin(e.target.value)}
                  className={styles.priceInput}
                />
                <span className={styles.priceSeparator}>até</span>
                <input
                  type="number"
                  placeholder="máximo"
                  value={precoMax}
                  onChange={(e) => setPrecoMax(e.target.value)}
                  className={styles.priceInput}
                />
              </div>
            </div>

            {/* Condição */}
            <div className={styles.filterSection}>
              <span className={styles.filterLabel}>condição</span>
              <div className={styles.filterOptions}>
                <button
                  onClick={() => setCondicaoSelecionada('')}
                  className={`${styles.filterButton} ${!condicaoSelecionada ? styles.filterButtonActive : ''}`}
                >
                  todas
                </button>
                <button
                  onClick={() => setCondicaoSelecionada('novo')}
                  className={`${styles.filterButton} ${condicaoSelecionada === 'novo' ? styles.filterButtonActive : ''}`}
                >
                  novo
                </button>
                <button
                  onClick={() => setCondicaoSelecionada('seminovo')}
                  className={`${styles.filterButton} ${condicaoSelecionada === 'seminovo' ? styles.filterButtonActive : ''}`}
                >
                  seminovo
                </button>
                <button
                  onClick={() => setCondicaoSelecionada('usado')}
                  className={`${styles.filterButton} ${condicaoSelecionada === 'usado' ? styles.filterButtonActive : ''}`}
                >
                  usado
                </button>
              </div>
            </div>

            {/* Cidade */}
            {cidades.length > 0 && (
              <div className={styles.filterSection}>
                <span className={styles.filterLabel}>cidade</span>
                <div className={styles.selectWrapper}>
                  <select
                    value={cidadeSelecionada}
                    onChange={(e) => setCidadeSelecionada(e.target.value)}
                    className={styles.styledSelect}
                  >
                    <option value="">todas as cidades</option>
                    {cidades.map((cidade) => (
                      <option key={cidade} value={cidade}>
                        {cidade}
                      </option>
                    ))}
                  </select>
                  <div className={styles.selectArrow}>▼</div>
                </div>
              </div>
            )}
          </div>

          {loading || buscando ? (
            <div className={styles.loading}>
              <div className="loading"></div>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <p className={styles.empty}>
              {termoBusca ? 'nenhum anúncio encontrado para sua busca' : 'nenhum anúncio encontrado'}
            </p>
          ) : (
            <div className="products-grid">
              {produtosFiltrados.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          )}
        </div>

        <div className={styles.sidebarRight}>
          <AdSidebar side="right" />
        </div>
      </div>
    </>
  );
}
