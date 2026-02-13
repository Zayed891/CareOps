import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type CreateServiceTypeIn } from '../../types/booking';
import { bookingService } from '../../services/bookingService';

interface ServiceTypeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ServiceTypeForm: React.FC<ServiceTypeFormProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<CreateServiceTypeIn>({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        location: '',
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: '',
                description: '',
                duration: 30,
                price: 0,
                location: '',
                isActive: true
            });
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await bookingService.createServiceType(formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create service type');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Add Service Type</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="label">Service Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                placeholder="e.g. General Checkup"
                            />
                        </div>

                        <div>
                            <label className="label">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input h-20 resize-none"
                                placeholder="Optional description..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Duration (min)</label>
                                <input
                                    type="number"
                                    required
                                    min="5"
                                    step="5"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="label">Price</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    className="input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="input"
                                placeholder="e.g. Room 101"
                            />
                        </div>

                        <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Creating...' : 'Create Service'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ServiceTypeForm;
