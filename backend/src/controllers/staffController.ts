import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';
import bcrypt from 'bcryptjs';

// GET /api/staff — List staff members
export const getStaff = async (req: AuthRequest, res: Response) => {
    try {
        const workspaceId = req.user?.workspaceId;
        const staff = await prisma.user.findMany({
            where: { workspaceId },
            select: {
                id: true, email: true, name: true, role: true, createdAt: true,
                permissions: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
};

// POST /api/staff/invite — Invite new staff (Owner only)
export const inviteStaff = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can invite staff' });
        }

        const { email, name, password, permissions } = req.body;
        const workspaceId = req.user.workspaceId;

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ error: 'User with this email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.$transaction(async (tx: any) => {
            const newUser = await tx.user.create({
                data: {
                    email, name, password: hashedPassword,
                    role: 'STAFF', workspaceId,
                },
            });

            await tx.permission.create({
                data: {
                    userId: newUser.id,
                    ...(permissions || {
                        canAccessInbox: true,
                        canManageBookings: true,
                        canViewForms: true,
                        canViewInventory: true,
                        canModifySettings: false,
                    }),
                },
            });

            return newUser;
        });

        res.status(201).json({
            id: user.id, email: user.email, name: user.name, role: user.role,
        });
    } catch (error) {
        console.error('Error inviting staff:', error);
        res.status(500).json({ error: 'Failed to invite staff' });
    }
};

// PUT /api/staff/:id/permissions — Update staff permissions (Owner only)
export const updatePermissions = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can modify permissions' });
        }

        const id = String(req.params.id);
        const targetUser = await prisma.user.findFirst({
            where: { id, workspaceId: req.user.workspaceId },
        });
        if (!targetUser) return res.status(404).json({ error: 'Staff member not found' });

        // Only extract known permission fields to avoid Prisma errors
        const { canAccessInbox, canManageBookings, canViewForms, canViewInventory, canModifySettings } = req.body;
        const permData: any = {};
        if (canAccessInbox !== undefined) permData.canAccessInbox = canAccessInbox;
        if (canManageBookings !== undefined) permData.canManageBookings = canManageBookings;
        if (canViewForms !== undefined) permData.canViewForms = canViewForms;
        if (canViewInventory !== undefined) permData.canViewInventory = canViewInventory;
        if (canModifySettings !== undefined) permData.canModifySettings = canModifySettings;

        const permission = await prisma.permission.upsert({
            where: { userId: id },
            update: permData,
            create: { userId: id, ...permData },
        });

        res.json(permission);
    } catch (error) {
        console.error('Error updating permissions:', error);
        res.status(500).json({ error: 'Failed to update permissions' });
    }
};

// DELETE /api/staff/:id — Remove staff member (Owner only)
export const removeStaff = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can remove staff' });
        }

        const id = String(req.params.id);
        const targetUser = await prisma.user.findFirst({
            where: { id, workspaceId: req.user.workspaceId, role: 'STAFF' },
        });
        if (!targetUser) return res.status(404).json({ error: 'Staff member not found' });

        await prisma.$transaction(async (tx: any) => {
            await tx.permission.deleteMany({ where: { userId: id } });
            await tx.user.delete({ where: { id } });
        });

        res.json({ message: 'Staff member removed' });
    } catch (error) {
        console.error('Error removing staff:', error);
        res.status(500).json({ error: 'Failed to remove staff' });
    }
};
