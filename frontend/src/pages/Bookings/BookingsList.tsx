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
            COMPLETED: 'bg-blue-900/30 text-blue-400',
            NO_SHOW: 'bg-surface-2 text-text-primary'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-surface-2'}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="text-center py-8">Loading bookings...</div>;

    return (
        <div className="space-y-4">
            <div className="flex space-x-2 border-b border-white/[0.24] pb-4">
                <button
                    onClick={() => { setFilter('upcoming'); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'upcoming' ? 'bg-amber-900/20 text-amber-300' : 'text-text-muted hover:text-text-secondary'}`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => { setFilter('past'); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'past' ? 'bg-amber-900/20 text-amber-300' : 'text-text-muted hover:text-text-secondary'}`}
                >
                    Past
                </button>
                <button
                    onClick={() => { setFilter('all'); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-amber-900/20 text-amber-300' : 'text-text-muted hover:text-text-secondary'}`}
                >
                    All
                </button>
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-surface-0 rounded-lg">
                    <p className="text-text-muted">No {filter} bookings found.</p>
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
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
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
                                    <div className="text-lg font-semibold text-text-primary">
                                        {format(new Date(booking.scheduledAt), 'h:mm a')}
                                    </div>
                                    <div className="text-text-muted text-sm">
                                        {format(new Date(booking.scheduledAt), 'MMM d, yyyy')}
                                    </div>
                                    <StatusBadge status={booking.status} />
                                </div>
                                <div className="flex items-center text-text-secondary">
                                    <User size={16} className="mr-2 text-text-muted" />
                                    <span className="font-medium">{booking.contact?.name || 'Unknown Contact'}</span>
                                </div>
                                <div className="flex items-center text-text-secondary text-sm">
                                    <Clock size={16} className="mr-2 text-text-muted" />
                                    {booking.serviceType?.name || 'Service'} ({booking.serviceType?.duration} mins)
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-white/[0.16]">
                                {booking.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                                            className="p-2 text-success-500 hover:bg-success-50 rounded-full"
                                            title="Confirm"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                                            className="p-2 text-error-500 hover:bg-error-50 rounded-full"
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
