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
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      setCheckingAuth(false);
      return;
    }

    // CRÍTICO: Verificar PRIMEIRO de forma SÍNCRONA e IMEDIATA se há hash fragments
    // O Supabase processa hash fragments automaticamente quando a página carrega,
    // então precisamos detectar ANTES de qualquer processamento assíncrono
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const reset = urlParams.get('reset');
    
    // Verificar se há hash fragments de reset (Supabase usa #access_token=...&type=recovery)
    // Aceitar qualquer hash que contenha access_token (indica link de reset/recuperação)
    const hasResetToken = hash.length > 0 && (hash.includes('access_token') || hash.includes('recovery'));
    
    // Se houver token de reset OU parâmetro reset=true, mostrar tela IMEDIATAMENTE
    // IMPORTANTE: Isso deve acontecer ANTES de qualquer chamada ao Supabase
    if (hasResetToken || reset === 'true') {
      // Limpar URL para remover hash fragments visíveis ANTES de qualquer processamento
      if (hasResetToken) {
        window.history.replaceState({}, '', '/login?reset=true');
      }
      
      // Mostrar tela de redefinição IMEDIATAMENTE (síncrono, antes de qualquer processamento)
      // Isso previne que qualquer lógica de redirecionamento execute
      setMostrarRedefinir(true);
      setCheckingAuth(false);
      
      // IMPORTANTE: Adicionar listener para prevenir redirecionamento automático
      // mesmo que o Supabase crie uma sessão via onAuthStateChange
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // Se estamos na tela de redefinição, NÃO redirecionar mesmo se houver sessão
        // Verificar URL atual diretamente (valores mais confiáveis)
        const currentHash = window.location.hash;
        const currentParams = new URLSearchParams(window.location.search);
        const currentReset = currentParams.get('reset');
        const currentPath = window.location.pathname;
        
        // Se estiver na página de login com reset, não fazer nada
        const isResetPage = currentPath === '/login' && (currentHash.includes('access_token') || currentHash.includes('recovery') || currentReset === 'true');
        
        if (isResetPage) {
          // NÃO redirecionar - manter na tela de redefinição
          // A sessão de recuperação é necessária para redefinir senha, mas não deve fazer login permanente
          return;
        }
      });

      // Processar hash fragments em background (sem bloquear a UI)
      // O Supabase já processou automaticamente, mas a tela já está mostrando redefinição
      if (hasResetToken) {
        // Aguardar um pouco para que o Supabase termine de processar os hash fragments
        setTimeout(async () => {
          try {
            // Verificar se o token de recuperação é válido
            // O Supabase processa o hash fragment automaticamente e cria uma sessão de recuperação
            // Essa sessão permite apenas redefinir senha, não login permanente
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
              setErro('link de redefinição inválido ou expirado. solicite um novo link.');
              setMostrarRedefinir(false);
            }
            // Se há sessão de recuperação, está tudo certo - o usuário pode redefinir a senha
            // Não fazemos logout aqui porque a sessão de recuperação é necessária para updateUser
            // O logout será feito após redefinir a senha com sucesso
          } catch (error) {
            setErro('erro ao processar link de redefinição. solicite um novo link.');
            setMostrarRedefinir(false);
          }
        }, 1000);
      }
      
      // Cleanup do listener quando o componente desmontar ou quando sair do reset
      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Se NÃO for redefinição de senha, fazer logout se houver sessão ativa
      // Isso garante que se o usuário atualizar a página de /login?reset=true para /login,
      // ele será deslogado e verá a tela de login normal
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          // Fazer logout para garantir que não há sessão ativa
          // Isso é importante caso o usuário tenha vindo da tela de redefinição
          await supabase.auth.signOut();
        }
        setCheckingAuth(false);
      });
    }
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

  const handleGoogleLogin = async () => {
    setErro('');
    setLoadingGoogle(true);

    try {
      const baseUrl = getSiteUrl();

      // Validar que temos uma URL válida
      if (!baseUrl || baseUrl.trim() === '') {
        throw new Error('URL do site não configurada. Configure NEXT_PUBLIC_SITE_URL no Netlify.');
      }

      // Construir URL de redirecionamento (garantir que não tenha barras duplas)
      const redirectTo = `${baseUrl}/`.replace(/\/+/g, '/');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setErro(error.message || 'erro ao fazer login com google');
      setLoadingGoogle(false);
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

      // Fazer logout após redefinir senha para forçar novo login
      await supabase.auth.signOut();

      setSenhaRedefinida(true);
    } catch (error: any) {
      setErro(error.message || 'erro ao redefinir senha');
    } finally {
      setRedefinindo(false);
    }
  };

  const irParaLogin = async () => {
    // Garantir que o usuário está deslogado
    await supabase.auth.signOut();
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
        <div className={styles.standaloneFormCard}>
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
              {enviandoEmail ? 'enviando...' : 'enviar link de recuperação'}
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
              esqueci minha senha
            </button>

            {erro && <div className="error-message">{erro}</div>}

            <button
              type="submit"
              className="primary"
              disabled={loading || loadingGoogle}
              style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading && <div className="loading-small"></div>}
              {loading ? 'entrando...' : 'entrar'}
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerText}>ou</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className={styles.googleButton}
            disabled={loading || loadingGoogle}
          >
            {loadingGoogle ? (
              <>
                <div className="loading-small"></div>
                <span>conectando...</span>
              </>
            ) : (
              <>
                <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>entrar com google</span>
              </>
            )}
          </button>

          <p className={styles.cadastroLink}>
            não tem conta? <Link href="/cadastro">cadastre-se aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

