import React, { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { type Booking, type BookingStatus } from '../../types/booking';

const BookingCalendar: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    // Removed unused loading state if not used in render, or I should use it.
    // The previous code had loading state but didn't use it in the return JSX (no loading spinner).
    // I will remove it for now to fix the lint.


    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            // Get all bookings for the calendar (limit 1000 for now)
            const response = await bookingService.getAllBookings({ limit: 1000 });
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    };

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };




    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthStart = startOfMonth(currentMonth);

    const calendarDays = eachDayOfInterval({
        start: startOfWeek(monthStart),
        end: endOfWeek(endOfMonth(monthStart))
    });

    return (
        <div className="bg-surface-1 rounded-lg shadow border border-white/[0.24] flex flex-col h-[calc(100vh-12rem)]">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.24]">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-text-primary">
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <div className="flex space-x-1">
                        <button onClick={prevMonth} className="p-1 rounded hover:bg-surface-2">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextMonth} className="p-1 rounded hover:bg-surface-2">
                            <ChevronRight size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(new Date())}
                            className="ml-2 px-3 py-1 text-sm bg-surface-2 hover:bg-surface-3 rounded text-text-secondary"
                        >
                            Today
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="min-w-[800px] h-full flex flex-col">
                    <div className="grid grid-cols-7 border-b border-white/[0.24] bg-surface-0 flex-shrink-0">
                        {daysOfWeek.map(dayName => (
                            <div key={dayName} className="py-2 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
                                {dayName}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6">
                        {calendarDays.map((day) => {
                            const dayBookings = bookings.filter(b => isSameDay(parseISO(b.scheduledAt), day));

                            return (
                                <div
                                    key={day.toString()}
                                    className={`
                                        min-h-[80px] border-b border-r border-white/[0.16] p-2 relative group transition-colors hover:bg-surface-0
                                        ${!isSameMonth(day, monthStart) ? "bg-surface-0/50 text-text-muted" : "bg-surface-1"}
                                        ${isToday(day) ? "bg-blue-50/30" : ""}
                                    `}
                                >
                                    <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-blue-600" : "text-text-secondary"}`}>
                                        {format(day, "d")}
                                    </div>

                                    <div className="space-y-1">
                                        {dayBookings.map(booking => (
                                            <div
                                                key={booking.id}
                                                className={`text-xs px-1.5 py-0.5 rounded truncate ${getStatusColor(booking.status)}`}
                                                title={`${booking.serviceType?.name} with ${booking.contact?.name}`}
                                            >
                                                <span className="font-semibold mr-1">{format(parseISO(booking.scheduledAt), 'h:mm a')}</span>
                                                {booking.contact?.name?.split(' ')[0]}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const getStatusColor = (status: BookingStatus) => {
    switch (status) {
        case 'CONFIRMED': return 'bg-green-100 text-green-800 border-success-500/20';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'COMPLETED': return 'bg-blue-900/30 text-blue-400 border-blue-200';
        case 'CANCELLED':
        case 'NO_SHOW': return 'bg-surface-2 text-text-secondary border-white/[0.24] line-through opacity-75';
        default: return 'bg-surface-2 text-text-primary';
    }
};

export default BookingCalendar;
