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

export const getDiseases = async () => {
    const response = await api.get('/diseases');
    return response.data;
};

export const getArticles = async () => {
    const response = await api.get('/articles');
    return response.data;
};

export const getVaccines = async () => {
    const response = await api.get('/vaccines');
    return response.data;
};

export const getFees = async () => {
    const response = await api.get('/admin/fees');
    return response.data;
};

export const updateFeeConfig = async (category: string, feeData: Record<string, any>) => {
    const response = await api.put(`/admin/fees/${category}`, feeData);
    return response.data;
};

export const getServiceCards = async () => {
    const response = await api.get('/service-cards');
    return response.data;
};

export const getSupportTickets = async () => {
    const response = await api.get('/admin/tickets');
    return response.data;
};

export const updateSupportTicket = async (ticketId: string, status: string, responseText?: string) => {
    const response = await api.put(`/admin/tickets/${ticketId}`, { status, response: responseText });
    return response.data;
};

export const getFarmers = async () => {
  try {
    const response = await api.get('/admin/farmers');
    const list = Array.isArray(response.data) ? response.data : (response.data?.farmers || response.data?.summary || []);
    return list;
  } catch (err) {
    console.error('Backend endpoint /admin/farmers unreachable or empty.', err);
    throw err;
  }
};
export const approveVet = async (vetId: string, status: 'verified' | 'rejected', reason?: string) => {
    const response = await api.post(`/admin/vets/${vetId}/approve`, { status, rejection_reason: reason });
    return response.data;
};

export const blockUser = async (userId: string, isActive: boolean) => {
    const response = await api.post(`/admin/users/${userId}/block`, { is_active: isActive });
    return response.data;
};

export const updateVetProfile = async (vetId: string, data: Record<string, any>) => {
    const response = await api.put(`/admin/vets/${vetId}`, data);
    return response.data;
};

export const updateFarmerProfile = async (farmerId: string, data: Record<string, any>) => {
    const response = await api.put(`/admin/farmers/${farmerId}`, data);
    return response.data;
};

export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

export const markConsultationNoShow = async (bookingId: string, target: 'farmer' | 'vet', reason: string) => {
    const response = await api.post(`/admin/consults/${bookingId}/mark-no-show`, { target, reason });
    return response.data;
};

export const deleteVet = async (vetId: string) => {
    const response = await api.delete(`/admin/vets/${vetId}`);
    return response.data;
};

export const deleteFarmer = async (farmerId: string) => {
    const response = await api.delete(`/admin/farmers/${farmerId}`);
    return response.data;
};

export const getVetOfferings = async (vetId: string) => {
    const response = await api.get(`/admin/vets/${vetId}/offerings`);
    return response.data;
};

export const createDefaultOfferings = async (vetId: string) => {
    const response = await api.post(`/admin/vets/${vetId}/offerings/create-defaults`);
    return response.data;
};
