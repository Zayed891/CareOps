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
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'error': return <AlertCircle size={20} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-yellow-500" />;
            case 'info': return <Info size={20} className="text-blue-500" />;
            default: return null;
        }
    };

    const getColors = (type: string) => {
        switch (type) {
            case 'success': return 'border-green-200 bg-green-50';
            case 'error': return 'border-red-200 bg-red-50';
            case 'warning': return 'border-yellow-200 bg-yellow-50';
            case 'info': return 'border-blue-200 bg-blue-50';
            default: return 'border-gray-200 bg-white';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`
                        pointer-events-auto min-w-[300px] max-w-sm rounded-lg border shadow-lg p-4 flex items-start gap-3 
                        transform transition-all duration-300 animate-in slide-in-from-right
                        ${getColors(t.type)}
                    `}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon(t.type)}
                    </div>
                    <div className="flex-1 text-sm text-gray-800 font-medium">
                        {t.message}
                    </div>
                    <button
                        onClick={() => removeToast(t.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
