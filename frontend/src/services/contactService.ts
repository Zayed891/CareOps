import api from './api';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import type { Contact } from '../types/modules';

export const contactService = {
    getAll: async (params?: PaginationParams & { search?: string }) => {
        const response = await api.get<PaginatedResponse<Contact>>('/contacts', { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<Contact>(`/contacts/${id}`);
        return response.data;
    },
    create: async (data: { name: string; email?: string; phone?: string }) => {
        const response = await api.post<Contact>('/contacts', data);
        return response.data;
    },
    update: async (id: string, data: Partial<{ name: string; email: string; phone: string }>) => {
        const response = await api.put<Contact>(`/contacts/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/contacts/${id}`);
    },
};
