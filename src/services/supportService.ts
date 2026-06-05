import api from './api';

export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    created_at: string;
    resolution_notes?: string;
    booking_id?: string;
    user?: {
        full_name: string;
        phone: string;
        role_name: string;
    };
}

export const getAllTickets = async (): Promise<SupportTicket[]> => {
    const response = await api.get('/support/all');
    return response.data;
};

export const getTicketDetail = async (ticketId: string): Promise<SupportTicket> => {
    const response = await api.get(`/support/${ticketId}`);
    return response.data;
};

export const updateTicket = async (ticketId: string, data: {
    status?: string;
    resolution_notes?: string;
}): Promise<SupportTicket> => {
    const response = await api.put(`/support/${ticketId}`, data);
    return response.data;
};
