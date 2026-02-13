import api from './api';

export interface DashboardAlert {
    type: string;
    message: string;
    severity: 'warning' | 'critical';
    link: string;
}

export interface DashboardStats {
    bookings: {
        total: number;
        today: number;
        upcoming: number;
        completed: number;
        noShow: number;
        pending: number;
        cancelled: number;
    };
    inventory: {
        totalItems: number;
        lowStock: number;
        criticalStock: number;
    };
    forms: {
        activeTemplates: number;
        monthlySubmissions: number;
        pending: number;
        overdue: number;
        completed: number;
    };
    contacts: {
        total: number;
        newThisMonth: number;
    };
    conversations: {
        total: number;
        unanswered: number;
        newThisWeek: number;
    };
    alerts: DashboardAlert[];
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get('/stats');
        return response.data;
    }
};
