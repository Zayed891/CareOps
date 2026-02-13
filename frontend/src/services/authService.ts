import api from './api';

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    workspaceName: string;
    workspaceAddress?: string;
    timezone?: string;
    contactEmail?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    workspace: {
        id: string;
        name: string;
        slug: string;
        isActive?: boolean;
    };
}

export const authService = {
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', data);
        localStorage.setItem('token', response.data.token);
        return response.data;
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', data);
        localStorage.setItem('token', response.data.token);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};
