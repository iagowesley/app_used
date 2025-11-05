// Página de Login
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [erro, setErro] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário já está logado
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/');
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      if (data.user) {
        router.push('/');
      }
    } catch (error: any) {
      setErro(error.message || 'erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.loadingContainer}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>entrar</h1>
        <p className={styles.subtitle}>acesse sua conta no used</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label htmlFor="email">email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="sua senha"
              required
              disabled={loading}
            />
          </div>

          {erro && <div className="error-message">{erro}</div>}

          <button 
            type="submit" 
            className="primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading && <div className="loading-small"></div>}
            {loading ? 'entrando...' : 'entrar'}
          </button>
        </form>

        <p className={styles.cadastroLink}>
          não tem conta? <Link href="/cadastro">cadastre-se aqui</Link>
        </p>
      </div>
    </div>
  );
}

