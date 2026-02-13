import api from './api';

export const aiService = {
    generateReply: async (context: string) => {
        const response = await api.post('/ai/generate-reply', { context });
        return response.data;
    }
};
