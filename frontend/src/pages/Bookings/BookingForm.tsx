import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type ServiceType, type Contact } from '../../types/booking';
import { bookingService } from '../../services/bookingService';

interface BookingFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [availableContacts, setAvailableContacts] = useState<Contact[]>([]); // Filtered contacts

    // Form State
    const [selectedService, setSelectedService] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [contactSearch, setContactSearch] = useState('');
    const [selectedContact, setSelectedContact] = useState<string>('');
    const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
    const [isNewContact, setIsNewContact] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            // Reset state
            setStep(1);
            setSelectedService('');
            setSelectedDate('');
            setSelectedTime('');
            setSelectedContact('');
            setContactSearch('');
            setIsNewContact(false);
            setNewContact({ name: '', email: '', phone: '' });
            setError('');
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [services, contactsData] = await Promise.all([
                bookingService.getAllServiceTypes(),
                bookingService.getAllContacts()
            ]);
            setServiceTypes(services);
            setContacts(contactsData);
            setAvailableContacts(contactsData);
        } catch (err) {
            console.error('Failed to eliminate data', err);
            setError('Failed to load services or contacts');
        }
    };

    const handleContactSearch = (term: string) => {
        setContactSearch(term);
        if (!term) {
            setAvailableContacts(contacts);
        } else {
            const filtered = contacts.filter(c =>
                c.name.toLowerCase().includes(term.toLowerCase()) ||
                (c.email && c.email.toLowerCase().includes(term.toLowerCase()))
            );
            setAvailableContacts(filtered);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            let contactId = selectedContact;

            // Create contact if new
            if (isNewContact) {
                const contact = await bookingService.createContact(newContact);
                contactId = contact.id;
            }

            if (!contactId) throw new Error('Please select or create a contact');
            if (!selectedService) throw new Error('Please select a service');
            if (!selectedDate || !selectedTime) throw new Error('Please select date and time');

            const scheduledAt = new Date(`${selectedDate}T${selectedTime}`).toISOString();

            await bookingService.createBooking({
                contactId,
                serviceTypeId: selectedService,
                scheduledAt,
                notes: 'Created via CareOps Dashboard'
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || err.response?.data?.error || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-surface-00 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-surface-1 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.24]">
                        <h3 className="text-lg font-medium text-text-primary">New Booking</h3>
                        <button onClick={onClose} className="text-text-muted hover:text-text-muted">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-error-50 text-error-500 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Step 1: Select Service */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-text-primary">1. Select Service</h4>
                                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                                    {serviceTypes.map(service => (
                                        <div
                                            key={service.id}
                                            onClick={() => setSelectedService(service.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedService === service.id
                                                ? 'border-amber-500 bg-amber-900/30'
                                                : 'border-white/[0.24] hover:border-primary-200'
                                                }`}
                                        >
                                            <div className="font-medium text-text-primary">{service.name}</div>
                                            <div className="text-sm text-text-muted flex justify-between">
                                                <span>{service.duration} mins</span>
                                                <span>{service.price ? `$${service.price}` : 'Free'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        className="btn-primary"
                                        disabled={!selectedService}
                                        onClick={() => setStep(2)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Date & Time */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-text-primary">2. Date & Time</h4>
                                <div>
                                    <label className="label">Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">Time</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between pt-4">
                                    <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                                    <button
                                        className="btn-primary"
                                        disabled={!selectedDate || !selectedTime}
                                        onClick={() => setStep(3)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contact Details */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-text-primary">3. Client Details</h4>

                                {!isNewContact ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Search existing contacts..."
                                            className="input"
                                            value={contactSearch}
                                            onChange={(e) => handleContactSearch(e.target.value)}
                                        />
                                        <div className="max-h-40 overflow-y-auto border rounded-md divide-y">
                                            {availableContacts.map(contact => (
                                                <div
                                                    key={contact.id}
                                                    className={`p-2 cursor-pointer hover:bg-surface-0 ${selectedContact === contact.id ? 'bg-amber-900/30' : ''}`}
                                                    onClick={() => setSelectedContact(contact.id)}
                                                >
                                                    <div className="font-medium">{contact.name}</div>
                                                    <div className="text-xs text-text-muted">{contact.email}</div>
                                                </div>
                                            ))}
                                            {availableContacts.length === 0 && (
                                                <div className="p-2 text-sm text-text-muted text-center">No contacts found</div>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <span className="text-sm text-text-muted">or</span>
                                            <button
                                                className="ml-2 text-sm text-amber-400 font-medium"
                                                onClick={() => setIsNewContact(true)}
                                            >
                                                Create New Contact
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 bg-surface-0 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h5 className="text-sm font-medium">New Client</h5>
                                            <button
                                                className="text-xs text-amber-400"
                                                onClick={() => setIsNewContact(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="input"
                                            value={newContact.name}
                                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            className="input"
                                            value={newContact.email}
                                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            className="input"
                                            value={newContact.phone}
                                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-between pt-4">
                                    <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                                    <button
                                        className="btn-primary"
                                        disabled={loading || (!selectedContact && !isNewContact)}
                                        onClick={handleSubmit}
                                    >
                                        {loading ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingForm;
