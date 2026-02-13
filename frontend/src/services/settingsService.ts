import api from './api';
import type { StaffMember, Permission, Integration, AutomationRule, WorkspaceStatus } from '../types/modules';

export const staffService = {
    getAll: async () => {
        const response = await api.get<StaffMember[]>('/staff');
        return response.data;
    },
    invite: async (data: { email: string; name: string; password: string; permissions?: Partial<Permission> }) => {
        const response = await api.post('/staff/invite', data);
        return response.data;
    },
    updatePermissions: async (id: string, data: Partial<Permission>) => {
        const response = await api.put<Permission>(`/staff/${id}/permissions`, data);
        return response.data;
    },
    remove: async (id: string) => {
        await api.delete(`/staff/${id}`);
    },
};

export const integrationService = {
    getAll: async () => {
        const response = await api.get<Integration[]>('/integrations');
        return response.data;
    },
    create: async (data: { type: string; config: Record<string, any>; isActive?: boolean }) => {
        const response = await api.post<Integration>('/integrations', data);
        return response.data;
    },
    update: async (id: string, data: Partial<{ config: Record<string, any>; isActive: boolean }>) => {
        const response = await api.put<Integration>(`/integrations/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/integrations/${id}`);
    },
};

export const automationService = {
    getAll: async () => {
        const response = await api.get<AutomationRule[]>('/automation-rules');
        return response.data;
    },
    create: async (data: { eventType: string; action: string; config?: Record<string, any>; isActive?: boolean }) => {
        const response = await api.post<AutomationRule>('/automation-rules', data);
        return response.data;
    },
    update: async (id: string, data: Partial<AutomationRule>) => {
        const response = await api.put<AutomationRule>(`/automation-rules/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/automation-rules/${id}`);
    },
};

export const workspaceService = {
    getStatus: async () => {
        const response = await api.get<WorkspaceStatus>('/workspace/status');
        return response.data;
    },
    activate: async () => {
        const response = await api.post('/workspace/activate');
        return response.data;
    },
};
