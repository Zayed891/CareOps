import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is not set in environment variables. AI features will be disabled.');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    }

    async generateReply(conversationContext: string): Promise<string> {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('Gemini API key is not configured');
        }

        try {
            const prompt = `
        You are an AI assistant for a service business. 
        Generate a helpful, professional, and concise reply to the following customer message(s).
        The context provided includes previous messages in the conversation.
        
        Conversation Context:
        ${conversationContext}
        
        Draft a reply:
      `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating reply from Gemini:', error);
            throw new Error('Failed to generate AI reply');
        }
    }
}

export const geminiService = new GeminiService();
