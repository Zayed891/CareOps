import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    Package,
    LogOut,
    X,
    Users,
    Inbox,
    UserCog,
    Settings,
    Rocket
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/inbox', label: 'Inbox', icon: Inbox },
        { path: '/contacts', label: 'Contacts', icon: Users },
        { path: '/bookings', label: 'Bookings', icon: Calendar },
        { path: '/forms', label: 'Forms', icon: ClipboardList },
        { path: '/inventory', label: 'Inventory', icon: Package },
        { path: '/staff', label: 'Staff', icon: UserCog },
        { path: '/settings', label: 'Settings', icon: Settings },
        { path: '/onboarding', label: 'Setup', icon: Rocket },
    ];

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200 pointer-events-none'
                    }`}
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Sidebar component */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-1 border-r border-white/[0.24] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-white/[0.24]">
                    <NavLink 
                        to="/dashboard" 
                        onClick={() => setIsOpen(false)}
                        className="transition-transform hover:scale-105"
                    >
                        <Logo size="sm" />
                    </NavLink>
                    <button
                        className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100%-4rem)] justify-between">
                    <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                                    ${isActive
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                                        : 'text-text-secondary hover:bg-surface-1/[0.04] hover:text-text-primary border border-transparent'}
                                `}
                            >
                                <item.icon className="mr-3 h-[18px] w-[18px]" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-3 border-t border-white/[0.24]">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-text-muted rounded-lg hover:bg-error-50 hover:text-error-500 transition-all duration-200"
                        >
                            <LogOut className="mr-3 h-[18px] w-[18px]" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
