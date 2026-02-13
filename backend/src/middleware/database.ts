import { Request, Response, NextFunction } from 'express';
import prisma from '../db';

// Health check for database connection
export const checkDatabaseConnection = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Simple query to check database connection
        await prisma.$queryRaw`SELECT 1`;
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(503).json({
            error: 'Database unavailable',
            message: 'Unable to connect to the database. Please try again later.'
        });
    }
};

// Request logger middleware
export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
            `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
        );
    });

    next();
};
