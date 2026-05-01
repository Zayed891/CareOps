import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    ClipboardList,
    AlertTriangle,
    Package,
    Inbox,
    UserPlus,
    ArrowRight,
    MessageSquare,
    CheckCircle,
    Bell,
    FileWarning,
    AlertOctagon,
    ExternalLink,
    Copy,
    Link as LinkIcon,
} from 'lucide-react';
import { dashboardService, type DashboardStats, type DashboardAlert } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { workspace } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dashboardService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLink(label);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    if (loading || !stats) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    const cards = [
        {
            title: "Today's Appointments",
            value: stats.bookings.today,
            icon: Calendar,
            color: "text-blue-400",
            bg: "bg-blue-900/30",
            glowBorder: "hover:border-blue-500/20",
            change: `+${stats.bookings.upcoming} upcoming`,
            link: "/bookings"
        },
        {
            title: "Total Contacts",
            value: stats.contacts.total,
            icon: UserPlus,
            color: "text-indigo-400",
            bg: "bg-indigo-900/30",
            glowBorder: "hover:border-indigo-500/20",
            change: `+${stats.contacts.newThisMonth} this month`,
            link: "/contacts"
        },
        {
            title: "Conversations",
            value: stats.conversations.total,
            icon: Inbox,
            color: "text-emerald-400",
            bg: "bg-emerald-900/30",
            glowBorder: "hover:border-emerald-500/20",
            change: stats.conversations.unanswered > 0
                ? `${stats.conversations.unanswered} unanswered`
                : `${stats.conversations.newThisWeek} new this week`,
            link: "/inbox"
        },
        {
            title: "Low Stock Alerts",
            value: stats.inventory.lowStock,
            icon: AlertTriangle,
            color: "text-error-500",
            bg: "bg-error-50",
            glowBorder: "hover:border-error-500/20",
            change: stats.inventory.criticalStock > 0
                ? `${stats.inventory.criticalStock} out of stock!`
                : `${stats.inventory.totalItems} total items`,
            link: "/inventory"
        },
        {
            title: "Active Forms",
            value: stats.forms.activeTemplates,
            icon: ClipboardList,
            color: "text-purple-400",
            bg: "bg-purple-900/30",
            glowBorder: "hover:border-purple-500/20",
            change: stats.forms.overdue > 0
                ? `${stats.forms.overdue} overdue, ${stats.forms.pending} pending`
                : `${stats.forms.pending} pending`,
            link: "/forms"
        },
        {
            title: "Bookings Summary",
            value: stats.bookings.completed,
            icon: CheckCircle,
            color: "text-success-500",
            bg: "bg-success-50",
            glowBorder: "hover:border-success-500/20",
            change: `${stats.bookings.completed} completed, ${stats.bookings.noShow} no-show`,
            link: "/bookings"
        }
    ];

    const alertIcon = (alert: DashboardAlert) => {
        switch (alert.type) {
            case 'unanswered_messages': return <MessageSquare className="h-5 w-5" />;
            case 'unconfirmed_bookings': return <Calendar className="h-5 w-5" />;
            case 'overdue_forms': return <FileWarning className="h-5 w-5" />;
            case 'critical_inventory': return <AlertOctagon className="h-5 w-5" />;
            case 'low_inventory': return <Package className="h-5 w-5" />;
            case 'pending_forms': return <ClipboardList className="h-5 w-5" />;
            default: return <Bell className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="section-title font-display">Dashboard Overview</h1>
                <p className="section-description">Welcome back! Here's what's happening with your business today.</p>
            </div>

            {/* Alerts Section */}
            {stats.alerts.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider font-display">Needs Attention</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.alerts.map((alert, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(alert.link)}
                                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${alert.severity === 'critical'
                                        ? 'bg-error-50 border-error-500/20 hover:border-error-500/40'
                                        : 'bg-warning-50 border-warning-500/20 hover:border-warning-500/40'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-error-100/50 text-error-500' : 'bg-warning-100/50 text-warning-500'
                                    }`}>
                                    {alertIcon(alert)}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${alert.severity === 'critical' ? 'text-error-500' : 'text-warning-500'
                                        }`}>
                                        {alert.message}
                                    </p>
                                </div>
                                <ArrowRight className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-error-500/50' : 'text-warning-500/50'
                                    }`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(card.link)}
                        className={`bg-surface-1 rounded-xl border border-white/[0.06] p-6 flex items-start justify-between cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${card.glowBorder} group`}
                    >
                        <div>
                            <p className="text-sm font-medium text-text-muted mb-1">{card.title}</p>
                            <h3 className="text-2xl font-bold text-text-primary mb-1 font-display">{card.value}</h3>
                            <span className="text-xs text-text-muted">{card.change}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`p-3 rounded-lg ${card.bg}`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <ArrowRight className="h-4 w-4 text-text-muted/30 group-hover:text-text-secondary transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <div
                    className="card-hover"
                    onClick={() => navigate('/bookings')}
                >
                    <h3 className="font-semibold text-text-primary mb-4 flex items-center font-display">
                        <Calendar className="mr-2 h-5 w-5 text-text-muted" />
                        Today's Schedule
                        <ArrowRight className="ml-auto h-4 w-4 text-text-muted/30" />
                    </h3>
                    {stats.bookings.today === 0 ? (
                        <p className="text-text-muted text-sm">No appointments scheduled for today.</p>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-text-secondary">You have <strong className="text-text-primary">{stats.bookings.today}</strong> appointments today.</p>
                            {stats.bookings.pending > 0 && (
                                <p className="text-sm text-warning-500">{stats.bookings.pending} still unconfirmed.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Inventory Status */}
                <div
                    className="card-hover"
                    onClick={() => navigate('/inventory')}
                >
                    <h3 className="font-semibold text-text-primary mb-4 flex items-center font-display">
                        <Package className="mr-2 h-5 w-5 text-text-muted" />
                        Inventory Status
                        <ArrowRight className="ml-auto h-4 w-4 text-text-muted/30" />
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-secondary">Total Items</span>
                            <span className="font-medium text-text-primary">{stats.inventory.totalItems}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-secondary">Low Stock</span>
                            <span className={`font-medium ${stats.inventory.lowStock > 0 ? 'text-warning-500' : 'text-success-500'}`}>
                                {stats.inventory.lowStock}
                            </span>
                        </div>
                        {stats.inventory.criticalStock > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Out of Stock</span>
                                <span className="font-medium text-error-500">{stats.inventory.criticalStock}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer Access Links */}
            {workspace?.slug && (
                <div className="bg-gradient-to-br from-amber-900/20 to-surface-1 rounded-2xl border border-amber-500/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-text-primary mb-1 flex items-center font-display">
                                <LinkIcon className="mr-2 h-5 w-5 text-amber-400" />
                                Customer Access Links
                            </h3>
                            <p className="text-sm text-text-secondary">Share these links with your customers for easy booking and form submission</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Booking Link */}
                        <div className="bg-surface-1 rounded-xl p-5 border border-white/[0.06] hover:border-white/[0.10] transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-900/30 rounded-lg">
                                        <Calendar className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-text-primary font-display">Booking Page</h4>
                                        <p className="text-xs text-text-muted">Customer appointment booking</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-surface-2 rounded-lg p-3 flex items-center justify-between gap-2 mb-3">
                                <code className="text-xs text-text-secondary truncate flex-1 font-mono">
                                    {window.location.origin}/book/{workspace.slug}
                                </code>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyToClipboard(`${window.location.origin}/book/${workspace.slug}`, 'booking')}
                                    className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center"
                                >
                                    <Copy className="h-4 w-4 mr-1" />
                                    {copiedLink === 'booking' ? 'Copied!' : 'Copy'}
                                </button>
                                <button
                                    onClick={() => window.open(`/book/${workspace.slug}`, '_blank')}
                                    className="flex-1 btn-primary py-2 text-sm flex items-center justify-center"
                                >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Preview
                                </button>
                            </div>
                        </div>

                        {/* Form Links */}
                        <div className="bg-surface-1 rounded-xl p-5 border border-white/[0.06] hover:border-white/[0.10] transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-900/30 rounded-lg">
                                        <ClipboardList className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-text-primary font-display">Form Submissions</h4>
                                        <p className="text-xs text-text-muted">Customer form access</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-surface-2 rounded-lg p-3 mb-3">
                                <code className="text-xs text-text-secondary font-mono">
                                    {window.location.origin}/f/[form-id]
                                </code>
                            </div>
                            <button
                                onClick={() => navigate('/forms')}
                                className="w-full btn-secondary py-2 text-sm flex items-center justify-center"
                            >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                Manage Forms
                            </button>
                            <p className="text-xs text-text-muted mt-2">
                                Get individual form links from the Forms page
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-surface-2/50 rounded-lg border border-amber-500/10">
                        <p className="text-xs text-text-secondary">
                            <span className="font-medium text-amber-400">💡 Tip:</span> Copy these links and share them on your website, social media, or via email/SMS to let customers book appointments and submit forms directly!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
