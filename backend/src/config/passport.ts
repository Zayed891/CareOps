import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import prisma from '../db';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        },
        async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0]?.value;
                
                if (!email) {
                    return done(new Error('No email found in Google profile'), undefined);
                }

                // Check if user already exists
                let user = await prisma.user.findUnique({
                    where: { email },
                    include: { workspace: true },
                });

                if (user) {
                    // User exists, return user
                    return done(null, user);
                }

                // User doesn't exist, create new user with workspace
                const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                    // Create workspace
                    const workspaceName = `${profile.displayName || email.split('@')[0]}'s Workspace`;
                    const workspace = await tx.workspace.create({
                        data: {
                            name: workspaceName,
                            slug: workspaceName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
                            contactEmail: email,
                            timezone: 'UTC',
                        },
                    });

                    // Create user
                    const newUser = await tx.user.create({
                        data: {
                            email,
                            password: '', // No password for OAuth users
                            name: profile.displayName || email.split('@')[0],
                            role: 'OWNER',
                            workspaceId: workspace.id,
                        },
                    });

                    // Create default permissions
                    await tx.permission.create({
                        data: {
                            userId: newUser.id,
                            canAccessInbox: true,
                            canManageBookings: true,
                            canViewForms: true,
                            canViewInventory: true,
                            canModifySettings: true,
                        },
                    });

                    return await tx.user.findUnique({
                        where: { id: newUser.id },
                        include: { workspace: true },
                    });
                });

                return done(null, result!);
            } catch (error) {
                console.error('Google OAuth error:', error);
                return done(error as Error, undefined);
            }
        }
    )
);

// Generate JWT for OAuth user
export const generateOAuthToken = (user: any) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            workspaceId: user.workspaceId,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );
};

export default passport;
