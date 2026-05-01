import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Trash2, Users, Settings, Check, X } from 'lucide-react';
import { staffService } from '../../services/settingsService';
import type { StaffMember, Permission } from '../../types/modules';
import ConfirmModal from '../../components/ConfirmModal';

const PERMISSION_LABELS: Record<string, string> = {
    canAccessInbox: 'Inbox Access',
    canManageBookings: 'Manage Bookings',
    canViewForms: 'View Forms',
    canViewInventory: 'View Inventory',
    canModifySettings: 'Modify Settings',
};

const StaffPage: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [editingPermissions, setEditingPermissions] = useState<string | null>(null);
    const [permForm, setPermForm] = useState<Partial<Permission>>({});
    const [form, setForm] = useState({ name: '', email: '', password: '', permissions: {} as Record<string, boolean> });
    const [error, setError] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const result = await staffService.getAll();
            setStaff(result);
        } catch {
            setError('Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await staffService.invite({
                name: form.name,
                email: form.email,
                password: form.password,
                permissions: {
                    canAccessInbox: form.permissions.canAccessInbox ?? true,
                    canManageBookings: form.permissions.canManageBookings ?? true,
                    canViewForms: form.permissions.canViewForms ?? true,
                    canViewInventory: form.permissions.canViewInventory ?? true,
                    canModifySettings: form.permissions.canModifySettings ?? false,
                },
            });
            setForm({ name: '', email: '', password: '', permissions: {} });
            setShowInvite(false);
            setError('');
            fetchStaff();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to invite staff member');
        }
    };

    const handleRemoveClick = (id: string) => {
        setStaffToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleRemoveConfirm = async () => {
        if (!staffToDelete) return;
        try {
            setDeleting(true);
            await staffService.remove(staffToDelete);
            fetchStaff();
            setDeleteModalOpen(false);
            setStaffToDelete(null);
        } catch {
            setError('Failed to remove staff member');
        } finally {
            setDeleting(false);
        }
    };

    const startEditPermissions = (member: StaffMember) => {
        setEditingPermissions(member.id);
        // permissions comes as an array from the API; extract the first element
        const perms = Array.isArray(member.permissions) ? member.permissions[0] : member.permissions;
        setPermForm(perms || {
            canAccessInbox: true,
            canManageBookings: true,
            canViewForms: true,
            canViewInventory: true,
            canModifySettings: false,
        });
    };

    const savePermissions = async () => {
        if (!editingPermissions) return;
        try {
            await staffService.updatePermissions(editingPermissions, permForm);
            setEditingPermissions(null);
            setError('');
            fetchStaff();
        } catch {
            setError('Failed to update permissions');
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn">
            <div className="section-header mb-8">
                <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-amber-400" />
                    <div>
                        <h1 className="section-title">Staff Management</h1>
                        <p className="section-description">Manage team members and their permissions</p>
                    </div>
                </div>
                <button onClick={() => setShowInvite(!showInvite)}
                    className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors text-sm font-medium">
                    <UserPlus className="h-4 w-4 mr-2" /> Invite Staff
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-error-50 text-error-500 rounded-lg text-sm">{error}</div>}

            {showInvite && (
                <form onSubmit={handleInvite} className="mb-6 p-5 bg-surface-1 border border-white/[0.06] rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">Invite New Staff Member</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <input required placeholder="Full Name *" value={form.name}
                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                            className="px-3 py-2 border border-white/[0.08] rounded-lg text-sm focus:ring-2 focus:ring-amber-500/40" />
                        <input required type="email" placeholder="Email *" value={form.email}
                            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                            className="px-3 py-2 border border-white/[0.08] rounded-lg text-sm focus:ring-2 focus:ring-amber-500/40" />
                        <input required type="password" placeholder="Password *" value={form.password}
                            onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                            className="px-3 py-2 border border-white/[0.08] rounded-lg text-sm focus:ring-2 focus:ring-amber-500/40" />
                    </div>
                    <div className="mb-4">
                        <p className="text-xs font-medium text-text-muted mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 text-sm text-text-secondary">
                                    <input
                                        type="checkbox"
                                        checked={form.permissions[key] ?? (key !== 'canModifySettings')}
                                        onChange={(e) => setForm(f => ({
                                            ...f,
                                            permissions: { ...f.permissions, [key]: e.target.checked }
                                        }))}
                                        className="rounded border-white/[0.08] text-amber-400 focus:ring-amber-500/40"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-400">Invite</button>
                        <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 bg-surface-2 text-text-secondary rounded-lg text-sm hover:bg-surface-3">Cancel</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {staff.map(member => (
                        <div key={member.id} className="bg-surface-1 border border-white/[0.06] rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-amber-900/20 text-amber-300 flex items-center justify-center text-sm font-medium">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{member.name}</p>
                                        <p className="text-xs text-text-muted">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'OWNER' ? 'bg-amber-900/30 text-amber-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                        <Shield className="h-3 w-3" />{member.role}
                                    </span>
                                    {member.role === 'STAFF' && (
                                        <>
                                            <button
                                                onClick={() => editingPermissions === member.id ? setEditingPermissions(null) : startEditPermissions(member)}
                                                className="text-text-muted hover:text-amber-400 transition-colors"
                                                title="Edit Permissions"
                                            >
                                                <Settings className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleRemoveClick(member.id)} className="text-text-muted hover:text-error-500 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Permissions Editor */}
                            {editingPermissions === member.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-white/[0.04] bg-surface-0">
                                    <p className="text-xs font-medium text-text-muted mb-3">Edit Permissions</p>
                                    <div className="flex flex-wrap gap-4 mb-3">
                                        {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                                            <label key={key} className="flex items-center gap-2 text-sm text-text-secondary">
                                                <input
                                                    type="checkbox"
                                                    checked={(permForm as any)[key] ?? false}
                                                    onChange={(e) => setPermForm(prev => ({ ...prev, [key]: e.target.checked }))}
                                                    className="rounded border-white/[0.08] text-amber-400 focus:ring-amber-500/40"
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={savePermissions}
                                            className="inline-flex items-center px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs hover:bg-amber-400">
                                            <Check className="h-3 w-3 mr-1" /> Save
                                        </button>
                                        <button onClick={() => setEditingPermissions(null)}
                                            className="inline-flex items-center px-3 py-1.5 bg-surface-2 text-text-secondary rounded-lg text-xs hover:bg-surface-3">
                                            <X className="h-3 w-3 mr-1" /> Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Show current permissions summary inline */}
                            {member.role === 'STAFF' && member.permissions && editingPermissions !== member.id && (
                                <div className="px-4 pb-3 flex flex-wrap gap-2">
                                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                                        const perms = Array.isArray(member.permissions) ? member.permissions[0] : member.permissions;
                                        const hasPermission = (perms as any)?.[key];
                                        return hasPermission ? (
                                            <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-success-50 text-success-500 border border-success-500/20">
                                                {label}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setStaffToDelete(null);
                }}
                onConfirm={handleRemoveConfirm}
                title="Remove Staff Member"
                message="Are you sure you want to remove this staff member? They will lose access to the system immediately."
                confirmText="Remove Staff"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
};

export default StaffPage;
