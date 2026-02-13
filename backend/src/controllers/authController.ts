import { Response, Request } from 'express';
import { AuthRequest } from './../types/express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { Prisma } from '@prisma/client';
import { generateOAuthToken } from '../config/passport';
import { generateUniqueSlug } from '../utils/slugGenerator';

export const register = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, workspaceName, workspaceAddress, timezone, contactEmail } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique slug for workspace
        const slug = await generateUniqueSlug(workspaceName);

        // Create workspace and user in a transaction
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Create workspace
            const workspace = await tx.workspace.create({
                data: {
                    name: workspaceName,
                    slug: slug,
                    address: workspaceAddress,
                    timezone: timezone || 'UTC',
                    contactEmail: contactEmail || email,
                },
            });

            // Create owner user
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: 'OWNER',
                    workspaceId: workspace.id,
                },
            });

            // Create default permissions
            await tx.permission.create({
                data: {
                    userId: user.id,
                    canAccessInbox: true,
                    canManageBookings: true,
                    canViewForms: true,
                    canViewInventory: true,
                    canModifySettings: true, // Owner has all permissions
                },
            });

            return { user, workspace };
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
                workspaceId: result.workspace.id
            },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
            },
            workspace: {
                id: result.workspace.id,
                name: result.workspace.name,
                slug: result.workspace.slug,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({
            error: 'Registration failed',
            ...(process.env.NODE_ENV === 'development' && error instanceof Error && { details: error.message })
        });
    }
};

export const login = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { workspace: true },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                workspaceId: user.workspaceId
            },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            workspace: {
                id: user.workspace.id,
                name: user.workspace.name,
                slug: user.workspace.slug,
                isActive: user.workspace.isActive,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const getMe = async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                workspace: true,
                permissions: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            workspace: {
                id: user.workspace.id,
                name: user.workspace.name,
                slug: user.workspace.slug,
                isActive: user.workspace.isActive,
            },
            permissions: user.permissions,
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        
        if (!user) {
            return res.redirect(process.env.FRONTEND_URL + '/login?error=oauth_failed');
        }

        // Generate JWT token
        const token = generateOAuthToken(user);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(process.env.FRONTEND_URL + '/login?error=oauth_failed');
    }
};
