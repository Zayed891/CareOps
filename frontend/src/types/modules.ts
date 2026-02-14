export interface Contact {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        bookings: number;
        conversations: number;
        formSubmissions: number;
    };
}

export interface Conversation {
    id: string;
    contactId: string;
    contact: Contact;
    createdAt: string;
    updatedAt: string;
    messages: Message[];
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string | null;
    sender?: { id: string; name: string; email: string } | null;
    content: string;
    channel: 'EMAIL' | 'SMS';
    direction: 'INBOUND' | 'OUTBOUND';
    createdAt: string;
    aiAnalysis?: {
        intent: string;
        sentiment: string;
        score: number;
        tags: string[];
    } | null;
    draftReply?: string | null;
}

export interface StaffMember {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    permissions: Permission | null;
}

export interface Permission {
    id: string;
    userId: string;
    canAccessInbox: boolean;
    canManageBookings: boolean;
    canViewForms: boolean;
    canViewInventory: boolean;
    canModifySettings: boolean;
}

export interface Integration {
    id: string;
    workspaceId: string;
    type: 'EMAIL' | 'SMS' | 'CALENDAR';
    config: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AutomationRule {
    id: string;
    workspaceId: string;
    eventType: string;
    action: string;
    config: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceStatus {
    workspace: {
        id: string;
        name: string;
        slug: string;
        isActive: boolean;
    };
    setup: Record<string, boolean>;
    counts: Record<string, number>;
}
