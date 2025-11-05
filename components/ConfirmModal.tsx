// Componente Modal de Confirmação
'use client';

import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'confirmar',
  cancelText = 'cancelar',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onCancel} disabled={loading}>
          ×
        </button>

        
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>

        <div className={styles.buttons}>
          <button
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={styles.confirmButton}
            disabled={loading}
          >
            {loading && <div className="loading-small"></div>}
            {loading ? 'deletando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

