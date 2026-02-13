import api from './api';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import {
    type FormTemplate,
    type CreateFormTemplateIn,
    type UpdateFormTemplateIn,
    type FormSubmission,
    type SubmitFormIn
} from '../types/form';

export const formService = {

    // Templates
    getAllTemplates: async (params?: PaginationParams) => {
        const response = await api.get<PaginatedResponse<FormTemplate>>('/forms/templates', { params });
        return response.data;
    },

    getTemplate: async (id: string) => {
        const response = await api.get<FormTemplate>(`/forms/templates/${id}`);
        return response.data;
    },

    createTemplate: async (data: CreateFormTemplateIn) => {
        const response = await api.post<FormTemplate>('/forms/templates', data);
        return response.data;
    },

    updateTemplate: async (id: string, data: UpdateFormTemplateIn) => {
        const response = await api.put<FormTemplate>(`/forms/templates/${id}`, data);
        return response.data;
    },

    deleteTemplate: async (id: string) => {
        const response = await api.delete(`/forms/templates/${id}`);
        return response.data;
    },

    // Submissions
    getSubmissions: async (templateId: string, params?: PaginationParams) => {
        const response = await api.get<PaginatedResponse<FormSubmission>>(`/forms/templates/${templateId}/submissions`, { params });
        return response.data;
    },

    getSubmission: async (id: string) => {
        const response = await api.get<FormSubmission>(`/forms/submissions/${id}`);
        return response.data;
    },

    submitForm: async (data: SubmitFormIn) => {
        const response = await api.post<FormSubmission>(`/forms/templates/${data.templateId}/submissions`, { data: data.data });
        return response.data;
    }
};
