import React, { useState, useEffect } from 'react';
import { toast, type ToastEvent } from '../utils/toastEvent';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastEvent[]>([]);

    useEffect(() => {
        const unsubscribe = toast.subscribe((event) => {
            setToasts((prev) => [...prev, event]);

            // Auto dismiss after 5 seconds
            setTimeout(() => {
                removeToast(event.id);
            }, 5000);
        });

        return unsubscribe;
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-success-500" />;
            case 'error': return <AlertCircle size={20} className="text-error-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-warning-500" />;
            case 'info': return <Info size={20} className="text-amber-400" />;
            default: return null;
        }
    };

    const getAccent = (type: string) => {
        switch (type) {
            case 'success': return 'border-l-success-500';
            case 'error': return 'border-l-error-500';
            case 'warning': return 'border-l-warning-500';
            case 'info': return 'border-l-amber-400';
            default: return 'border-l-white/20';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`
                        pointer-events-auto min-w-[300px] max-w-sm rounded-lg border border-white/[0.16] 
                        bg-surface-1/95 backdrop-blur-xl shadow-xl p-4 flex items-start gap-3
                        border-l-4 ${getAccent(t.type)}
                        transform transition-all duration-300 animate-slideIn
                    `}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon(t.type)}
                    </div>
                    <div className="flex-1 text-sm text-text-primary font-medium">
                        {t.message}
                    </div>
                    <button
                        onClick={() => removeToast(t.id)}
                        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
