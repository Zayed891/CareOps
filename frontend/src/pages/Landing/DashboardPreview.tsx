

import {
    LayoutDashboard, MessageSquare, Users, Calendar,
    ClipboardList, Box, User, Settings, Rocket,
    MoreHorizontal, CheckCircle, AlertTriangle
} from 'lucide-react';
import Logo from '../../components/Logo';

const DashboardPreview = () => {
    return (
        <div className="flex h-full bg-gray-50 font-sans text-xs sm:text-sm overflow-hidden rounded-xl border border-gray-200 text-left">
            {/* Sidebar */}
            <div className="w-48 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 hidden md:flex">
                <div className="p-4 flex items-center gap-2 border-b border-gray-100">
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
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
                {/* Header usually here, skipping for density or keeping simple */}
                <div className="p-6 md:p-8 overflow-y-auto">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
                        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your business today.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <StatCard
                            title="Today's Appointments"
                            value="0"
                            sub="+1 upcoming"
                            icon={Calendar}
                            iconColor="text-blue-600"
                            bg="bg-blue-50"
                        />
                        <StatCard
                            title="Total Contacts"
                            value="1"
                            sub="+1 this month"
                            icon={Users}
                            iconColor="text-indigo-600"
                            bg="bg-indigo-50"
                        />
                        <StatCard
                            title="Conversations"
                            value="1"
                            sub="1 new this week"
                            icon={MessageSquare}
                            iconColor="text-green-600"
                            bg="bg-green-50"
                        />
                        <StatCard
                            title="Low Stock Alerts"
                            value="0"
                            sub="1 total items"
                            icon={AlertTriangle}
                            iconColor="text-red-600"
                            bg="bg-red-50"
                        />
                        <StatCard
                            title="Active Forms"
                            value="1"
                            sub="0 pending"
                            icon={ClipboardList}
                            iconColor="text-purple-600"
                            bg="bg-purple-50"
                        />
                        <StatCard
                            title="Bookings Summary"
                            value="0"
                            sub="0 completed, 0 no-show"
                            icon={CheckCircle}
                            iconColor="text-emerald-600"
                            bg="bg-emerald-50"
                        />
                    </div>

                    {/* Bottom Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Schedule */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-400" />
                                    Today's Schedule
                                </h3>
                                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18} /></button>
                            </div>
                            <div className="text-gray-500 text-sm py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No appointments scheduled for today.
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Box size={18} className="text-gray-400" />
                                    Inventory Status
                                </h3>
                                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18} /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                    <span className="text-gray-600">Total Items</span>
                                    <span className="font-semibold text-gray-900">1</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Low Stock</span>
                                    <span className="font-semibold text-green-600">0</span>
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
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-default ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
        <Icon size={18} />
        <span>{label}</span>
    </div>
);

const StatCard = ({ title, value, sub, icon: Icon, iconColor, bg }: any) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
            <span className="text-gray-500 font-medium text-xs uppercase tracking-wide">{title}</span>
            <div className={`p-2 rounded-lg ${bg} ${iconColor}`}>
                <Icon size={18} />
            </div>
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-gray-400 text-xs mt-1">{sub}</div>
        </div>
    </div>
);

export default DashboardPreview;
