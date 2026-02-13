import { Request } from 'express';

// Extend Passport's User interface
declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
            role: string;
            workspaceId: string;
            name?: string;
            password?: string;
            workspace?: any;
        }
    }
}

export interface AuthRequest extends Request {
    user: {
        id: string;
        email: string;
        role: string;
        workspaceId: string;
    };
}
