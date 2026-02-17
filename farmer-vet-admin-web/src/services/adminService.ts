import api from './api';

export const getPayments = async () => {
    const response = await api.get('/admin/payments');
    return response.data;
};

export const getPayouts = async () => {
    const response = await api.get('/admin/payouts');
    return response.data;
};


export const getVets = async () => {
    const response = await api.get('/admin/vets');
    return response.data;
};

export const getFarmers = async () => {
    const response = await api.get('/admin/farmers');
    return response.data;
};

export const approveVet = async (vetId: string, status: 'verified' | 'rejected', reason?: string) => {
    const response = await api.post(`/admin/vets/${vetId}/approve`, { status, rejection_reason: reason });
    return response.data;
};

export const blockUser = async (userId: string, isActive: boolean) => {
    const response = await api.post(`/admin/users/${userId}/block`, { is_active: isActive });
    return response.data;
};

export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};
