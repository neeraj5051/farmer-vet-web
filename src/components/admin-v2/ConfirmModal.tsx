import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import './ConfirmModal.css';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (variant) {
      case 'danger':
        return <ShieldAlert size={26} />;
      case 'warning':
        return <AlertTriangle size={26} />;
      case 'success':
        return <CheckCircle2 size={26} />;
      case 'primary':
      default:
        return <Info size={26} />;
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={() => !isLoading && onCancel()}>
      <div className="confirm-modal-card" onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-body">
          <div className={`confirm-modal-icon-wrap ${variant}`}>
            {renderIcon()}
          </div>
          <div className="confirm-modal-text-content">
            <h3 className="confirm-modal-title">{title}</h3>
            <div className="confirm-modal-message">{message}</div>
          </div>
        </div>
        <div className="confirm-modal-footer">
          <button
            type="button"
            className="confirm-btn confirm-btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-btn confirm-btn-${variant}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <span className="confirm-modal-spinner" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
