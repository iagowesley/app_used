// Página de Login
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [erro, setErro] = useState('');
  const [mostrarRecuperacao, setMostrarRecuperacao] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [mostrarRedefinir, setMostrarRedefinir] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [redefinindo, setRedefinindo] = useState(false);
  const [senhaRedefinida, setSenhaRedefinida] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar se há parâmetro de reset na URL
    const reset = searchParams.get('reset');
    if (reset === 'true') {
      setMostrarRedefinir(true);
      setCheckingAuth(false);
      return;
    }

    // Verificar se o usuário já está logado
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/');
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router, searchParams]);

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

  const handleLoginGoogle = async () => {
    setErro('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setErro(error.message || 'erro ao fazer login com google');
      setLoading(false);
    }
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setEnviandoEmail(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });

      if (error) throw error;

      setEmailEnviado(true);
    } catch (error: any) {
      setErro(error.message || 'erro ao enviar email de recuperação');
    } finally {
      setEnviandoEmail(false);
    }
  };

  const voltarParaLogin = () => {
    setMostrarRecuperacao(false);
    setEmailEnviado(false);
    setEmail('');
    setErro('');
    router.push('/login');
  };

  const validarSenha = (senha: string): { valida: boolean; erro: string } => {
    if (senha.length < 8) {
      return { valida: false, erro: 'a senha deve ter pelo menos 8 caracteres' };
    }

    if (!/[A-Z]/.test(senha)) {
      return { valida: false, erro: 'a senha deve conter pelo menos 1 letra maiúscula' };
    }

    if (!/[a-z]/.test(senha)) {
      return { valida: false, erro: 'a senha deve conter pelo menos 1 letra minúscula' };
    }

    if (!/[0-9]/.test(senha)) {
      return { valida: false, erro: 'a senha deve conter pelo menos 1 número' };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
      return { valida: false, erro: 'a senha deve conter pelo menos 1 caractere especial' };
    }

    return { valida: true, erro: '' };
  };

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const validacao = validarSenha(novaSenha);
    if (!validacao.valida) {
      setErro(validacao.erro);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('as senhas não coincidem');
      return;
    }

    setRedefinindo(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) throw error;

      setSenhaRedefinida(true);
    } catch (error: any) {
      setErro(error.message || 'erro ao redefinir senha');
    } finally {
      setRedefinindo(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.loadingContainer}>
        <div className="loading"></div>
      </div>
    );
  }

  const irParaLogin = async () => {
    // Fazer logout para garantir que o usuário não fique logado automaticamente
    await supabase.auth.signOut();
    // Limpar os parâmetros da URL e redirecionar
    router.push('/login');
  };

  // Se senha foi redefinida com sucesso
  if (mostrarRedefinir && senhaRedefinida) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>senha redefinida!</h1>
          <p className={styles.subtitle}>
            sua senha foi alterada com sucesso
          </p>
          <p className={styles.instructionText}>
            agora você pode fazer login com sua nova senha
          </p>
          <button 
            onClick={irParaLogin}
            className="primary"
            style={{ width: '100%', marginTop: '24px' }}
          >
            fazer login
          </button>
        </div>
      </div>
    );
  }

  // Se mostrar tela de redefinir senha
  if (mostrarRedefinir) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>redefinir senha</h1>
          <p className={styles.subtitle}>
            digite sua nova senha
          </p>

          <form onSubmit={handleRedefinirSenha} className={styles.form}>
            <div className="form-group">
              <label htmlFor="nova-senha">nova senha</label>
              <input
                id="nova-senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="digite sua nova senha"
                required
                disabled={redefinindo}
                minLength={8}
              />
              <div className={styles.senhaRequisitos}>
                <p className={styles.requisitosTitle}>requisitos da senha:</p>
                <ul className={styles.requisitosList}>
                  <li className={novaSenha.length >= 8 ? styles.requisitoOk : ''}>
                    mínimo 8 caracteres
                  </li>
                  <li className={/[A-Z]/.test(novaSenha) ? styles.requisitoOk : ''}>
                    1 maiúscula
                  </li>
                  <li className={/[a-z]/.test(novaSenha) ? styles.requisitoOk : ''}>
                    1 minúscula
                  </li>
                  <li className={/[0-9]/.test(novaSenha) ? styles.requisitoOk : ''}>
                    1 número
                  </li>
                  <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(novaSenha) ? styles.requisitoOk : ''}>
                    1 caractere especial
                  </li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmar-senha">confirmar senha</label>
              <input
                id="confirmar-senha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="digite a senha novamente"
                required
                disabled={redefinindo}
                minLength={8}
              />
            </div>

            {erro && <div className="error-message">{erro}</div>}

            <button 
              type="submit" 
              className="primary" 
              disabled={redefinindo}
              style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {redefinindo && <div className="loading-small"></div>}
              {redefinindo ? 'redefinindo...' : 'redefinir senha'}
            </button>
          </form>

          <button 
            onClick={() => router.push('/login')}
            className={styles.linkButton}
          >
            ← voltar para login
          </button>
        </div>
      </div>
    );
  }

  // Se mostrar recuperação e email foi enviado
  if (mostrarRecuperacao && emailEnviado) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>email enviado!</h1>
          <p className={styles.subtitle}>
            enviamos um link de recuperação para <strong>{email}</strong>
          </p>
          <p className={styles.instructionText}>
            verifique sua caixa de entrada e clique no link para redefinir sua senha.
            se não encontrar, verifique também a pasta de spam.
          </p>
          <button 
            onClick={voltarParaLogin}
            className="primary"
            style={{ width: '100%', marginTop: '24px' }}
          >
            voltar para login
          </button>
        </div>
      </div>
    );
  }

  // Se mostrar recuperação
  if (mostrarRecuperacao) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>recuperar senha</h1>
          <p className={styles.subtitle}>
            digite seu email e enviaremos um link para redefinir sua senha
          </p>

          <form onSubmit={handleRecuperarSenha} className={styles.form}>
            <div className="form-group">
              <label htmlFor="email-recuperacao">email</label>
              <input
                id="email-recuperacao"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={enviandoEmail}
              />
            </div>

            {erro && <div className="error-message">{erro}</div>}

            <button 
              type="submit" 
              className="primary" 
              disabled={enviandoEmail}
              style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {enviandoEmail && <div className="loading-small"></div>}
              {enviandoEmail ? 'enviando...' : 'enviar link de recuperação'}
            </button>
          </form>

          <button 
            onClick={voltarParaLogin}
            className={styles.linkButton}
          >
            ← voltar para login
          </button>
        </div>
      </div>
    );
  }

  // Tela de login normal
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

          <button 
            type="button"
            onClick={() => setMostrarRecuperacao(true)}
            className={styles.esqueciSenhaLink}
          >
            esqueci minha senha
          </button>

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

        <div className={styles.divider}>
          <span>ou</span>
        </div>

        <button 
          onClick={handleLoginGoogle}
          className={styles.googleButton}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H15.9564C17.4382 14.2527 18.22 12.0455 18.22 9.20454H17.64Z" fill="#4285F4"/>
            <path d="M9 18C11.43 18 13.467 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65454 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65454 3.57955 9 3.57955Z" fill="#EA4335"/>
          </svg>
          continuar com google
        </button>

        <p className={styles.cadastroLink}>
          não tem conta? <Link href="/cadastro">cadastre-se aqui</Link>
        </p>
      </div>
    </div>
  );
}

