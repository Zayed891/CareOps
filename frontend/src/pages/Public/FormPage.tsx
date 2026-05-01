import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, User, CheckCircle,
    AlertCircle, Loader, Send
} from 'lucide-react';
import { publicService } from '../../services/publicService';
import { toast } from '../../utils/toastEvent';
import Logo from '../../components/Logo';

interface FormField {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options: string[];
    order: number;
}

interface FormTemplate {
    id: string;
    title: string;
    description: string | null;
    fields: FormField[];
}

const PublicFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [template, setTemplate] = useState<FormTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [contactData, setContactData] = useState({ name: '', email: '', phone: '' });
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            if (!id) return;
            try {
                const data = await publicService.getForm(id);
                setTemplate(data);

                // Initialize form data
                const initialData: Record<string, any> = {};
                data.fields.forEach((field: FormField) => {
                    if (field.type === 'checkbox') initialData[field.id] = false;
                    else initialData[field.id] = '';
                });
                setFormData(initialData);
            } catch (err) {
                setError('Form not found or unavailable');
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [id]);

    const handleFieldChange = (fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setIsSubmitting(true);
        try {
            const payload = {
                ...contactData,
                message,
                data: formData
            };
            await publicService.submitForm(id, payload);
            setIsSuccess(true);
        } catch (err) {
            toast.error('Failed to submit form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-0 to-surface-1">
            <Loader className="animate-spin text-amber-400 h-8 w-8" />
        </div>
    );

    if (error || !template) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-0 to-surface-1 p-4">
            <div className="bg-surface-1 p-8 rounded-xl shadow-card max-w-md w-full text-center border border-white/[0.16]">
                <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
                <h2 className="text-lg font-semibold text-text-primary mb-2">Unavailable</h2>
                <p className="text-sm text-text-secondary">{error || 'This form does not exist.'}</p>
            </div>
        </div>
    );

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-0 to-surface-1 p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-surface-1 p-8 rounded-xl shadow-card max-w-md w-full text-center border border-white/[0.16]"
                >
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-7 w-7 text-success-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-text-primary mb-2">Thank You!</h2>
                    <p className="text-text-secondary text-sm mb-6">
                        Your submission has been received successfully.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary w-full py-2.5"
                    >
                        Submit Another
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-0 to-surface-1 py-6 px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl mx-auto w-full">
                <div className="mb-4 flex justify-center">
                    <Logo size="sm" />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-1 rounded-xl shadow-card overflow-hidden border border-white/[0.16]"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-6 text-surface-0 text-center">
                        <div className="bg-surface-1/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold mb-1">{template.title}</h1>
                        {template.description && (
                            <p className="text-sm text-amber-100 max-w-lg mx-auto">{template.description}</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Contact Info Section */}
                        <div className="bg-surface-0 p-4 rounded-lg border border-white/[0.16]">
                            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                                <User size={16} className="mr-2 text-amber-400" />
                                Contact Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="label">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={contactData.name}
                                        onChange={e => setContactData({ ...contactData, name: e.target.value })}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">Email <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            required
                                            className="input"
                                            value={contactData.email}
                                            onChange={e => setContactData({ ...contactData, email: e.target.value })}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Phone</label>
                                        <input
                                            type="tel"
                                            className="input"
                                            value={contactData.phone}
                                            onChange={e => setContactData({ ...contactData, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Message</label>
                                    <textarea
                                        className="input min-h-[80px] resize-none"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        placeholder="How can we help you?"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Fields Section */}
                        {template.fields.length > 0 && (
                            <div className="space-y-4">
                                {template.fields.map(field => (
                                    <div key={field.id} className="animate-fadeIn">
                                        <label className="label">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>

                                        {field.type === 'textarea' ? (
                                            <textarea
                                                required={field.required}
                                                className="input min-h-[80px]"
                                                value={formData[field.id]}
                                                onChange={e => handleFieldChange(field.id, e.target.value)}
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                required={field.required}
                                                className="input"
                                                value={formData[field.id]}
                                                onChange={e => handleFieldChange(field.id, e.target.value)}
                                            >
                                                <option value="">Select an option</option>
                                                {field.options?.map((opt, i) => (
                                                    <option key={i} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'checkbox' ? (
                                            <div className="flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    required={field.required}
                                                    className="h-4 w-4 text-amber-400 focus:ring-amber-500/40 border-white/[0.16] rounded"
                                                    checked={formData[field.id]}
                                                    onChange={e => handleFieldChange(field.id, e.target.checked)}
                                                />
                                                <span className="ml-2 text-sm text-text-secondary">Yes, confirm</span>
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type}
                                                required={field.required}
                                                className="input"
                                                value={formData[field.id]}
                                                onChange={e => handleFieldChange(field.id, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/[0.16]">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full btn-primary py-3 shadow-lg shadow-amber-500/20 flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        Submit Form
                                        <Send size={16} className="ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default PublicFormPage;
