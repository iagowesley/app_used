// Página de Detalhes do Produto
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Produto } from '@/lib/supabase';
import Carousel from '@/components/Carousel';
import { extrairIdDaUrl, gerarUrlCompletaProduto, gerarMensagemCompartilhamento } from '@/lib/utils';
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
    if (user && user.email) {
      // Verificar admin via API route (seguro, não expõe emails)
      try {
        const response = await fetch('/api/admin/verificar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        });
        
        if (!response.ok) {
          // Se a rota não existir (404), apenas não definir como admin
          if (response.status === 404) {
            console.warn('rota de verificação de admin não encontrada');
            setIsAdminUser(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setIsAdminUser(data.isAdmin || false);
      } catch (error) {
        console.error('erro ao verificar admin:', error);
        setIsAdminUser(false);
      }
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

  const compartilharAnuncio = async () => {
    if (!produto) return;

    const url = gerarUrlCompletaProduto(produto.id, produto.nome);
    const mensagem = gerarMensagemCompartilhamento(produto.nome, produto.preco, url);

    try {
      // Tentar usar Web Share API se disponível (mobile principalmente)
      if (navigator.share) {
        await navigator.share({
          title: `Confira: ${produto.nome}`,
          text: mensagem,
          url: url,
        });
        return;
      }

      // Fallback: copiar para área de transferência e abrir WhatsApp
      await navigator.clipboard.writeText(`${mensagem}\n${url}`);
      
      // Confirmar com usuário e abrir WhatsApp Web
      const confirmar = window.confirm(
        'Link copiado!\n\n' +
        'Deseja abrir o WhatsApp para compartilhar com seus amigos?'
      );
      
      if (confirmar) {
        const numero = produto.whatsapp.replace(/\D/g, '');
        const mensagemWhatsApp = encodeURIComponent(mensagem);
        window.open(`https://wa.me/?text=${mensagemWhatsApp}`, '_blank');
      } else {
        alert('✅ Link copiado! Agora você pode colar e compartilhar onde quiser!');
      }
    } catch (error: any) {
      // Se o usuário cancelar o compartilhamento, não fazer nada
      if (error.name === 'AbortError') {
        return;
      }
      
      // Caso contrário, tentar copiar para área de transferência
      try {
        await navigator.clipboard.writeText(`${mensagem}\n${url}`);
        alert('✅ Link copiado! Agora você pode colar e compartilhar onde quiser!');
      } catch (clipboardError) {
        // Fallback final: mostrar mensagem manual
        prompt('Copie o link abaixo para compartilhar:', `${mensagem}\n${url}`);
      }
    }
  };

  const abrirModalDeletar = () => {
    setMostrarModalDeletar(true);
  };

  const deletarAnuncio = async () => {
    if (!produto || !user) return;
    
    setDeletando(true);
    
    try {
      // Verificar se é proprietário ou admin
      const isProprietario = user.id === produto.user_id;
      
      if (!isProprietario && !isAdminUser) {
        alert('você não tem permissão para deletar este anúncio');
        setDeletando(false);
        return;
      }
      
      // Deletar imagens do storage
      for (const imagemUrl of produto.imagens) {
        const path = imagemUrl.split('/').pop();
        if (path) {
          await supabase.storage.from('imagens').remove([`produtos/${path}`]);
        }
      }
      
      // Deletar produto do banco via API route (usa supabaseAdmin que bypassa RLS)
      // Obter token JWT para autenticação
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('não autenticado. faça login novamente.');
      }
      
      const response = await fetch(`/api/anuncios/${produto.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'erro ao deletar anúncio');
      }
      
      setMostrarModalDeletar(false);
      router.push('/');
    } catch (error: any) {
      console.error('erro ao deletar anúncio:', error);
      alert(error.message || 'erro ao deletar anúncio. tente novamente.');
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

          {/* Nome do Vendedor */}
          {produto.nome_vendedor && (
            <div className={styles.vendedorSection}>
              <span className={styles.vendedorLabel}>vendedor:</span>
              <span className={styles.vendedorNome}>{produto.nome_vendedor}</span>
            </div>
          )}

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

            {/* Informação de Entrega */}
            {produto.faz_entrega && (
              <span className={styles.tagEntrega}>
                vendedor faz entrega
              </span>
            )}
          </div>

          {/* Informações de Localização */}
          {(produto.cidade || produto.bairro) && (
            <div className={styles.localizacaoSection}>
              <span className={styles.localizacaoLabel}>localização:</span>
              <span className={styles.localizacaoInfo}>
                {produto.bairro && produto.cidade 
                  ? `${produto.bairro}, ${produto.cidade}`
                  : produto.cidade || produto.bairro}
              </span>
            </div>
          )}

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

          <div className={styles.descricaoContainer}>
            <h2 className={styles.subtitle}>descrição</h2>
            <p className={styles.descricao}>{produto.descricao}</p>
          </div>

          {/* Container dos Botões */}
          <div className={styles.buttonsContainer}>
            {/* Botão de Comprar via WhatsApp */}
            {produto.vendido && !isProprietario ? (
              <button 
                disabled
                className={`${styles.whatsappButton} ${styles.whatsappButtonDisabled}`}
              >
                <img src="/cadeado-trancado.png" alt="vendido" className={styles.lockIcon} />
                produto vendido
              </button>
            ) : (
              <button 
                onClick={abrirWhatsApp}
                className={styles.whatsappButton}
              >
                comprar via whatsapp
              </button>
            )}
            
            {/* Botão de Compartilhar */}
            <button 
              onClick={compartilharAnuncio}
              className={styles.shareButton}
            >
              compartilhar anúncio
            </button>
          </div>
          
          <p className={styles.info}>
            {produto.vendido && !isProprietario 
              ? 'este produto já foi vendido'
              : 'ao clicar em comprar, você será direcionado para conversar com o vendedor'
            }
          </p>
        
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

