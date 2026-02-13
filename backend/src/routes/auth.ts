import { Router } from 'express';
import { register, login, getMe, googleCallback } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/auth';
import { authLimiter } from '../middleware/rateLimit';
import passport from '../config/passport';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register as any);
router.post('/login', authLimiter, validate(loginSchema), login as any);

// Google OAuth routes
router.get('/google', authLimiter, passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}));

router.get('/google/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: process.env.FRONTEND_URL + '/login?error=oauth_failed'
    }),
    googleCallback as any
);

// Protected routes
router.get('/me', authMiddleware as any, getMe as any);

export default router;
