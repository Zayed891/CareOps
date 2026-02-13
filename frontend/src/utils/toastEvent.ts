type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastEvent {
    id: string;
    message: string;
    type: ToastType;
}

type Listener = (event: ToastEvent) => void;

let listeners: Listener[] = [];

const emit = (message: string, type: ToastType) => {
    const event: ToastEvent = {
        id: Math.random().toString(36).substring(2, 9),
        message,
        type
    };
    listeners.forEach(l => l(event));
};

export const toast = {
    success: (message: string) => emit(message, 'success'),
    error: (message: string) => emit(message, 'error'),
    info: (message: string) => emit(message, 'info'),
    warning: (message: string) => emit(message, 'warning'),
    subscribe: (listener: Listener) => {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    }
};
