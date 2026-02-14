import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';


// Load environment variables
dotenv.config();

// Initialize Passport
import passport from './config/passport';

const app: Application = express();
const httpServer = createServer(app);


const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport middleware
app.use(passport.initialize());

// Logging
import morgan from 'morgan';
import { stream } from './utils/logger';
import { errorHandler } from './middleware/error';

app.use(morgan('combined', { stream }));

// Routes — Webhooks (MUST be before rate limiter!)
import webhookRoutes from './routes/webhooks';
app.use('/api/webhooks', webhookRoutes);

// Rate Limiting (applied after webhooks)
import { apiLimiter } from './middleware/rateLimit';
app.use('/api', apiLimiter);

// Routes — Authenticated
import authRoutes from './routes/auth';
import serviceTypeRoutes from './routes/serviceTypes';
import availabilityRoutes from './routes/availability';
import bookingRoutes from './routes/bookings';
import inventoryRoutes from './routes/inventory';
import formsRoutes from './routes/forms';
import statsRoutes from './routes/stats';
import contactRoutes from './routes/contacts';
import conversationRoutes from './routes/conversations';
import staffRoutes from './routes/staff';
import integrationRoutes from './routes/integrations';
import automationRoutes from './routes/automation';
import workspaceRoutes from './routes/workspace';
import aiRoutes from './routes/ai';

// Routes — Public (no auth)
import publicRoutes from './routes/public';

app.use('/api/auth', authRoutes);
app.use('/api/service-types', serviceTypeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/automation-rules', automationRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/public', publicRoutes);

// Health check route
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        // Check database connection
        await import('./db').then(async ({ default: prisma }) => {
            await prisma.$queryRaw`SELECT 1`;
        });

        res.json({
            status: 'ok',
            message: 'CareOps API is running',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'CareOps API is running but database is unavailable',
            database: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling middleware (must be last)
app.use(errorHandler as any);

// Initialize Socket.io
import { initSocket } from './services/socketService';
const io = initSocket(httpServer);

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_workspace', (workspaceId) => {
        console.log(`Socket ${socket.id} joined workspace ${workspaceId}`);
        socket.join(workspaceId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start scheduled jobs
import { startScheduler } from './services/scheduler';

// Start server
httpServer.listen(PORT, () => {
    console.log(`🚀 CareOps Backend running on port ${PORT}`);
    startScheduler();
});

export { app, io };
