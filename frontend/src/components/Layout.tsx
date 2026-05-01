import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from './Logo';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-surface-0 noise-overlay">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-surface-1 border-b border-white/[0.24]">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-text-muted hover:text-text-primary focus:outline-none p-2 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <Logo size="xs" />
                    <div className="w-10"></div> {/* Spacer for centering */}
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface-0 p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
