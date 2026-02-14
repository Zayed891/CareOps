import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Briefcase, Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ServiceTypeList from './ServiceTypeList';
import BookingsList from './BookingsList';
import BookingForm from './BookingForm';
import BookingCalendar from './BookingCalendar';
import AvailabilityEditor from './AvailabilityEditor';

type TabType = 'schedule' | 'calendar' | 'services' | 'availability';

const BookingsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as TabType | null;
    const [activeTab, setActiveTab] = useState<TabType>(
        tabParam && ['schedule', 'calendar', 'services', 'availability'].includes(tabParam) ? tabParam : 'schedule'
    );

    useEffect(() => {
        if (tabParam && ['schedule', 'calendar', 'services', 'availability'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger to reload list after new booking

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="section-header">
                <div>
                    <h1 className="section-title">Bookings & Schedule</h1>
                    <p className="section-description">Manage appointments, service types, and availability</p>
                </div>
                {activeTab === 'schedule' && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="btn-primary flex items-center"
                    >
                        <Plus size={20} className="mr-2" />
                        New Booking
                    </button>
                )}
            </div>

            <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="-mb-px flex space-x-8 min-w-max px-2">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`${activeTab === 'schedule'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Calendar className="mr-2 h-5 w-5" />
                        List View
                    </button>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`${activeTab === 'calendar'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Calendar className="mr-2 h-5 w-5" />
                        Calendar View
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`${activeTab === 'services'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Briefcase className="mr-2 h-5 w-5" />
                        Service Types
                    </button>
                    <button
                        onClick={() => setActiveTab('availability')}
                        className={`${activeTab === 'availability'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Clock className="mr-2 h-5 w-5" />
                        Availability
                    </button>
                </nav>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'schedule' && <BookingsList key={refreshTrigger} />}
                {activeTab === 'calendar' && <BookingCalendar />}
                {activeTab === 'services' && <ServiceTypeList />}
                {activeTab === 'availability' && <AvailabilityEditor />}
            </div>

            <BookingForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
        </div>
    );
};

export default BookingsPage;
