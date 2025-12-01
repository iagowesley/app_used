// Componente Header - Cabeçalho da aplicação
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se há usuário logado
    const verificarUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user?.email) {
        await verificarAdmin(user.email);
      } else {
        setIsAdmin(false);
      }
    };

    verificarUsuario();

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        await verificarAdmin(session.user.email);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Detectar scroll para adicionar transparência
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const verificarAdmin = async (email: string) => {
    if (!email) {
      setIsAdmin(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin === true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('erro ao verificar admin:', error);
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <img src="/logoused.svg" alt="used" className={styles.logoImage} />
          <span className={styles.logoText}>used</span>
        </Link>

        <nav className={styles.nav}>
          <button
            onClick={() => {
              // Se já estiver na home, só fazer scroll
              if (window.location.pathname === '/') {
                const element = document.getElementById('como-funciona');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              } else {
                // Se estiver em outra página, redirecionar e depois fazer scroll
                router.push('/#como-funciona');
              }
            }}
            className={styles.btnComoFunciona}
            aria-label="como funciona"
          >
            <span className={styles.btnText}>como funciona</span>
            <span className={styles.btnIcon}>?</span>
          </button>
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin/dashboard" className={styles.btnAdmin}>
                  dashboard
                </Link>
              )}
              <Link href="/novo-anuncio" className={styles.btnAnunciar}>
                anunciar
              </Link>
              <Link href="/perfil" className={styles.btnPerfil}>
                <img src="/profile.png" alt="perfil" className={styles.profileIcon} />
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.btnLogin}>
                entrar
              </Link>
              <Link href="/cadastro" className={styles.btnCadastro}>
                cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
