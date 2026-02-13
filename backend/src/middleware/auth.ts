import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        workspaceId: string;
    };
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            email: string;
            role: string;
            workspaceId: string;
        };

        req.user = decoded as Express.User;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Export as 'authenticate' for compatibility
export const authenticate = authMiddleware;

export const ownerOnly = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.user?.role !== 'OWNER') {
        return res.status(403).json({ error: 'Owner access required' });
    }
    next();
};
