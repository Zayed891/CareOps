import React, { useState, useEffect, useMemo } from 'react';
import { Settings as SettingsIcon, Plug, Zap, ToggleLeft, ToggleRight, Trash2, Plus, Mail, MessageSquare, CalendarDays, Building2, Save, ExternalLink, Copy, AlertCircle } from 'lucide-react';
import { integrationService, automationService, workspaceService } from '../../services/settingsService';
import type { Integration, AutomationRule } from '../../types/modules';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

const EVENT_LABELS: Record<string, string> = {
    contact_created: 'New Contact Created',
    booking_created: 'New Booking Created',
    booking_reminder: 'Booking Reminder',
    form_pending: 'Form Pending',
    inventory_low: 'Low Inventory Alert',
    staff_reply: 'Staff Reply Sent',
};

const ACTION_LABELS: Record<string, string> = {
    send_email: 'Send Email',
    send_sms: 'Send SMS',
    create_alert: 'Create Alert',
    pause_automation: 'Pause Automation',
};

const INTEGRATION_ICONS: Record<string, React.ReactNode> = {
    EMAIL: <Mail className="h-5 w-5" />,
    SMS: <MessageSquare className="h-5 w-5" />,
    CALENDAR: <CalendarDays className="h-5 w-5" />,
};

interface WorkspaceData {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    timezone: string;
    contactEmail: string;
    isActive: boolean;
}

const SettingsPage: React.FC = () => {
    const [tab, setTab] = useState<'workspace' | 'integrations' | 'automation'>('workspace');
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
    const [wsForm, setWsForm] = useState({ name: '', address: '', timezone: '', contactEmail: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showIntForm, setShowIntForm] = useState(false);
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [intForm, setIntForm] = useState({ type: 'EMAIL' as string });
    const [ruleForm, setRuleForm] = useState({ eventType: 'contact_created', action: 'send_email' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [deleteIntModalOpen, setDeleteIntModalOpen] = useState(false);
    const [intToDelete, setIntToDelete] = useState<string | null>(null);
    const [deletingInt, setDeletingInt] = useState(false);
    const [deleteRuleModalOpen, setDeleteRuleModalOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
    const [deletingRule, setDeletingRule] = useState(false);

    // Generate preview slug from current form name
    const previewSlug = useMemo(() => {
        if (!wsForm.name.trim()) return '';
        return wsForm.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'workspace';
    }, [wsForm.name]);

    // Check if slug will change
    const slugWillChange = workspace && previewSlug && previewSlug !== workspace.slug;

    const load = async () => {
        try {
            setLoading(true);
            const [ints, rls] = await Promise.all([integrationService.getAll(), automationService.getAll()]);
            setIntegrations(ints);
            setRules(rls);

            // Load workspace data
            try {
                const wsRes = await api.get('/workspace');
                setWorkspace(wsRes.data);
                setWsForm({
                    name: wsRes.data.name || '',
                    address: wsRes.data.address || '',
                    timezone: wsRes.data.timezone || '',
                    contactEmail: wsRes.data.contactEmail || '',
                });
            } catch {
                // Workspace endpoint might not exist yet
            }
        } catch {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSaveWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError('');
            const response = await api.put('/workspace', wsForm);
            setWorkspace(response.data);
            const message = slugWillChange 
                ? 'Workspace settings and booking URL updated successfully!' 
                : 'Workspace settings saved successfully';
            setSuccess(message);
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Failed to save workspace settings');
        } finally {
            setSaving(false);
        }
    };

    const copyBookingUrl = () => {
        const url = `${window.location.origin}/book/${previewSlug || workspace?.slug}`;
        navigator.clipboard.writeText(url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const handleCreateInt = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await integrationService.create({ type: intForm.type, config: {}, isActive: true });
            setShowIntForm(false);
            load();
        } catch {
            setError('Failed to create integration (may already exist)');
        }
    };

    const handleToggleInt = async (int: Integration) => {
        try {
            await integrationService.update(int.id, { isActive: !int.isActive });
            load();
        } catch {
            setError('Failed to update integration');
        }
    };

    const handleDeleteIntClick = (id: string) => {
        setIntToDelete(id);
        setDeleteIntModalOpen(true);
    };

    const handleDeleteIntConfirm = async () => {
        if (!intToDelete) return;
        try {
            setDeletingInt(true);
            await integrationService.delete(intToDelete);
            load();
            setDeleteIntModalOpen(false);
            setIntToDelete(null);
        } catch {
            setError('Failed to delete integration');
        } finally {
            setDeletingInt(false);
        }
    };

    const handleCreateRule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await automationService.create({ ...ruleForm, isActive: true });
            setShowRuleForm(false);
            load();
        } catch {
            setError('Failed to create rule');
        }
    };

    const handleToggleRule = async (rule: AutomationRule) => {
        try {
            await automationService.update(rule.id, { isActive: !rule.isActive });
            load();
        } catch {
            setError('Failed to update rule');
        }
    };

    const handleDeleteRuleClick = (id: string) => {
        setRuleToDelete(id);
        setDeleteRuleModalOpen(true);
    };

    const handleDeleteRuleConfirm = async () => {
        if (!ruleToDelete) return;
        try {
            setDeletingRule(true);
            await automationService.delete(ruleToDelete);
            load();
            setDeleteRuleModalOpen(false);
            setRuleToDelete(null);
        } catch {
            setError('Failed to delete rule');
        } finally {
            setDeletingRule(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn">
            <div className="section-header mb-8">
                <div className="flex items-center gap-3">
                    <SettingsIcon className="h-8 w-8 text-primary-600" />
                    <div>
                        <h1 className="section-title">Settings</h1>
                        <p className="section-description">Configure your workspace, integrations, and automation</p>
                    </div>
                </div>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setTab('workspace')}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'workspace' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <Building2 className="h-4 w-4 inline mr-1.5" />Workspace
                </button>
                <button onClick={() => setTab('integrations')}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'integrations' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <Plug className="h-4 w-4 inline mr-1.5" />Integrations
                </button>
                <button onClick={() => setTab('automation')}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'automation' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <Zap className="h-4 w-4 inline mr-1.5" />Automation Rules
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : tab === 'workspace' ? (
                <div>
                    <p className="text-sm text-gray-600 mb-4">Manage your business workspace settings.</p>
                    <form onSubmit={handleSaveWorkspace} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                            <input type="text" value={wsForm.name} onChange={(e) => setWsForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                placeholder="My Business" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input type="text" value={wsForm.address} onChange={(e) => setWsForm(f => ({ ...f, address: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                placeholder="123 Main St, City, State" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                <select value={wsForm.timezone} onChange={(e) => setWsForm(f => ({ ...f, timezone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time</option>
                                    <option value="America/Chicago">Central Time</option>
                                    <option value="America/Denver">Mountain Time</option>
                                    <option value="America/Los_Angeles">Pacific Time</option>
                                    <option value="Asia/Kolkata">India (IST)</option>
                                    <option value="Europe/London">London (GMT)</option>
                                    <option value="Asia/Dubai">Dubai (GST)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                <input type="email" value={wsForm.contactEmail} onChange={(e) => setWsForm(f => ({ ...f, contactEmail: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                    placeholder="contact@mybusiness.com" />
                            </div>
                        </div>

                        {/* Booking URL Section */}
                        {workspace && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Public Booking URL</label>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${workspace.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {workspace.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-xs text-gray-700 font-mono">
                                        {window.location.origin}/book/{slugWillChange ? previewSlug : workspace.slug}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={copyBookingUrl}
                                        className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                                    >
                                        {copiedUrl ? 'Copied!' : <><Copy size={14} /> Copy</>}
                                    </button>
                                    <a
                                        href={`/book/${slugWillChange ? previewSlug : workspace.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                                    >
                                        <ExternalLink size={14} /> Preview
                                    </a>
                                </div>

                                {slugWillChange && (
                                    <div className="flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 rounded p-2">
                                        <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-amber-700">
                                            <p className="font-medium">URL will change when you save</p>
                                            <p className="text-amber-600 mt-0.5">
                                                Current: <code className="bg-amber-100 px-1 rounded">/book/{workspace.slug}</code>
                                                {' → '}
                                                New: <code className="bg-amber-100 px-1 rounded">/book/{previewSlug}</code>
                                            </p>
                                            <p className="text-amber-600 mt-1">Make sure to update any links you've shared!</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="pt-2">
                            <button type="submit" disabled={saving}
                                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : tab === 'integrations' ? (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600">Connect email, SMS, and calendar services.</p>
                        <button onClick={() => setShowIntForm(!showIntForm)}
                            className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </button>
                    </div>

                    {showIntForm && (
                        <form onSubmit={handleCreateInt} className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <select value={intForm.type} onChange={(e) => setIntForm({ type: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm mr-2">
                                <option value="EMAIL">Email</option>
                                <option value="SMS">SMS</option>
                                <option value="CALENDAR">Calendar</option>
                            </select>
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Create</button>
                        </form>
                    )}

                    {integrations.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg border border-gray-200 text-gray-500 text-sm">
                            No integrations configured yet. Add one to enable email, SMS, or calendar sync.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {integrations.map(int => (
                                <div key={int.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${int.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {INTEGRATION_ICONS[int.type] || <Plug className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{int.type} Integration</p>
                                            <p className="text-xs text-gray-500">{int.isActive ? 'Active' : 'Disabled'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggleInt(int)} className="text-gray-500 hover:text-primary-600">
                                            {int.isActive ? <ToggleRight className="h-6 w-6 text-green-600" /> : <ToggleLeft className="h-6 w-6" />}
                                        </button>
                                        <button onClick={() => handleDeleteIntClick(int.id)} className="text-gray-400 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600">Automate actions based on events.</p>
                        <button onClick={() => setShowRuleForm(!showRuleForm)}
                            className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                            <Plus className="h-4 w-4 mr-1" /> Add Rule
                        </button>
                    </div>

                    {showRuleForm && (
                        <form onSubmit={handleCreateRule} className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-end gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">When</label>
                                <select value={ruleForm.eventType} onChange={(e) => setRuleForm(f => ({ ...f, eventType: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    {Object.entries(EVENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Then</label>
                                <select value={ruleForm.action} onChange={(e) => setRuleForm(f => ({ ...f, action: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Create</button>
                        </form>
                    )}

                    {rules.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg border border-gray-200 text-gray-500 text-sm">
                            No automation rules yet. Create one to automate workflows.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rules.map(rule => (
                                <div key={rule.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Zap className={`h-5 w-5 ${rule.isActive ? 'text-amber-500' : 'text-gray-300'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {EVENT_LABELS[rule.eventType] || rule.eventType} → {ACTION_LABELS[rule.action] || rule.action}
                                            </p>
                                            <p className="text-xs text-gray-500">{rule.isActive ? 'Active' : 'Disabled'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggleRule(rule)} className="text-gray-500 hover:text-primary-600">
                                            {rule.isActive ? <ToggleRight className="h-6 w-6 text-green-600" /> : <ToggleLeft className="h-6 w-6" />}
                                        </button>
                                        <button onClick={() => handleDeleteRuleClick(rule.id)} className="text-gray-400 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={deleteIntModalOpen}
                onClose={() => {
                    setDeleteIntModalOpen(false);
                    setIntToDelete(null);
                }}
                onConfirm={handleDeleteIntConfirm}
                title="Delete Integration"
                message="Are you sure you want to delete this integration? This action cannot be undone and may affect your ability to send emails or SMS."
                confirmText="Delete Integration"
                cancelText="Cancel"
                variant="danger"
                loading={deletingInt}
            />

            <ConfirmModal
                isOpen={deleteRuleModalOpen}
                onClose={() => {
                    setDeleteRuleModalOpen(false);
                    setRuleToDelete(null);
                }}
                onConfirm={handleDeleteRuleConfirm}
                title="Delete Automation Rule"
                message="Are you sure you want to delete this automation rule? This action cannot be undone and will stop this automation from running."
                confirmText="Delete Rule"
                cancelText="Cancel"
                variant="danger"
                loading={deletingRule}
            />
        </div>
    );
};

export default SettingsPage;
