import React, { useState, useEffect } from 'react';
import { Plus, Clock, MapPin, Trash2, DollarSign } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { type ServiceType } from '../../types/booking';
import ServiceTypeForm from './ServiceTypeForm';
import ConfirmModal from '../../components/ConfirmModal';

const ServiceTypeList: React.FC = () => {
    const [services, setServices] = useState<ServiceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const data = await bookingService.getAllServiceTypes();
            setServices(data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleDeleteClick = (id: string) => {
        setServiceToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!serviceToDelete) return;
        try {
            setDeleting(true);
            await bookingService.deleteServiceType(serviceToDelete);
            fetchServices();
            setDeleteModalOpen(false);
            setServiceToDelete(null);
        } catch (error) {
            console.error('Failed to delete service type:', error);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="text-center py-8">Loading services...</div>;

    return (
        <div className="space-y-6">
            <div className="section-header">
                <div>
                    <h2 className="text-xl font-semibold text-text-primary">Service Types</h2>
                    <p className="section-description">Define the services you offer</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus size={18} className="mr-2" />
                    Add Service
                </button>
            </div>

            {services.length === 0 ? (
                <div className="text-center py-12 bg-surface-0 rounded-lg border-2 border-dashed border-white/[0.06]">
                    <p className="text-text-muted mb-2">No service types defined yet.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="text-amber-400 hover:text-amber-300 font-medium"
                    >
                        Create your first service type
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="card-hover relative group">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDeleteClick(service.id)}
                                    className="p-2 text-text-muted hover:text-error-500 transition-colors bg-surface-1 rounded-full shadow-md hover:shadow-lg"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <h3 className="font-semibold text-text-primary text-lg mb-1">{service.name}</h3>
                            {service.description && (
                                <p className="text-sm text-text-muted mb-4 line-clamp-2 min-h-[2.5em]">{service.description}</p>
                            )}

                            <div className="flex flex-col space-y-2 text-sm text-text-secondary border-t border-white/[0.04] pt-4 mt-2">
                                <div className="flex items-center">
                                    <Clock size={16} className="mr-2 text-text-muted" />
                                    <span>{service.duration} mins</span>
                                </div>
                                {service.location && (
                                    <div className="flex items-center">
                                        <MapPin size={16} className="mr-2 text-text-muted" />
                                        <span>{service.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center font-medium text-text-primary">
                                    <DollarSign size={16} className="mr-2 text-text-muted" />
                                    <span>{service.price ? service.price.toFixed(2) : 'Free'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ServiceTypeForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchServices}
            />

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setServiceToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Service Type"
                message="Are you sure you want to delete this service type? This action cannot be undone and will affect any associated bookings and availability schedules."
                confirmText="Delete Service"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
};

export default ServiceTypeList;

