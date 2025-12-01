// Componente Footer - Rodapé da aplicação
'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <Link href="/" className={styles.logo}>
              <img src="/logoused.svg" alt="used" className={styles.logoImage} />
              <span className={styles.logoText}>used</span>
            </Link>
            <p className={styles.tagline}>
              marketplace minimalista para itens usados e seminovos
            </p>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>links</h3>
            <nav className={styles.footerNav}>
              <Link href="/" className={styles.footerLink}>início</Link>
              <Link href="/novo-anuncio" className={styles.footerLink}>anunciar</Link>
              <Link href="/login" className={styles.footerLink}>entrar</Link>
              <Link href="/cadastro" className={styles.footerLink}>cadastrar</Link>
            </nav>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>sobre</h3>
            <nav className={styles.footerNav}>
              <Link href="/sobre" className={styles.footerLink}>quem somos</Link>
            </nav>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>legal</h3>
            <nav className={styles.footerNav}>
              <Link href="/politica-privacidade" className={styles.footerLink}>política de privacidade</Link>
              <Link href="/termos-uso" className={styles.footerLink}>termos de uso</Link>
            </nav>
          </div>
        </div>

      </div>
      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} used. todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

