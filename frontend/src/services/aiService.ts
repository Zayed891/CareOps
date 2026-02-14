import api from './api';

export const aiService = {
    generateReply: async (context: string) => {
        const response = await api.post('/ai/generate-reply', { context });
        return response.data;
    },
    analyzeIntent: async (message: string) => {
        const response = await api.post('/ai/analyze-intent', { message });
        return response.data;
    }
};
