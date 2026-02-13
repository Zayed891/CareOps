import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, MapPin, User, Mail, Phone,
    ChevronLeft, CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import { publicService, type PublicWorkspace, type PublicBookingPayload } from '../../services/publicService';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { toast } from '../../utils/toastEvent';
import Logo from '../../components/Logo';

const PublicBookingPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [workspace, setWorkspace] = useState<PublicWorkspace | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Wizard State
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Availability state
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    useEffect(() => {
        const fetchWorkspace = async () => {
            if (!slug) return;
            try {
                const data = await publicService.getBookingPage(slug);
                setWorkspace(data);
            } catch (err) {
                setError('Workspace not found or inactive');
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspace();
    }, [slug]);

    // Fetch real availability when date + service are selected
    useEffect(() => {
        const fetchSlots = async () => {
            if (!slug || !selectedService || !selectedDate) return;
            setSlotsLoading(true);
            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const data = await publicService.getAvailability(slug, selectedService, dateStr);
                setAvailableSlots(data.slots);
            } catch {
                // Fallback to default slots if availability API fails
                setAvailableSlots(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']);
            } finally {
                setSlotsLoading(false);
            }
        };
        fetchSlots();
    }, [slug, selectedService, selectedDate]);

    const handleServiceSelect = (serviceId: string) => {
        setSelectedService(serviceId);
        setStep(2);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset time when date changes
        setStep(3);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep(4);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!slug || !selectedService || !selectedDate || !selectedTime) return;

        setIsSubmitting(true);
        try {
            // Combine date and time into ISO string
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const scheduledAt = new Date(selectedDate);
            scheduledAt.setHours(hours, minutes, 0, 0);

            const payload: PublicBookingPayload = {
                workspaceSlug: slug,
                serviceTypeId: selectedService,
                scheduledAt: scheduledAt.toISOString(),
                ...formData
            };

            await publicService.createBooking(payload);
            setIsSuccess(true);
        } catch (err) {
            toast.error('Failed to create booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Loader className="animate-spin text-primary-600 h-8 w-8" />
        </div>
    );

    if (error || !workspace) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-card max-w-md w-full text-center border border-gray-100">
                <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
                <h2 className="text-lg font-bold text-gray-900 mb-2">Unavailable</h2>
                <p className="text-sm text-gray-600">{error || 'This booking page does not exist.'}</p>
            </div>
        </div>
    );

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-xl shadow-card max-w-md w-full text-center border border-gray-100"
                >
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-7 w-7 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Thanks {formData.name}, your appointment has been scheduled. We've sent a confirmation to {formData.email}.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary w-full py-2.5"
                    >
                        Book Another
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentService = workspace.serviceTypes.find(s => s.id === selectedService);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6 animate-fadeIn">
                    <div className="flex justify-center mb-3">
                        <Logo size="sm" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{workspace.name}</h1>
                    <p className="text-sm text-gray-600 mb-2">Book an appointment</p>
                    {workspace.address && (
                        <p className="text-xs text-gray-500 flex items-center justify-center">
                            <MapPin size={14} className="mr-1" /> {workspace.address}
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-card overflow-hidden min-h-[450px] flex flex-col border border-gray-100">
                    {/* Progress Bar */}
                    <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => step > 1 && setStep(step - 1)}
                            disabled={step === 1}
                            className={`flex items-center text-sm font-medium transition-colors ${step > 1 ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                            <ChevronLeft size={16} className="mr-1" /> Back
                        </button>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${s <= step ? 'bg-primary-500' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                        <div className="w-12" /> {/* Spacer for centering */}
                    </div>

                    <div className="p-5 md:p-6 flex-1">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">Select a Service</h2>
                                    <div className="grid gap-3">
                                        {workspace.serviceTypes.map(service => (
                                            <button
                                                key={service.id}
                                                onClick={() => handleServiceSelect(service.id)}
                                                className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-semibold text-sm text-gray-900 group-hover:text-primary-700">{service.name}</h3>
                                                    <span className="text-xs font-medium text-gray-500">{service.duration} mins</span>
                                                </div>
                                                {service.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                                                )}
                                                {service.price != null && service.price > 0 && (
                                                    <div className="mt-1.5 text-xs font-medium text-gray-900">
                                                        ${service.price}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">Select a Date</h2>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {Array.from({ length: 14 }).map((_, i) => {
                                            const date = addDays(startOfToday(), i);
                                            const isSelected = selectedDate && isSameDay(date, selectedDate);
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleDateSelect(date)}
                                                    className={`p-2 rounded-lg border text-center transition-all
                                                        ${isSelected
                                                            ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                                            : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                                        }
                                                    `}
                                                >
                                                    <div className={`text-xs font-medium uppercase mb-0.5 ${isSelected ? 'text-primary-100' : 'text-gray-500'}`}>
                                                        {format(date, 'EEE')}
                                                    </div>
                                                    <div className={`text-base font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                        {format(date, 'd')}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-lg font-bold text-gray-900 mb-3">Select a Time</h2>
                                    <p className="text-gray-600 mb-3 text-xs">
                                        Available slots for {selectedDate && format(selectedDate, 'EEEE, MMMM d')}
                                    </p>
                                    {slotsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader className="animate-spin text-primary-600 h-6 w-6" />
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="text-center py-6 text-gray-500">
                                            <p className="text-sm">No available slots for this date.</p>
                                            <button onClick={() => setStep(2)} className="mt-2 text-primary-600 text-sm font-medium hover:underline">
                                                Try a different date
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {availableSlots.map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => handleTimeSelect(time)}
                                                    className="py-2 px-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 text-gray-700 font-medium text-sm transition-all"
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">Your Details</h2>

                                    <div className="bg-gray-50 p-3 rounded-lg mb-4 flex items-start space-x-3 border border-gray-100">
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            <Calendar className="text-primary-600 h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm">{currentService?.name}</h3>
                                            <p className="text-xs text-gray-600">
                                                {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                                            </p>
                                            <p className="text-xs text-gray-500">{currentService?.duration} mins</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <div>
                                            <label className="label">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    className="input pl-10"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="email"
                                                    required
                                                    className="input pl-10"
                                                    placeholder="john@example.com"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="tel"
                                                    required
                                                    className="input pl-10"
                                                    placeholder="+1 (555) 000-0000"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full btn-primary py-2.5 mt-4 shadow-lg shadow-primary-500/20"
                                        >
                                            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicBookingPage;
