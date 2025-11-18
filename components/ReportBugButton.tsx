// Componente Botão de Reportar Bug
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ReportBugModal from './ReportBugModal';
import styles from './ReportBugButton.module.css';

export default function ReportBugButton() {
  const [user, setUser] = useState<any>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    // Verificar se há usuário logado
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReportBug = () => {
    setMostrarModal(true);
  };

  // Só mostra o botão se o usuário estiver logado
  if (!user) {
    return null;
  }

  return (
    <>
      <button 
        className={styles.reportBugButton}
        onClick={handleReportBug}
        aria-label="reportar bug"
      >
        <img src="/bug.png" alt="bug" className={styles.bugIcon} />
        <span className={styles.bugText}>reportar bug</span>
      </button>
      
      <ReportBugModal 
        isOpen={mostrarModal} 
        onClose={() => setMostrarModal(false)} 
      />
    </>
  );
}

