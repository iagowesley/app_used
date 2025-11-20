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
  const router = useRouter();

  useEffect(() => {
    // Verificar se há usuário logado
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user?.email) {
        verificarAdmin(user.email);
      }
    });

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        verificarAdmin(session.user.email);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const verificarAdmin = async (email: string) => {
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
        setIsAdmin(data.isAdmin || false);
      }
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <img src="/logoused.svg" alt="used" className={styles.logoImage} />
          <span className={styles.logoText}>used</span>
        </Link>
        
        <nav className={styles.nav}>
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
