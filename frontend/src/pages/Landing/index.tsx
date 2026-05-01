import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users, Calendar, MessageSquare, Box, ClipboardList,
    ArrowRight, CheckCircle, Zap
} from 'lucide-react';
import Logo from '../../components/Logo';
import DashboardPreview from './DashboardPreview';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-surface-0 noise-overlay">
            {/* Header */}
            <header className="fixed w-full bg-surface-0/80 backdrop-blur-xl z-50 border-b border-white/[0.24]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="transition-transform hover:scale-105">
                        <Logo size="sm" />
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="text-text-secondary hover:text-text-primary font-medium text-sm transition-colors">
                            Login
                        </Link>
                        <Link to="/register" className="btn-primary flex items-center shadow-glow-amber hover:shadow-lg transition-all">
                            Get Started
                            <ArrowRight size={16} className="ml-1.5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-24 pb-24 lg:pt-36 lg:pb-32 overflow-hidden relative">
                {/* Gradient orbs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" />
                <div className="absolute top-40 right-1/4 w-80 h-80 bg-amber-600/3 rounded-full blur-3xl -z-10" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1.5 px-4 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold font-display tracking-wide uppercase mb-8 border border-amber-500/20">
                            For Service Businesses
                        </span>
                        <h1 className="text-5xl md:text-7xl font-semibold text-text-primary tracking-tighterer mb-8 leading-[1.1] font-display">
                            Run your entire business <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                                on autopilot
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-text-secondary mb-10 leading-relaxed">
                            The all-in-one CRM, scheduling, and automation platform designed to help you grow your service-based business without the busywork.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-surface-0 rounded-xl font-semibold font-display text-lg shadow-glow-amber hover:bg-amber-400 hover:scale-105 transition-all duration-200">
                                Start Free Trial
                            </Link>
                            <Link to="#features" className="w-full sm:w-auto px-8 py-4 bg-surface-2 text-text-primary border border-white/[0.16] rounded-xl font-semibold font-display text-lg hover:bg-surface-3 hover:border-white/[0.24] transition-all">
                                View Demo
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-text-muted flex items-center justify-center space-x-4">
                            <span className="flex items-center"><CheckCircle size={14} className="text-success-500 mr-1.5" /> No credit card required</span>
                            <span className="flex items-center"><CheckCircle size={14} className="text-success-500 mr-1.5" /> 14-day free trial</span>
                        </p>
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-16 relative mx-auto max-w-5xl"
                    >
                        <div className="rounded-2xl bg-surface-2 p-2 shadow-2xl border border-white/[0.24]">
                            <div className="rounded-xl bg-surface-0 overflow-hidden aspect-[16/9] relative group">
                                <DashboardPreview />
                                {/* Overlay gradient for depth */}
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-0/10 to-transparent pointer-events-none" />
                            </div>
                        </div>
                        {/* Glow effect behind preview */}
                        <div className="absolute -inset-4 bg-amber-500/5 rounded-3xl blur-3xl -z-10" />
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-surface-1/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-semibold text-text-primary sm:text-4xl mb-4 font-display tracking-tighterer">Everything you need to grow</h2>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto">Stop juggling multiple tools. CareOps brings everything together in one unified platform.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={Users}
                            color="bg-blue-900/30 text-blue-400"
                            title="Smart CRM"
                            desc="Manage contacts, track interactions, and keep detailed records of every client relationship."
                        />
                        <FeatureCard
                            icon={Calendar}
                            color="bg-purple-900/30 text-purple-400"
                            title="Seamless Booking"
                            desc="Share your booking link and let clients schedule appointments 24/7 based on your availability."
                        />
                        <FeatureCard
                            icon={MessageSquare}
                            color="bg-emerald-900/30 text-emerald-400"
                            title="Unified Inbox"
                            desc="Centralize emails and SMS in one place so you never miss a client inquiry."
                        />
                        <FeatureCard
                            icon={Zap}
                            color="bg-amber-900/30 text-amber-400"
                            title="Automation"
                            desc="Set up rules to automatically send follow-ups, reminders, and internal alerts."
                        />
                        <FeatureCard
                            icon={Box}
                            color="bg-rose-900/30 text-rose-400"
                            title="Inventory"
                            desc="Track stock levels, set low-stock alerts, and manage product usage effortlessly."
                        />
                        <FeatureCard
                            icon={ClipboardList}
                            color="bg-cyan-900/30 text-cyan-400"
                            title="Custom Forms"
                            desc="Build intake forms and surveys that clients can fill out online before their visit."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-surface-0 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl p-12 relative overflow-hidden shadow-2xl"
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-800/50 blur-3xl"></div>

                        <h2 className="text-3xl md:text-4xl font-semibold text-surface-0 mb-6 relative z-10 font-display tracking-tighterer">
                            Ready to streamline your business?
                        </h2>
                        <p className="text-amber-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                            Join thousands of service professionals who trust CareOps to manage their day-to-day operations.
                        </p>
                        <Link to="/register" className="inline-block px-10 py-5 bg-surface-0 text-amber-600 rounded-xl font-semibold font-display text-lg shadow-xl hover:bg-white hover:scale-105 transition-all duration-200 relative z-10">
                            Get Started for Free
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-surface-1/50 border-t border-white/[0.24] py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <Logo size="sm" />
                    </div>
                    <div className="text-sm text-text-muted">
                        © {new Date().getFullYear()} CareOps Inc. All rights reserved.
                    </div>
                    <div className="flex space-x-8 mt-6 md:mt-0 text-sm text-text-muted">
                        <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Helper Component for Features
const FeatureCard = ({ icon: Icon, title, desc, color }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-surface-1 p-8 rounded-2xl border border-white/[0.24] hover:border-white/[0.20] hover:bg-surface-2/60 transition-all duration-300 group"
    >
        <div className={`p-3 rounded-xl w-fit mb-6 ${color} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-3 font-display">{title}</h3>
        <p className="text-text-secondary leading-relaxed">{desc}</p>
    </motion.div>
);

export default LandingPage;
