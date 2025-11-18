// Página de Detalhes do Produto
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Produto } from '@/lib/supabase';
import Carousel from '@/components/Carousel';
import { extrairIdDaUrl } from '@/lib/utils';
import { verificarAdmin } from '@/lib/admin';
import ConfirmModal from '@/components/ConfirmModal';
import { getCategoriaLabel, getCondicaoLabel, getCondicaoEmoji, getFormaPagamentoLabel, getFormaPagamentoEmoji } from '@/lib/categorias';
import styles from './produto.module.css';

export default function ProdutoDetalhes() {
  const params = useParams();
  const router = useRouter();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [mostrarModalDeletar, setMostrarModalDeletar] = useState(false);
  const [marcandoVendido, setMarcandoVendido] = useState(false);

  useEffect(() => {
    carregarProduto();
    verificarUsuario();
  }, [params.id]);

  const verificarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const admin = await verificarAdmin(user);
      setIsAdminUser(admin);
    }
  };

  const carregarProduto = async () => {
    try {
      const id = extrairIdDaUrl(params as { id: string });
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
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

  const abrirModalDeletar = () => {
    setMostrarModalDeletar(true);
  };

  const deletarAnuncio = async () => {
    if (!produto || !user) return;
    
    setDeletando(true);
    
    try {
      // Deletar imagens do storage
      for (const imagemUrl of produto.imagens) {
        const path = imagemUrl.split('/').pop();
        if (path) {
          await supabase.storage.from('imagens').remove([`produtos/${path}`]);
        }
      }
      
      // Deletar produto do banco
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', produto.id);
      
      if (error) throw error;
      
      setMostrarModalDeletar(false);
      router.push('/');
    } catch (error) {
      console.error('erro ao deletar anúncio:', error);
      setDeletando(false);
    }
  };

  const marcarComoVendido = async () => {
    if (!produto || !user || !isProprietario) return;
    
    setMarcandoVendido(true);
    
    try {
      const agora = new Date().toISOString();
      const novoStatus = !produto.vendido;
      
      const { error } = await supabase
        .from('produtos')
        .update({
          vendido: novoStatus,
          data_vendido: novoStatus ? agora : null
        })
        .eq('id', produto.id);
      
      if (error) throw error;
      
      // Atualizar estado local
      setProduto({
        ...produto,
        vendido: novoStatus,
        data_vendido: novoStatus ? agora : undefined
      });
    } catch (error) {
      console.error('erro ao marcar como vendido:', error);
      alert('erro ao atualizar status do produto');
    } finally {
      setMarcandoVendido(false);
    }
  };

  const isProprietario = user && produto && user.id === produto.user_id;
  const podeDelatar = isProprietario || isAdminUser;

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
        <button onClick={() => router.push('/')} className={styles.backButton}>
          voltar
        </button>
        
        <div className={styles.actionButtons}>
          {isProprietario && (
            <button 
              onClick={marcarComoVendido}
              className={`${styles.vendidoButton} ${produto.vendido ? styles.vendidoButtonActive : ''}`}
              disabled={marcandoVendido}
            >
              {marcandoVendido ? 'atualizando...' : produto.vendido ? 'marcar como disponível' : 'marcar como vendido'}
            </button>
          )}
          
          {podeDelatar && (
            <button 
              onClick={abrirModalDeletar} 
              className={styles.deleteButton}
            >
              {isAdminUser && !isProprietario && <span className={styles.adminBadge}>ADMIN</span>}
              deletar anúncio
            </button>
          )}
        </div>
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

          {/* Tags de Informações */}
          <div className={styles.tagsContainer}>
            {/* Categoria */}
            {produto.categoria && (
              <span className={styles.tagCategoria}>
                {getCategoriaLabel(produto.categoria)}
              </span>
            )}

            {/* Condição */}
            {produto.condicao && (
              <span className={styles.tagCondicao}>
                {getCondicaoEmoji(produto.condicao)} {getCondicaoLabel(produto.condicao)}
              </span>
            )}
          </div>

          {/* Formas de Pagamento */}
          {produto.formas_pagamento && produto.formas_pagamento.length > 0 && (
            <div className={styles.pagamentoSection}>
              <h3 className={styles.pagamentoTitle}>formas de pagamento aceitas:</h3>
              <div className={styles.pagamentoTags}>
                {produto.formas_pagamento.map((forma) => (
                  <span key={forma} className={styles.tagPagamento}>
                    {getFormaPagamentoEmoji(forma)} {getFormaPagamentoLabel(forma)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Informação de Entrega */}
          {produto.faz_entrega && (
            <div className={styles.entregaSection}>
              <span className={styles.tagEntrega}>
                 vendedor faz entrega
              </span>
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

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={mostrarModalDeletar}
        title="deletar anúncio"
        message="tem certeza que deseja deletar este anúncio? esta ação não pode ser desfeita."
        confirmText="deletar"
        cancelText="cancelar"
        onConfirm={deletarAnuncio}
        onCancel={() => setMostrarModalDeletar(false)}
        loading={deletando}
      />
    </div>
  );
}

