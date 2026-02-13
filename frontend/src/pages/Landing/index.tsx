import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users, Calendar, MessageSquare, Box, ClipboardList,
    ArrowRight, CheckCircle, Zap
} from 'lucide-react';
import Logo from '../../components/Logo';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="transition-transform hover:scale-105">
                        <Logo size="sm" />
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
                            Login
                        </Link>
                        <Link to="/register" className="btn-primary flex items-center shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all">
                            Get Started
                            <ArrowRight size={16} className="ml-1.5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white -z-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-6">
                            For Service Businesses
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                            Run your entire business <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                                on autopilot
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
                            The all-in-one CRM, scheduling, and automation platform designed to help you grow your service-based business without the busywork.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:scale-105 transition-all duration-200">
                                Start Free Trial
                            </Link>
                            <Link to="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors">
                                View Demo
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-gray-500 flex items-center justify-center space-x-4">
                            <span className="flex items-center"><CheckCircle size={14} className="text-green-500 mr-1.5" /> No credit card required</span>
                            <span className="flex items-center"><CheckCircle size={14} className="text-green-500 mr-1.5" /> 14-day free trial</span>
                        </p>
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-16 relative mx-auto max-w-5xl"
                    >
                        <div className="rounded-2xl bg-gray-900 p-2 shadow-2xl ring-1 ring-gray-900/10">
                            <div className="rounded-xl bg-white overflow-hidden aspect-[16/9] relative">
                                {/* Placeholder for actual screenshot - using gradient for now */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-100">
                                    <div className="text-center">
                                        <div className="text-6xl font-bold text-gray-200 mb-4">Dashboard Preview</div>
                                        <div className="text-gray-400">Interactive CRM & Analytics Dashboard</div>
                                    </div>
                                    {/* Mock UI Elements */}
                                    <div className="absolute top-0 left-0 right-0 h-14 border-b border-gray-200 bg-white flex items-center px-4 space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="absolute left-0 top-14 bottom-0 w-64 border-r border-gray-200 bg-white hidden md:block"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Everything you need to grow</h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">Stop juggling multiple tools. CareOps brings everything together in one unified platform.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Users}
                            color="bg-blue-100 text-blue-600"
                            title="Smart CRM"
                            desc="Manage contacts, track interactions, and keep detailed records of every client relationship."
                        />
                        <FeatureCard
                            icon={Calendar}
                            color="bg-purple-100 text-purple-600"
                            title="Seamless Booking"
                            desc="Share your booking link and let clients schedule appointments 24/7 based on your availability."
                        />
                        <FeatureCard
                            icon={MessageSquare}
                            color="bg-green-100 text-green-600"
                            title="Unified Inbox"
                            desc="Centralize emails and SMS in one place so you never miss a client inquiry."
                        />
                        <FeatureCard
                            icon={Zap}
                            color="bg-amber-100 text-amber-600"
                            title="Automation"
                            desc="Set up rules to automatically send follow-ups, reminders, and internal alerts."
                        />
                        <FeatureCard
                            icon={Box}
                            color="bg-rose-100 text-rose-600"
                            title="Inventory"
                            desc="Track stock levels, set low-stock alerts, and manage product usage effortlessly."
                        />
                        <FeatureCard
                            icon={ClipboardList}
                            color="bg-cyan-100 text-cyan-600"
                            title="Custom Forms"
                            desc="Build intake forms and surveys that clients can fill out online before their visit."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-primary-600 rounded-3xl p-12 relative overflow-hidden shadow-2xl shadow-primary-500/30"
                    >
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/30 blur-3xl"></div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
                            Ready to streamline your business?
                        </h2>
                        <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                            Join thousands of service professionals who trust CareOps to manage their day-to-day operations.
                        </p>
                        <Link to="/register" className="inline-block px-10 py-5 bg-white text-primary-600 rounded-xl font-bold text-lg shadow-xl hover:bg-gray-50 hover:scale-105 transition-all duration-200 relative z-10">
                            Get Started for Free
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <Logo size="sm" />
                    </div>
                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} CareOps Inc. All rights reserved.
                    </div>
                    <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-500">
                        <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
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
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
    >
        <div className={`p-3 rounded-xl w-fit mb-6 ${color} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
);

export default LandingPage;
