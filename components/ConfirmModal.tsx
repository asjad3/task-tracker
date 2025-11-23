import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-primary-100 p-6 max-w-md w-full animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-primary-400 hover:text-primary-900 hover:bg-primary-50 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <AlertCircle className={`w-6 h-6 ${
              variant === 'danger' ? 'text-red-600' : 'text-yellow-600'
            }`} />
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-xl font-display font-bold text-primary-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-primary-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-medium bg-primary-100 text-primary-900 hover:bg-primary-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-colors ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
