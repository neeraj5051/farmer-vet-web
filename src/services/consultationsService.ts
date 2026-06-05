import api from './api';

export const getConsultations = async (params?: {
    status?: string;
    period?: string;
    start_date?: string;
    end_date?: string;
}) => {
    const response = await api.get('/admin/consults', { params });
    return response.data;
};

export const getConsultationDetail = async (consultId: string) => {
    const response = await api.get(`/admin/consults/${consultId}`);
    return response.data;
};
