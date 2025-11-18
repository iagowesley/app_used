// Componente Modal de Reportar Bug
'use client';

import { useState } from 'react';
import styles from './ReportBugModal.module.css';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportBugModal({ isOpen, onClose }: ReportBugModalProps) {
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descricao.trim()) {
      alert('por favor, descreva o bug encontrado');
      return;
    }

    setEnviando(true);

    try {
      // Criar link mailto com assunto e corpo
      const assunto = encodeURIComponent('Reportar Bug - Used');
      const corpo = encodeURIComponent(`Descrição do bug:\n\n${descricao}`);
      const email = 'appused@gmail.com';
      
      const mailtoLink = `mailto:${email}?subject=${assunto}&body=${corpo}`;
      
      // Abrir cliente de email
      window.location.href = mailtoLink;
      
      // Limpar formulário e fechar modal após um breve delay
      setTimeout(() => {
        setDescricao('');
        setEnviando(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('erro ao reportar bug:', error);
      alert('erro ao abrir cliente de email. tente novamente.');
      setEnviando(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton} 
          onClick={onClose} 
          disabled={enviando}
        >
          ×
        </button>

        <h2 className={styles.title}>reportar bug</h2>
        <p className={styles.subtitle}>
          descreva o problema encontrado para que possamos corrigi-lo
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="descricao" className={styles.label}>
              descrição do bug
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={styles.textarea}
              placeholder="descreva o bug encontrado..."
              rows={6}
              disabled={enviando}
              required
            />
          </div>

          <div className={styles.buttons}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={enviando}
            >
              cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={enviando || !descricao.trim()}
            >
              {enviando ? 'enviando...' : 'reportar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

