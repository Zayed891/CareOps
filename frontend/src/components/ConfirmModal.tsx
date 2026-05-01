import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'bg-error-50 text-error-500',
            button: 'bg-error-600 hover:bg-error-500 focus:ring-error-500/50',
        },
        warning: {
            icon: 'bg-warning-50 text-warning-500',
            button: 'bg-warning-600 hover:bg-warning-500 focus:ring-warning-500/50',
        },
        info: {
            icon: 'bg-amber-900/30 text-amber-400',
            button: 'bg-amber-500 hover:bg-amber-400 focus:ring-amber-500/50 text-surface-0',
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div 
                className="bg-surface-1 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn border border-white/[0.16]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.icon}`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-text-primary font-display mb-1">
                                {title}
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors p-1"
                            disabled={loading}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-surface-2/50 flex items-center justify-end gap-3 border-t border-white/[0.16]">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn-secondary text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-semibold font-display text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${styles.button}`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {confirmText}
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
