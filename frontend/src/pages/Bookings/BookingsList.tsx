import React, { useState, useEffect } from 'react';
import { type Booking, type BookingStatus } from '../../types/booking';
import { bookingService } from '../../services/bookingService';
import { Search, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

import Pagination from '../../components/Pagination';
import SortControls, { type SortOption } from '../../components/SortControls';

const BookingsList: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, scheduled, completed, cancelled

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // Sorting state
    const [sortBy, setSortBy] = useState('scheduledAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const sortOptions: SortOption[] = [
        { label: 'Scheduled Date', value: 'scheduledAt' },
        { label: 'Created Date', value: 'createdAt' },
        { label: 'Status', value: 'status' }
    ];

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
                sortOrder: sortOrder,
                sortBy: sortBy,
                status: filter === 'all' ? undefined : filter.toUpperCase()
            };
            const response = await bookingService.getAllBookings(params);
            setBookings(response.data);
            setTotalPages(response.meta.totalPages);
            setTotalItems(response.meta.total);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filter, currentPage, sortBy, sortOrder]);

    const handleStatusUpdate = async (id: string, status: BookingStatus) => {
        try {
            await bookingService.updateBookingStatus(id, status);
            fetchBookings();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const StatusBadge = ({ status }: { status: BookingStatus }) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
            COMPLETED: 'bg-blue-100 text-blue-800',
            NO_SHOW: 'bg-gray-100 text-gray-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="text-center py-8">Loading bookings...</div>;

    return (
        <div className="space-y-4">
            <div className="flex space-x-2 border-b border-gray-200 pb-4">
                <button
                    onClick={() => { setFilter('upcoming'); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'upcoming' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => { setFilter('past'); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'past' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Past
                </button>
                <button
                    onClick={() => { setFilter('all'); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    All
                </button>
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No {filter} bookings found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <SortControls
                            options={sortOptions}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSortChange={(field, order) => {
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                        />
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            {/* Assuming a search input will be added here later */}
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                className="pl-10 pr-4 py-2 border rounded-md w-full text-sm"
                            />
                        </div>
                    </div>
                    {bookings.map((booking) => (
                        <div key={booking.id} className="card-hover flex flex-col sm:flex-row justify-between">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-3">
                                    <div className="text-lg font-semibold text-gray-900">
                                        {format(new Date(booking.scheduledAt), 'h:mm a')}
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        {format(new Date(booking.scheduledAt), 'MMM d, yyyy')}
                                    </div>
                                    <StatusBadge status={booking.status} />
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <User size={16} className="mr-2 text-gray-400" />
                                    <span className="font-medium">{booking.contact?.name || 'Unknown Contact'}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Clock size={16} className="mr-2 text-gray-400" />
                                    {booking.serviceType?.name || 'Service'} ({booking.serviceType?.duration} mins)
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                                {booking.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                            title="Confirm"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                            title="Cancel"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </>
                                )}
                                {booking.status === 'CONFIRMED' && (
                                    <button
                                        onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                        title="Record Complete"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default BookingsList;
