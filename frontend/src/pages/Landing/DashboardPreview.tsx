


import {
    LayoutDashboard, MessageSquare, Users, Calendar,
    ClipboardList, Box, User, Settings, Rocket,
    MoreHorizontal, CheckCircle, AlertTriangle
} from 'lucide-react';
import Logo from '../../components/Logo';

const DashboardPreview = () => {
    return (
        <div className="flex h-full bg-surface-0 font-sans text-xs sm:text-sm overflow-hidden rounded-xl border border-white/[0.06] text-left">
            {/* Sidebar */}
            <div className="w-48 bg-surface-1 border-r border-white/[0.06] flex flex-col flex-shrink-0 hidden md:flex">
                <div className="p-4 flex items-center gap-2 border-b border-white/[0.04]">
                    <Logo size="sm" />
                </div>
                <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
                    <NavItem icon={LayoutDashboard} label="Dashboard" active />
                    <NavItem icon={MessageSquare} label="Inbox" />
                    <NavItem icon={Users} label="Contacts" />
                    <NavItem icon={Calendar} label="Bookings" />
                    <NavItem icon={ClipboardList} label="Forms" />
                    <NavItem icon={Box} label="Inventory" />
                    <NavItem icon={User} label="Staff" />
                    <NavItem icon={Settings} label="Settings" />
                    <NavItem icon={Rocket} label="Setup" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-surface-0">
                <div className="p-6 md:p-8 overflow-y-auto">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-text-primary font-display">Dashboard Overview</h2>
                        <p className="text-text-secondary mt-1">Welcome back! Here's what's happening with your business today.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <StatCard
                            title="Today's Appointments"
                            value="0"
                            sub="+1 upcoming"
                            icon={Calendar}
                            iconColor="text-blue-400"
                            bg="bg-blue-900/30"
                        />
                        <StatCard
                            title="Total Contacts"
                            value="1"
                            sub="+1 this month"
                            icon={Users}
                            iconColor="text-indigo-400"
                            bg="bg-indigo-900/30"
                        />
                        <StatCard
                            title="Conversations"
                            value="1"
                            sub="1 new this week"
                            icon={MessageSquare}
                            iconColor="text-emerald-400"
                            bg="bg-emerald-900/30"
                        />
                        <StatCard
                            title="Low Stock Alerts"
                            value="0"
                            sub="1 total items"
                            icon={AlertTriangle}
                            iconColor="text-error-500"
                            bg="bg-error-50"
                        />
                        <StatCard
                            title="Active Forms"
                            value="1"
                            sub="0 pending"
                            icon={ClipboardList}
                            iconColor="text-purple-400"
                            bg="bg-purple-900/30"
                        />
                        <StatCard
                            title="Bookings Summary"
                            value="0"
                            sub="0 completed, 0 no-show"
                            icon={CheckCircle}
                            iconColor="text-success-500"
                            bg="bg-success-50"
                        />
                    </div>

                    {/* Bottom Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Schedule */}
                        <div className="bg-surface-1 p-6 rounded-xl border border-white/[0.06]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-text-primary flex items-center gap-2 font-display">
                                    <Calendar size={18} className="text-text-muted" />
                                    Today's Schedule
                                </h3>
                                <button className="text-text-muted hover:text-text-secondary"><MoreHorizontal size={18} /></button>
                            </div>
                            <div className="text-text-muted text-sm py-8 text-center bg-surface-2/50 rounded-lg border border-dashed border-white/[0.06]">
                                No appointments scheduled for today.
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="bg-surface-1 p-6 rounded-xl border border-white/[0.06]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-text-primary flex items-center gap-2 font-display">
                                    <Box size={18} className="text-text-muted" />
                                    Inventory Status
                                </h3>
                                <button className="text-text-muted hover:text-text-secondary"><MoreHorizontal size={18} /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                                    <span className="text-text-secondary">Total Items</span>
                                    <span className="font-semibold text-text-primary">1</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary">Low Stock</span>
                                    <span className="font-semibold text-success-500">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NavItem = ({ icon: Icon, label, active = false }: any) => (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-default ${active ? 'bg-amber-500/10 text-amber-400 font-medium border border-amber-500/15' : 'text-text-secondary hover:bg-white/[0.04]'}`}>
        <Icon size={18} />
        <span>{label}</span>
    </div>
);

const StatCard = ({ title, value, sub, icon: Icon, iconColor, bg }: any) => (
    <div className="bg-surface-1 p-5 rounded-xl border border-white/[0.06] flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
            <span className="text-text-muted font-medium text-xs uppercase tracking-wide font-display">{title}</span>
            <div className={`p-2 rounded-lg ${bg} ${iconColor}`}>
                <Icon size={18} />
            </div>
        </div>
        <div>
            <div className="text-2xl font-bold text-text-primary font-display">{value}</div>
            <div className="text-text-muted text-xs mt-1">{sub}</div>
        </div>
    </div>
);

export default DashboardPreview;
