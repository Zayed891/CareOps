export interface ServiceType {
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    duration: number; // minutes
    price: number | null;
    location: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Availability {
    id: string;
    serviceTypeId: string;
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    serviceType?: {
        id: string;
        name: string;
        workspaceId: string;
    };
}

export interface CreateAvailabilityIn {
    serviceTypeId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface Contact {
    id: string;
    workspaceId: string;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Booking {
    id: string;
    contactId: string;
    serviceTypeId: string;
    scheduledAt: string; // ISO Date
    status: BookingStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    contact?: Contact;
    serviceType?: ServiceType;
}

export interface CreateServiceTypeIn {
    name: string;
    description?: string;
    duration: number;
    price?: number;
    location?: string;
    isActive?: boolean;
}

export interface CreateBookingIn {
    contactId: string;
    serviceTypeId: string;
    scheduledAt: string;
    notes?: string;
}

export interface CreateContactIn {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
}
