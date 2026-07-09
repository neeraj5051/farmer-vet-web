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

export const getBookingContext = async (bookingId: string): Promise<any> => {
    const response = await api.get(`/support/booking-context/${bookingId}`);
    return response.data;
};

export interface SupportMessage {
    id: string;
    ticket_id: string;
    sender_id: string;
    content?: string;
    message_type: 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO';
    created_at: string;
    sender_name?: string;
    sender_role?: string;
}

export const getSupportMessages = async (ticketId: string): Promise<SupportMessage[]> => {
    const response = await api.get(`/support/${ticketId}/messages`);
    return response.data;
};

export const sendSupportMessage = async (ticketId: string, content: string, message_type: string = 'TEXT'): Promise<SupportMessage> => {
    const response = await api.post(`/support/${ticketId}/messages`, { content, message_type });
    return response.data;
};
