import api from './api';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import type { Conversation, Message } from '../types/modules';

export interface SendMessageResponse extends Message {
    emailSent?: boolean;
    smsSent?: boolean;
    deliveryError?: string | null;
}

export const conversationService = {
    getAll: async (params?: PaginationParams) => {
        const response = await api.get<PaginatedResponse<Conversation>>('/conversations', { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<Conversation>(`/conversations/${id}`);
        return response.data;
    },
    sendMessage: async (conversationId: string, data: { content: string; channel?: string }) => {
        const response = await api.post<SendMessageResponse>(`/conversations/${conversationId}/messages`, data);
        return response.data;
    },
    recordInbound: async (conversationId: string, data: { content: string; channel?: string }) => {
        const response = await api.post<Message>(`/conversations/${conversationId}/messages/inbound`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/conversations/${id}`);
        return response.data;
    },
};
