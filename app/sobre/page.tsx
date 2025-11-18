// Página Quem Somos
'use client';

import styles from './sobre.module.css';

export default function Sobre() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>quem somos</h1>
        
        <div className={styles.intro}>
          <p className={styles.introText}>
            nós somos a <strong>used</strong>, plataforma para compra e venda de itens usados e seminovos.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>nossa missão</h2>
          <p className={styles.sectionText}>
            facilitar a conexão entre pessoas que querem vender e comprar produtos de qualidade, 
            promovendo um consumo mais consciente e sustentável. acreditamos que cada produto 
            pode ter uma segunda vida e que a economia circular é o futuro.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>o que fazemos</h2>
          <p className={styles.sectionText}>
            oferecemos uma plataforma simples, rápida e direta para você anunciar seus produtos 
            ou encontrar aquilo que precisa. sem complicações, sem taxas escondidas, apenas você, 
            o produto e o comprador.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>por que utilizar a used</h2>
          <ul className={styles.benefitsList}>
            <li>processo simples e rápido de anúncio</li>
            <li>comunicação direta entre comprador e vendedor</li>
            <li>foco em sustentabilidade e economia circular</li>
            <li>plataforma minimalista e fácil de usar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

