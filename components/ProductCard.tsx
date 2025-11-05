// Componente ProductCard - Card para exibir produto
'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard.module.css';
import { Produto } from '@/lib/supabase';
import { gerarUrlProduto } from '@/lib/utils';
import { getCategoriaLabel, getCondicaoLabel, getFormaPagamentoLabel } from '@/lib/categorias';

interface ProductCardProps {
  produto: Produto;
}

export default function ProductCard({ produto }: ProductCardProps) {
  return (
    <Link href={gerarUrlProduto(produto.id, produto.nome)} className={styles.card}>
      <div className={styles.imageContainer}>
        {produto.imagens && produto.imagens.length > 0 ? (
          <Image
            src={produto.imagens[0]}
            alt={produto.nome}
            fill
            style={{ objectFit: 'contain', objectPosition: 'center' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className={styles.noImage}>sem imagem</div>
        )}
        {produto.categoria && (
          <div className={styles.categoriaBadge}>
            {getCategoriaLabel(produto.categoria)}
          </div>
        )}
        {produto.imagens && produto.imagens.length > 1 && (
          <div className={styles.imageCount}>
            {produto.imagens.length} fotos
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.nome}>{produto.nome}</h3>
        <p className={styles.preco}>R$ {produto.preco.toFixed(2)}</p>
        
        {/* Tags de Condição e Pagamento */}
        <div className={styles.tags}>
          {produto.condicao && (
            <span className={styles.tagCondicao}>
              {getCondicaoLabel(produto.condicao)}
            </span>
          )}
          {produto.formas_pagamento && produto.formas_pagamento.length > 0 && (
            <span className={styles.tagPagamento}>
              {produto.formas_pagamento.length === 1 
                ? getFormaPagamentoLabel(produto.formas_pagamento[0])
                : `${produto.formas_pagamento.length} formas de pagamento`
              }
            </span>
          )}
        </div>
        
        <p className={styles.descricao}>{produto.descricao}</p>
      </div>
    </Link>
  );
}
