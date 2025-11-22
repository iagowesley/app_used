// Página de Detalhes do Produto
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Produto } from '@/lib/supabase';
import { verificarProprietario } from '@/lib/security';
import Carousel from '@/components/Carousel';
import styles from './produto.module.css';

export default function ProdutoDetalhes() {
  const params = useParams();
  const router = useRouter();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    carregarProduto();
    verificarUsuario();
  }, [params.id]);

  const verificarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const carregarProduto = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setProduto(data);
    } catch (error) {
      console.error('erro ao carregar produto:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const abrirWhatsApp = () => {
    if (!produto) return;

    // Remover formatação do WhatsApp
    const numero = produto.whatsapp.replace(/\D/g, '');
    const mensagem = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${produto.nome} (R$ ${produto.preco.toFixed(2)})`
    );

    // Abrir WhatsApp
    window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank');
  };

  const deletarAnuncio = async () => {
    if (!produto || !user) {
      alert('você precisa estar logado para deletar este anúncio');
      return;
    }

    // VERIFICAÇÃO DE SEGURANÇA: Apenas o proprietário pode deletar
    if (!verificarProprietario(user.id, produto.user_id)) {
      alert('você não tem permissão para deletar este anúncio');
      return;
    }

    const confirmacao = window.confirm('tem certeza que deseja deletar este anúncio? esta ação não pode ser desfeita.');
    if (!confirmacao) return;

    setDeletando(true);

    try {
      // Verificar novamente antes de deletar (double-check)
      const { data: produtoAtual, error: fetchError } = await supabase
        .from('produtos')
        .select('user_id')
        .eq('id', produto.id)
        .single();

      if (fetchError) throw fetchError;

      if (produtoAtual.user_id !== user.id) {
        throw new Error('você não tem permissão para deletar este anúncio');
      }

      // Deletar produto do banco (RLS vai garantir que só o dono pode deletar)
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', produto.id)
        .eq('user_id', user.id); // Extra segurança

      if (error) throw error;

      // Deletar imagens do storage APÓS deletar o produto
      for (const imagemUrl of produto.imagens) {
        try {
          const path = imagemUrl.split('/').pop();
          if (path) {
            await supabase.storage.from('imagens').remove([`produtos/${path}`]);
          }
        } catch (storageError) {
          console.error('erro ao deletar imagem:', storageError);
          // Continua mesmo se falhar ao deletar imagem
        }
      }

      alert('anúncio deletado com sucesso!');
      router.push('/perfil');
    } catch (error: any) {
      console.error('erro ao deletar anúncio:', error);
      alert(error.message || 'erro ao deletar anúncio. tente novamente.');
    } finally {
      setDeletando(false);
    }
  };

  const isProprietario = user && produto && user.id === produto.user_id;

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loadingContainer}>
          <div className="loading"></div>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="container">
        <p className={styles.notFound}>produto não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.headerActions}>
        <button onClick={() => router.back()} className={styles.backButton}>
          voltar
        </button>

        {isProprietario && (
          <button
            onClick={deletarAnuncio}
            className={styles.deleteButton}
            disabled={deletando}
          >
            {deletando ? 'deletando...' : '× deletar anúncio'}
          </button>
        )}
      </div>

      <div className={styles.produtoContainer}>
        {/* Carousel de Imagens */}
        <div className={styles.carouselSection}>
          <Carousel imagens={produto.imagens} alt={produto.nome} height={500} />
        </div>

        {/* Informações do Produto */}
        <div className={styles.infoSection}>
          <h1 className={styles.nome}>{produto.nome}</h1>
          <p className={styles.preco}>R$ {produto.preco.toFixed(2)}</p>

          {/* Nome do Vendedor */}
          {produto.nome_vendedor && (
            <div className={styles.vendedorSection}>
              <span className={styles.vendedorLabel}>vendedor:</span>
              <span className={styles.vendedorNome}>{produto.nome_vendedor}</span>
            </div>
          )}

          <div className={styles.descricaoContainer}>
            <h2 className={styles.subtitle}>descrição</h2>
            <p className={styles.descricao}>{produto.descricao}</p>
          </div>

          {/* Botão de Comprar via WhatsApp */}
          {produto.vendido && !isProprietario ? (
            <>
              <button
                disabled
                className={`${styles.whatsappButton} ${styles.whatsappButtonDisabled}`}
              >
                <img src="/cadeado-trancado.png" alt="vendido" className={styles.lockIcon} />
                produto vendido
              </button>
              <p className={styles.info}>
                este produto já foi vendido
              </p>
            </>
          ) : (
            <>
              <button
                onClick={abrirWhatsApp}
                className={styles.whatsappButton}
              >
                comprar via whatsapp
              </button>
              <p className={styles.info}>
                ao clicar, você será direcionado para conversar com o vendedor
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

