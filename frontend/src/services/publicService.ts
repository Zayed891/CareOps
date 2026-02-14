import axios from 'axios';

const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

const publicApi = axios.create({
    baseURL: `${API_URL}/public`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface PublicWorkspace {
    id: string;
    name: string;
    address: string | null;
    timezone: string;
    isActive: boolean;
    serviceTypes: {
        id: string;
        name: string;
        description: string | null;
        duration: number;
        price: number | null;
        location: string | null;
    }[];
}

export interface PublicBookingPayload {
    workspaceSlug: string;
    serviceTypeId: string;
    scheduledAt: string;
    name: string;
    email: string;
    phone: string;
}

export const publicService = {
    getBookingPage: async (slug: string) => {
        const response = await publicApi.get<PublicWorkspace>(`/booking-page/${slug}`);
        return response.data;
    },

    getAvailability: async (slug: string, serviceTypeId: string, date: string) => {
        const response = await publicApi.get<{ slots: string[]; duration: number }>(
            `/booking-page/${slug}/availability`,
            { params: { serviceTypeId, date } }
        );
        return response.data;
    },

    createBooking: async (data: PublicBookingPayload) => {
        const response = await publicApi.post('/bookings', data);
        return response.data;
    },

    getForm: async (id: string) => {
        const response = await publicApi.get(`/forms/${id}`);
        return response.data;
    },

    submitForm: async (id: string, data: any) => {
        const response = await publicApi.post(`/forms/${id}/submit`, data);
        return response.data;
    },

    submitContactForm: async (data: any) => {
        const response = await publicApi.post('/contact-form', data);
        return response.data;
    }
};
