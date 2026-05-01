import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, AlertCircle, Check, Loader2 } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import type { Availability, ServiceType, CreateAvailabilityIn } from '../../types/booking';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' },
];

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
        TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
}

function formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const AvailabilityEditor: React.FC = () => {
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [selectedServiceType, setSelectedServiceType] = useState<string>('');
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // New slot form state
    const [newSlotDay, setNewSlotDay] = useState<number>(1); // Monday
    const [newSlotStart, setNewSlotStart] = useState<string>('09:00');
    const [newSlotEnd, setNewSlotEnd] = useState<string>('17:00');
    const [showAddForm, setShowAddForm] = useState(false);

    // Load service types
    useEffect(() => {
        const load = async () => {
            try {
                const types = await bookingService.getAllServiceTypes();
                setServiceTypes(types);
                if (types.length > 0) {
                    setSelectedServiceType(types[0].id);
                }
            } catch (err) {
                setError('Failed to load service types');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Load availability when service type changes
    useEffect(() => {
        if (!selectedServiceType) return;
        const load = async () => {
            setLoading(true);
            try {
                const data = await bookingService.getAvailability(selectedServiceType);
                setAvailabilities(data);
            } catch (err) {
                setError('Failed to load availability');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selectedServiceType]);

    const handleAddSlot = async () => {
        if (!selectedServiceType) return;
        if (newSlotStart >= newSlotEnd) {
            setError('End time must be after start time');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const data: CreateAvailabilityIn = {
                serviceTypeId: selectedServiceType,
                dayOfWeek: newSlotDay,
                startTime: newSlotStart,
                endTime: newSlotEnd,
            };
            const created = await bookingService.createAvailability(data);
            setAvailabilities(prev => [...prev, created]);
            setShowAddForm(false);
            setSuccess('Availability slot added!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add availability slot');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSlot = async (id: string) => {
        setSaving(true);
        setError(null);
        try {
            await bookingService.deleteAvailability(id);
            setAvailabilities(prev => prev.filter(a => a.id !== id));
            setSuccess('Slot removed');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete slot');
        } finally {
            setSaving(false);
        }
    };

    // Group availabilities by day
    const slotsByDay = DAYS_OF_WEEK.map(day => ({
        ...day,
        slots: availabilities
            .filter(a => a.dayOfWeek === day.value)
            .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));

    const hasAnySlots = availabilities.length > 0;

    if (loading && serviceTypes.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500 mr-2" />
                <span className="text-text-muted">Loading...</span>
            </div>
        );
    }

    if (serviceTypes.length === 0) {
        return (
            <div className="text-center py-12 bg-surface-1 rounded-lg border border-white/[0.24]">
                <AlertCircle className="mx-auto h-12 w-12 text-amber-400" />
                <h3 className="mt-4 text-lg font-medium text-text-primary">No Service Types</h3>
                <p className="mt-2 text-text-muted">
                    You need to create at least one service type before setting availability.
                </p>
                <p className="mt-1 text-sm text-text-muted">
                    Go to the "Service Types" tab to create one.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-surface-1 rounded-lg border border-white/[0.24] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Weekly Availability</h2>
                        <p className="text-sm text-text-muted">
                            Set the hours you're available for each service type. Customers will only
                            be able to book during these times.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-text-secondary whitespace-nowrap">
                            Service Type:
                        </label>
                        <select
                            value={selectedServiceType}
                            onChange={(e) => setSelectedServiceType(e.target.value)}
                            className="input-field min-w-[200px]"
                        >
                            {serviceTypes.map(st => (
                                <option key={st.id} value={st.id}>{st.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Success / Error messages */}
            {error && (
                <div className="bg-error-50 text-error-500 p-3 rounded-lg flex items-center text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-error-500">&times;</button>
                </div>
            )}
            {success && (
                <div className="bg-success-50 text-success-500 p-3 rounded-lg flex items-center text-sm">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    {success}
                </div>
            )}

            {/* Add Slot Button / Form */}
            {!showAddForm ? (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus size={18} className="mr-2" />
                    Add Time Slot
                </button>
            ) : (
                <div className="bg-surface-1 rounded-lg border border-primary-200 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">Add Availability Slot</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Day</label>
                            <select
                                value={newSlotDay}
                                onChange={(e) => setNewSlotDay(Number(e.target.value))}
                                className="input-field w-full"
                            >
                                {DAYS_OF_WEEK.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Start Time</label>
                            <select
                                value={newSlotStart}
                                onChange={(e) => setNewSlotStart(e.target.value)}
                                className="input-field w-full"
                            >
                                {TIME_OPTIONS.map(t => (
                                    <option key={t} value={t}>{formatTime(t)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">End Time</label>
                            <select
                                value={newSlotEnd}
                                onChange={(e) => setNewSlotEnd(e.target.value)}
                                className="input-field w-full"
                            >
                                {TIME_OPTIONS.map(t => (
                                    <option key={t} value={t}>{formatTime(t)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddSlot}
                                disabled={saving}
                                className="btn-primary flex items-center text-sm"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                ) : (
                                    <Check className="w-4 h-4 mr-1" />
                                )}
                                Save
                            </button>
                            <button
                                onClick={() => { setShowAddForm(false); setError(null); }}
                                className="btn-secondary text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Weekly Schedule Grid */}
            <div className="bg-surface-1 rounded-lg border border-white/[0.24] overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-primary-500 mr-2" />
                        <span className="text-text-muted text-sm">Loading availability...</span>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {slotsByDay.map(day => (
                            <div key={day.value} className="flex items-start">
                                <div className={`w-28 sm:w-36 flex-shrink-0 py-4 px-4 text-sm font-medium ${
                                    day.slots.length > 0 ? 'text-text-primary bg-amber-900/30/50' : 'text-text-muted bg-surface-0'
                                }`}>
                                    <span className="hidden sm:inline">{day.label}</span>
                                    <span className="sm:hidden">{day.short}</span>
                                </div>
                                <div className="flex-1 py-3 px-4 min-h-[52px]">
                                    {day.slots.length === 0 ? (
                                        <span className="text-sm text-text-muted italic">Unavailable</span>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {day.slots.map(slot => (
                                                <div
                                                    key={slot.id}
                                                    className="inline-flex items-center bg-amber-900/30 text-amber-300 rounded-full px-3 py-1.5 text-sm border border-primary-200 group"
                                                >
                                                    <Clock className="w-3.5 h-3.5 mr-1.5 text-primary-400" />
                                                    <span className="font-medium">
                                                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteSlot(slot.id)}
                                                        disabled={saving}
                                                        className="ml-2 text-primary-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Remove slot"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary / Help */}
            {!loading && (
                <div className={`rounded-lg p-4 text-sm ${hasAnySlots ? 'bg-success-50 text-success-500' : 'bg-amber-50 text-amber-700'}`}>
                    {hasAnySlots ? (
                        <div className="flex items-center">
                            <Check className="w-4 h-4 mr-2" />
                            <span>
                                <strong>{availabilities.length}</strong> availability slot{availabilities.length !== 1 ? 's' : ''} configured
                                for <strong>{serviceTypes.find(s => s.id === selectedServiceType)?.name}</strong>.
                                Customers can book during these times on your public booking page.
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span>
                                No availability set for <strong>{serviceTypes.find(s => s.id === selectedServiceType)?.name}</strong>.
                                Add at least one time slot so customers can book appointments.
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AvailabilityEditor;
