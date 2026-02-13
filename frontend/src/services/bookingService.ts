import api from './api';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import {
    type ServiceType,
    type CreateServiceTypeIn,
    type Booking,
    type CreateBookingIn,
    type Contact,
    type CreateContactIn,
    type Availability,
    type CreateAvailabilityIn
} from '../types/booking';

export const bookingService = {
    // Service Types
    getAllServiceTypes: async () => {
        const response = await api.get<{ data: ServiceType[] }>('/service-types');
        return response.data.data;
    },

    createServiceType: async (data: CreateServiceTypeIn) => {
        const response = await api.post<ServiceType>('/service-types', data);
        return response.data;
    },

    deleteServiceType: async (id: string) => {
        const response = await api.delete(`/service-types/${id}`);
        return response.data;
    },

    // ... (previous imports)

    // Bookings
    getAllBookings: async (params?: PaginationParams & { start?: string; end?: string; status?: string }) => {
        const response = await api.get<PaginatedResponse<Booking>>('/bookings', { params });
        return response.data;
    },

    createBooking: async (data: CreateBookingIn) => {
        const response = await api.post<Booking>('/bookings', data);
        return response.data;
    },

    updateBookingStatus: async (id: string, status: string) => {
        const response = await api.patch<Booking>(`/bookings/${id}/status`, { status });
        return response.data;
    },

    deleteBooking: async (id: string) => {
        const response = await api.delete(`/bookings/${id}`);
        return response.data;
    },

    // Contacts
    getAllContacts: async () => {
        const response = await api.get<{ data: Contact[]; meta: any }>('/contacts', { params: { limit: 100 } });
        return response.data.data;
    },

    createContact: async (data: CreateContactIn) => {
        const response = await api.post<Contact>('/contacts', data);
        return response.data;
    },

    // Availability
    getAvailability: async (serviceTypeId?: string) => {
        const params: any = {};
        if (serviceTypeId) params.serviceTypeId = serviceTypeId;
        const response = await api.get<Availability[]>('/availability', { params });
        return response.data;
    },

    createAvailability: async (data: CreateAvailabilityIn) => {
        const response = await api.post<Availability>('/availability', data);
        return response.data;
    },

    updateAvailability: async (id: string, data: Partial<CreateAvailabilityIn>) => {
        const response = await api.put<Availability>(`/availability/${id}`, data);
        return response.data;
    },

    deleteAvailability: async (id: string) => {
        const response = await api.delete(`/availability/${id}`);
        return response.data;
    }
};
