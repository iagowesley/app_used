// Página de Cadastro
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { validarSenhaForte, validarEmail } from '@/lib/security';
import styles from './cadastro.module.css';

export default function Cadastro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mostrarErro, setMostrarErro] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    // Validar email
    if (!validarEmail(email)) {
      setErro('por favor, insira um email válido');
      setLoading(false);
      return;
    }

    // Validar senhas
    if (senha !== confirmarSenha) {
      setErro('as senhas não coincidem');
      setLoading(false);
      return;
    }

    // Validar força da senha
    const validacaoSenha = validarSenhaForte(senha);
    if (!validacaoSenha.valida) {
      setErro(validacaoSenha.mensagem);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (error) {
        // Verificar se é email duplicado
        if (error.message.includes('already') || error.message.includes('exists')) {
          setMensagemErro('este email já está cadastrado. faça login ou use outro email.');
          setMostrarErro(true);
          return;
        }
        throw error;
      }

      // Verificar se o usuário já existe
      if (data.user && !data.session) {
        setMensagemErro('este email já está cadastrado. faça login ou use outro email.');
        setMostrarErro(true);
        return;
      }

      if (data.user) {
        setMostrarPopup(true);
      }
    } catch (error: any) {
      setMensagemErro(error.message || 'erro ao criar conta');
      setMostrarErro(true);
    } finally {
      setLoading(false);
    }
  };

  const fecharPopup = () => {
    setMostrarPopup(false);
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>cadastrar</h1>
        <p className={styles.subtitle}>crie sua conta no used</p>

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
              placeholder="mínimo 8 caracteres"
              required
              disabled={loading}
            />
            <small style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginTop: '4px' }}>
              • mínimo 8 caracteres<br />
              • 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">confirmar senha</label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="repita sua senha"
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
            {loading ? 'criando conta...' : 'cadastrar'}
          </button>
        </form>

        <p className={styles.loginLink}>
          já tem conta? <Link href="/login">entre aqui</Link>
        </p>
      </div>

      {/* Popup de Erro */}
      {mostrarErro && (
        <div className={styles.popupOverlay} onClick={() => setMostrarErro(false)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setMostrarErro(false)}>×</button>
            <h2 className={styles.popupTitle}>erro ao cadastrar</h2>
            <p className={styles.popupText}>{mensagemErro}</p>
            <button 
              onClick={() => setMostrarErro(false)}
              className="primary"
              style={{ width: '100%', marginTop: '16px' }}
            >
              entendi
            </button>
          </div>
        </div>
      )}

      {/* Popup de Confirmação de Email */}
      {mostrarPopup && (
        <div className={styles.popupOverlay} onClick={fecharPopup}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={fecharPopup}>×</button>
            <div className={styles.popupIcon}>✉️</div>
            <h2 className={styles.popupTitle}>confirme seu email</h2>
            <p className={styles.popupText}>
              enviamos um link de confirmação para <strong>{email}</strong>
            </p>
            <p className={styles.popupText}>
              verifique sua caixa de entrada e clique no link para ativar sua conta.
            </p>
            <button 
              onClick={fecharPopup}
              className="primary"
              style={{ width: '100%', marginTop: '16px' }}
            >
              entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

