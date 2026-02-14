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
    async analyzeIntent(messageContent: string): Promise<{ intent: string; sentiment: string; score: number; tags: string[] }> {
        if (!process.env.GEMINI_API_KEY) {
            return { intent: 'Unknown', sentiment: 'Neutral', score: 0, tags: [] };
        }

        try {
            const prompt = `
                Analyze the following customer message.
                
                Context: The business offers professional services (e.g., Medical Clinic, Home Services, Consulting).
                
                Return a JSON object with the following fields:
                - intent: Main goal (e.g., "Booking", "Inquiry", "Complaint", "Billing", "Emergency", "Other")
                - sentiment: "Positive", "Neutral", or "Negative"
                - score: A number between 0 (Very Negative) and 10 (Very Positive)
                - tags: A list of relevant tags (e.g., "Urgent", "New Patient", "Repair", "Quote", "Follow-up")

                Message: "${messageContent}"
                
                Return ONLY raw JSON, no markdown formatting.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json|```/g, '').trim(); // Clean markdown
            return JSON.parse(text);
        } catch (error) {
            console.error('Error analyzing intent:', error);
            return { intent: 'Error', sentiment: 'Neutral', score: 0, tags: [] };
        }
    }
}

export const geminiService = new GeminiService();
