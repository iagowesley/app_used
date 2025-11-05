// Componente Carousel - Slider de imagens
'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Carousel.module.css';

interface CarouselProps {
  imagens: string[];
  alt: string;
  height?: number;
}

export default function Carousel({ imagens, alt, height = 300 }: CarouselProps) {
  const [indiceAtual, setIndiceAtual] = useState(0);

  const proximaImagem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndiceAtual((prev) => (prev + 1) % imagens.length);
  };

  const imagemAnterior = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndiceAtual((prev) => (prev - 1 + imagens.length) % imagens.length);
  };

  const irParaImagem = (indice: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIndiceAtual(indice);
  };

  if (!imagens || imagens.length === 0) {
    return (
      <div className={styles.carouselContainer} style={{ height: `${height}px` }}>
        <div className={styles.noImage}>sem imagem</div>
      </div>
    );
  }

  return (
    <div className={styles.carouselContainer} style={{ height: `${height}px` }}>
      <div className={styles.imageWrapper}>
        <Image
          src={imagens[indiceAtual]}
          alt={`${alt} - imagem ${indiceAtual + 1}`}
          fill
          style={{ objectFit: 'contain' }}
          priority={indiceAtual === 0}
        />
      </div>

      {imagens.length > 1 && (
        <>
          {/* Botões de navegação */}
          <button
            onClick={imagemAnterior}
            className={`${styles.navButton} ${styles.navButtonLeft}`}
            aria-label="imagem anterior"
          >
            ‹
          </button>
          <button
            onClick={proximaImagem}
            className={`${styles.navButton} ${styles.navButtonRight}`}
            aria-label="próxima imagem"
          >
            ›
          </button>

          {/* Indicadores */}
          <div className={styles.indicators}>
            {imagens.map((_, indice) => (
              <button
                key={indice}
                onClick={(e) => irParaImagem(indice, e)}
                className={`${styles.indicator} ${
                  indice === indiceAtual ? styles.indicatorActive : ''
                }`}
                aria-label={`ir para imagem ${indice + 1}`}
              />
            ))}
          </div>

          {/* Contador */}
          <div className={styles.counter}>
            {indiceAtual + 1} / {imagens.length}
          </div>
        </>
      )}
    </div>
  );
}

