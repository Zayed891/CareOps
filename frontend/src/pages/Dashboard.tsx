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
        return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
    }

    const cards = [
        {
            title: "Today's Appointments",
            value: stats.bookings.today,
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-50",
            hoverBg: "hover:bg-blue-50/70",
            change: `+${stats.bookings.upcoming} upcoming`,
            link: "/bookings"
        },
        {
            title: "Total Contacts",
            value: stats.contacts.total,
            icon: UserPlus,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            hoverBg: "hover:bg-indigo-50/70",
            change: `+${stats.contacts.newThisMonth} this month`,
            link: "/contacts"
        },
        {
            title: "Conversations",
            value: stats.conversations.total,
            icon: Inbox,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            hoverBg: "hover:bg-emerald-50/70",
            change: stats.conversations.unanswered > 0
                ? `${stats.conversations.unanswered} unanswered`
                : `${stats.conversations.newThisWeek} new this week`,
            link: "/inbox"
        },
        {
            title: "Low Stock Alerts",
            value: stats.inventory.lowStock,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50",
            hoverBg: "hover:bg-red-50/70",
            change: stats.inventory.criticalStock > 0
                ? `${stats.inventory.criticalStock} out of stock!`
                : `${stats.inventory.totalItems} total items`,
            link: "/inventory"
        },
        {
            title: "Active Forms",
            value: stats.forms.activeTemplates,
            icon: ClipboardList,
            color: "text-purple-600",
            bg: "bg-purple-50",
            hoverBg: "hover:bg-purple-50/70",
            change: stats.forms.overdue > 0
                ? `${stats.forms.overdue} overdue, ${stats.forms.pending} pending`
                : `${stats.forms.pending} pending`,
            link: "/forms"
        },
        {
            title: "Bookings Summary",
            value: stats.bookings.completed,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
            hoverBg: "hover:bg-green-50/70",
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
                <h1 className="section-title">Dashboard Overview</h1>
                <p className="section-description">Welcome back! Here's what's happening with your business today.</p>
            </div>

            {/* Alerts Section */}
            {stats.alerts.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Needs Attention</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.alerts.map((alert, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(alert.link)}
                                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${alert.severity === 'critical'
                                        ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
                                        : 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    {alertIcon(alert)}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${alert.severity === 'critical' ? 'text-red-800' : 'text-amber-800'
                                        }`}>
                                        {alert.message}
                                    </p>
                                </div>
                                <ArrowRight className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                                    }`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(card.link)}
                        className="bg-white rounded-xl shadow-card border border-gray-100 p-6 flex items-start justify-between cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-primary-200 group"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
                            <span className="text-xs text-gray-500">{card.change}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`p-3 rounded-lg ${card.bg}`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
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
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                        Today's Schedule
                        <ArrowRight className="ml-auto h-4 w-4 text-gray-300" />
                    </h3>
                    {stats.bookings.today === 0 ? (
                        <p className="text-gray-500 text-sm">No appointments scheduled for today.</p>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">You have <strong>{stats.bookings.today}</strong> appointments today.</p>
                            {stats.bookings.pending > 0 && (
                                <p className="text-sm text-amber-600">{stats.bookings.pending} still unconfirmed.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Inventory Status */}
                <div
                    className="card-hover"
                    onClick={() => navigate('/inventory')}
                >
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Package className="mr-2 h-5 w-5 text-gray-400" />
                        Inventory Status
                        <ArrowRight className="ml-auto h-4 w-4 text-gray-300" />
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Total Items</span>
                            <span className="font-medium">{stats.inventory.totalItems}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Low Stock</span>
                            <span className={`font-medium ${stats.inventory.lowStock > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                {stats.inventory.lowStock}
                            </span>
                        </div>
                        {stats.inventory.criticalStock > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Out of Stock</span>
                                <span className="font-medium text-red-600">{stats.inventory.criticalStock}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer Access Links */}
            {workspace?.slug && (
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl shadow-card border border-primary-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1 flex items-center">
                                <LinkIcon className="mr-2 h-5 w-5 text-primary-600" />
                                Customer Access Links
                            </h3>
                            <p className="text-sm text-gray-600">Share these links with your customers for easy booking and form submission</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Booking Link */}
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Booking Page</h4>
                                        <p className="text-xs text-gray-500">Customer appointment booking</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between gap-2 mb-3">
                                <code className="text-xs text-gray-700 truncate flex-1">
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
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <ClipboardList className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Form Submissions</h4>
                                        <p className="text-xs text-gray-500">Customer form access</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <code className="text-xs text-gray-700">
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
                            <p className="text-xs text-gray-500 mt-2">
                                Get individual form links from the Forms page
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-white/50 rounded-lg border border-primary-200">
                        <p className="text-xs text-gray-600">
                            <span className="font-medium">💡 Tip:</span> Copy these links and share them on your website, social media, or via email/SMS to let customers book appointments and submit forms directly!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
