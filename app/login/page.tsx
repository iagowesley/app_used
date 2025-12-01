// Página de Login
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getSiteUrl } from '@/lib/utils';
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
  const [emailConfirmado, setEmailConfirmado] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      setCheckingAuth(false);
      return;
    }

    const inicializarPaginaLogin = async () => {
      // Verificar se há hash fragments de recuperação de senha
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      const reset = urlParams.get('reset');
      const confirmed = urlParams.get('confirmed');
      const error = urlParams.get('error');

      // Verificar se é confirmação de email
      if (confirmed === 'true') {
        setEmailConfirmado(true);
        // Limpar URL
        window.history.replaceState({}, '', '/login');
        setCheckingAuth(false);
        return;
      }

      // Verificar se houve erro no callback
      if (error === 'invalid_link') {
        setErro('link inválido ou expirado. solicite um novo link.');
        window.history.replaceState({}, '', '/login');
        setCheckingAuth(false);
        return;
      }

      // Verificar se há token de recuperação no hash (Supabase usa #access_token=...&type=recovery)
      const hasResetToken = hash.length > 0 && hash.includes('access_token') && hash.includes('type=recovery');

      if (hasResetToken) {
        // PASSO 1: Extrair o access_token do hash IMEDIATAMENTE antes do Supabase processar
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const tokenType = hashParams.get('type');

        // Validar que é um token de recuperação
        if (accessToken && tokenType === 'recovery') {
          // PASSO 2: Armazenar tokens no sessionStorage (backup) e marcar modo recuperação
          sessionStorage.setItem('recovery_access_token', accessToken);
          sessionStorage.setItem('recovery_mode', 'true');
          if (refreshToken) {
            sessionStorage.setItem('recovery_refresh_token', refreshToken);
          }

          // PASSO 3: NÃO fazer signOut aqui! Precisamos da sessão ativa para updateUser
          // O Supabase vai processar o hash automaticamente e logar o usuário
          // Vamos apenas garantir que a UI mostre a tela de redefinição e não redirecione

          // PASSO 4: Limpar URL e mostrar tela de redefinição
          window.history.replaceState({}, '', '/login?reset=true');
          setMostrarRedefinir(true);
          setCheckingAuth(false);
          return;
        } else {
          // Token inválido ou tipo errado
          setErro('link de redefinição inválido. solicite um novo link.');
          window.history.replaceState({}, '', '/login');
          setCheckingAuth(false);
          return;
        }
      } else if (reset === 'true') {
        // Verificar se há token armazenado no sessionStorage
        const storedToken = sessionStorage.getItem('recovery_access_token');

        if (storedToken) {
          // Token existe, mostrar tela de redefinição
          setMostrarRedefinir(true);
          setCheckingAuth(false);
          return;
        } else {
          // Parâmetro reset=true mas sem token - link inválido ou expirado
          setErro('sessão de redefinição expirada. solicite um novo link.');
          window.history.replaceState({}, '', '/login');
          setCheckingAuth(false);
          return;
        }
      }

      // Se NÃO for redefinição de senha, fazer logout se houver sessão ativa
      // Isso garante que a página de login sempre inicia sem sessão ativa
      const isRecoveryMode = sessionStorage.getItem('recovery_mode') === 'true';

      if (!isRecoveryMode) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Se usuário já está logado e NÃO é recuperação, redirecionar para home ou fazer logout
          // Como estamos na página de login, o ideal é redirecionar para home
          router.push('/');
        }
      }

      setCheckingAuth(false);
    };

    inicializarPaginaLogin();
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



  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setEnviandoEmail(true);

    try {
      const baseUrl = getSiteUrl();

      // Validar que temos uma URL válida
      if (!baseUrl || baseUrl.trim() === '') {
        throw new Error('URL do site não configurada. Configure NEXT_PUBLIC_SITE_URL no Netlify.');
      }

      // Construir URL de redirecionamento (garantir que não tenha barras duplas)
      const redirectTo = `${baseUrl}/login?reset=true`.replace(/\/+/g, '/');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
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

    // Limpar tokens e modo de recuperação
    sessionStorage.removeItem('recovery_access_token');
    sessionStorage.removeItem('recovery_refresh_token');
    sessionStorage.removeItem('recovery_mode');

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
      // Verificar se está em modo de recuperação
      const isRecoveryMode = sessionStorage.getItem('recovery_mode') === 'true';

      if (!isRecoveryMode) {
        // Se não estiver em modo recuperação, verificar se tem sessão ativa
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setErro('sessão de redefinição expirada. solicite um novo link.');
          setRedefinindo(false);
          return;
        }
      }

      // O Supabase já criou uma sessão de recuperação automaticamente ao processar o hash fragment
      // Podemos usar updateUser diretamente
      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (updateError) throw updateError;

      // Fazer logout imediatamente após atualizar senha
      await supabase.auth.signOut();

      // Limpar tokens e modo de recuperação
      sessionStorage.removeItem('recovery_access_token');
      sessionStorage.removeItem('recovery_refresh_token');
      sessionStorage.removeItem('recovery_mode');

      // Mostrar mensagem de sucesso
      setSenhaRedefinida(true);
    } catch (error: any) {
      setErro(error.message || 'erro ao redefinir senha');
      // Não limpar tokens em caso de erro para permitir nova tentativa
    } finally {
      setRedefinindo(false);
    }
  };

  const irParaLogin = async () => {
    // Garantir que o usuário está deslogado
    await supabase.auth.signOut();

    // Limpar tokens e modo de recuperação
    sessionStorage.removeItem('recovery_access_token');
    sessionStorage.removeItem('recovery_refresh_token');
    sessionStorage.removeItem('recovery_mode');

    // Limpar estados e redirecionar
    setMostrarRedefinir(false);
    setSenhaRedefinida(false);
    setNovaSenha('');
    setConfirmarSenha('');
    setErro('');
    router.push('/login');
  };

  if (checkingAuth) {
    return (
      <div className={styles.loadingContainer}>
        <div className="loading"></div>
      </div>
    );
  }

  // Se senha foi redefinida com sucesso
  if (mostrarRedefinir && senhaRedefinida) {
    return (
      <div className={styles.container}>
        <div className={styles.standaloneFormCard}>
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
        <div className={styles.standaloneFormCard}>
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
                onChange={(e) => {
                  setNovaSenha(e.target.value);
                  e.target.setCustomValidity('');
                }}
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.valueMissing) {
                    target.setCustomValidity('preencha a nova senha');
                  } else if (target.validity.tooShort) {
                    target.setCustomValidity('a senha deve ter no mínimo 8 caracteres');
                  }
                }}
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
                onChange={(e) => {
                  setConfirmarSenha(e.target.value);
                  e.target.setCustomValidity('');
                }}
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.valueMissing) {
                    target.setCustomValidity('preencha a confirmação de senha');
                  } else if (target.validity.tooShort) {
                    target.setCustomValidity('a senha deve ter no mínimo 8 caracteres');
                  }
                }}
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
            voltar para login
          </button>
        </div>
      </div>
    );
  }

  // Se mostrar recuperação e email foi enviado
  if (mostrarRecuperacao && emailEnviado) {
    return (
      <div className={styles.container}>
        <div className={styles.standaloneFormCard}>
          <h1 className={styles.title}>email enviado!</h1>
          <p className={styles.subtitle}>
            enviamos um link de acesso direto para <strong>{email}</strong>
          </p>
          <p className={styles.instructionText}>
            verifique sua caixa de entrada e clique no link para entrar na sua conta.
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
        <div className={styles.standaloneFormCard}>
          <h1 className={styles.title}>recuperar acesso</h1>
          <p className={styles.subtitle}>
            enviaremos um email com a opção de acesso direto a sua conta
          </p>

          <form onSubmit={handleRecuperarSenha} className={styles.form}>
            <div className="form-group">
              <label htmlFor="email-recuperacao">email</label>
              <input
                id="email-recuperacao"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  e.target.setCustomValidity('');
                }}
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.valueMissing) {
                    target.setCustomValidity('preencha o email');
                  } else if (target.validity.typeMismatch) {
                    target.setCustomValidity('digite um email válido');
                  }
                }}
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
              {enviandoEmail ? 'enviando...' : 'enviar link de acesso'}
            </button>
          </form>

          <button
            onClick={voltarParaLogin}
            className={styles.linkButton}
          >
            voltar para login
          </button>
        </div>
      </div>
    );
  }

  // Se email foi confirmado com sucesso
  if (emailConfirmado) {
    return (
      <div className={styles.container}>
        <div className={styles.standaloneFormCard}>
          <div className={styles.popupIcon}>✓</div>
          <h1 className={styles.title}>email confirmado!</h1>
          <p className={styles.subtitle}>
            sua conta foi ativada com sucesso
          </p>
          <p className={styles.instructionText}>
            agora você pode fazer login com suas credenciais
          </p>
          <button
            onClick={() => setEmailConfirmado(false)}
            className="primary"
            style={{ width: '100%', marginTop: '24px' }}
          >
            fazer login
          </button>
        </div>
      </div>
    );
  }

  // Tela de login normal
  return (
    <div className={styles.loginContainer}>
      {/* Lado Esquerdo - Branding */}
      <div className={styles.leftSection}>
        <div className={styles.brandingContent}>
          <h1 className={styles.brandingTitle}>used</h1>
          <p className={styles.brandingSubtitle}>
            acesse sua conta e comece a comprar e vender
          </p>
          <p className={styles.brandingDescription}>
            faça login para acessar sua conta e continuar navegando pela plataforma.
            encontre produtos incríveis ou anuncie os seus.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className={styles.rightSection}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>entrar</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label htmlFor="email">email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  e.target.setCustomValidity('');
                }}
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.valueMissing) {
                    target.setCustomValidity('preencha o email');
                  } else if (target.validity.typeMismatch) {
                    target.setCustomValidity('digite um email válido');
                  }
                }}
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
                onChange={(e) => {
                  setSenha(e.target.value);
                  e.target.setCustomValidity('');
                }}
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.valueMissing) {
                    target.setCustomValidity('preencha a senha');
                  }
                }}
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
              recuperar acesso
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

          <p className={styles.cadastroLink}>
            não tem conta? <Link href="/cadastro">cadastre-se aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

