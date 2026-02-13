import api from './api';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import {
    type InventoryItem,
    type CreateInventoryItemIn,
    type UpdateInventoryItemIn,
    type UpdateStockIn
} from '../types/inventory';

export const inventoryService = {

    // ... (previous imports)

    getAll: async (params?: PaginationParams & { lowStock?: boolean }) => {
        const response = await api.get<PaginatedResponse<InventoryItem>>('/inventory/items', {
            params
        });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<InventoryItem>(`/inventory/items/${id}`);
        return response.data;
    },

    create: async (data: CreateInventoryItemIn) => {
        const response = await api.post<InventoryItem>('/inventory/items', data);
        return response.data;
    },

    update: async (id: string, data: UpdateInventoryItemIn) => {
        const response = await api.put<InventoryItem>(`/inventory/items/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/inventory/items/${id}`);
        return response.data;
    },

    updateStock: async (id: string, data: UpdateStockIn) => {
        const response = await api.post<InventoryItem>(`/inventory/items/${id}/stock`, data);
        return response.data;
    }
};
