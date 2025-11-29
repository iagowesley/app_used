'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SessionMonitor() {
    const [showExpiredModal, setShowExpiredModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const checkSession = async (retryCount = 0) => {
            // 0. Verificar se estamos no período de graça (logo após login)
            const graceUntil = localStorage.getItem('session_grace_until');
            if (graceUntil && Date.now() < Number(graceUntil)) {
                return; // Não verificar ainda, acabamos de fazer login
            }

            // 1. Verificar se tem usuário logado
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) return;

            // 2. Pegar o ID da sessão local
            let localSessionId = localStorage.getItem('local_session_id');

            // 3. Pegar o ID da sessão ativa no servidor (user_metadata)
            const { data: { user } } = await supabase.auth.getUser();
            const serverSessionId = user?.user_metadata?.active_session_id;

            // CENÁRIO 1: Usuário logado mas sem ID local (ex: Login Google ou primeira vez)
            // Ação: Gerar ID, salvar e assumir a sessão
            if (!localSessionId) {
                const newSessionId = crypto.randomUUID();
                localStorage.setItem('local_session_id', newSessionId);
                localStorage.setItem('session_grace_until', String(Date.now() + 15000));
                await supabase.auth.updateUser({
                    data: { active_session_id: newSessionId }
                });
                return;
            }

            // CENÁRIO 2: Tem ID local mas servidor não tem (ex: erro anterior)
            // Ação: Atualizar servidor
            if (localSessionId && !serverSessionId) {
                await supabase.auth.updateUser({
                    data: { active_session_id: localSessionId }
                });
                return;
            }

            // CENÁRIO 3: IDs diferentes
            // Ação: Sessão expirada! Outra pessoa logou.
            if (localSessionId !== serverSessionId) {
                // Retry logic: Se for a primeira falha, espera 2s e tenta de novo
                // Isso evita race conditions onde o servidor ainda não propagou o update do login atual
                if (retryCount < 1) {
                    setTimeout(() => checkSession(retryCount + 1), 2000);
                    return;
                }

                clearInterval(intervalId);
                setShowExpiredModal(true);

                // Fazer logout localmente para limpar sessão
                await supabase.auth.signOut();

                // Limpar storage
                localStorage.removeItem('local_session_id');
            }
        };

        // Verificar a cada 5 segundos
        intervalId = setInterval(() => checkSession(0), 5000);

        // Verificar imediatamente ao montar
        checkSession(0);

        // Listener para sincronizar abas
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'local_session_id') {
                // Se o valor for nulo (logout em outra aba), deslogar aqui também
                if (!e.newValue) {
                    supabase.auth.signOut();
                    router.push('/login');
                }
                // Se mudou para outro ID (login em outra aba), recarregar para pegar novo estado
                else if (e.newValue !== localStorage.getItem('local_session_id')) {
                    window.location.reload();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [router]);

    const handleClose = () => {
        setShowExpiredModal(false);
        router.push('/login');
    };

    if (!showExpiredModal) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>

                <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '12px',
                    fontFamily: 'var(--font-familjen)'
                }}>
                    sessão expirada
                </h2>
                <p style={{
                    color: '#4b5563',
                    marginBottom: '24px',
                    lineHeight: '1.5'
                }}>
                    identificamos um novo acesso à sua conta em outro dispositivo ou navegador. por segurança, esta sessão foi encerrada.
                </p>
                <button
                    onClick={handleClose}
                    style={{
                        backgroundColor: '#d97757',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '16px',
                        transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                    entendi, ir para login
                </button>
            </div>
        </div>
    );
}
