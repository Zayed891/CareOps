import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { ZodError } from 'zod';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    Logger.error(
        `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation failed',
            details: (err as any).errors,
        });
    }

    res.status(statusCode).json({
        error: message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};
