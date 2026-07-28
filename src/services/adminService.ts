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

export const MOCK_FARMERS = [
  {
    id: 'FARMER-001',
    first_name: 'Gurpreet',
    last_name: 'Singh',
    phone: '+91 98765 43210',
    district: 'Ludhiana',
    state: 'Punjab',
    village: 'Gill',
    is_active: true,
    total_bookings: 5,
    total_spent: 3400,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    last_booking_date: '2026-07-25',
    preferred_language: 'pa'
  },
  {
    id: 'FARMER-002',
    first_name: 'Rajesh',
    last_name: 'Kumar',
    phone: '+91 98123 45678',
    district: 'Karnal',
    state: 'Haryana',
    village: 'Taraori',
    is_active: true,
    total_bookings: 3,
    total_spent: 2150,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    last_booking_date: '2026-07-24',
    preferred_language: 'hi'
  },
  {
    id: 'FARMER-003',
    first_name: 'Amit',
    last_name: 'Patel',
    phone: '+91 97234 56789',
    district: 'Anand',
    state: 'Gujarat',
    village: 'Vasad',
    is_active: true,
    total_bookings: 4,
    total_spent: 2800,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    last_booking_date: '2026-07-26',
    preferred_language: 'gu'
  },
  {
    id: 'FARMER-004',
    first_name: 'Dharmendra',
    last_name: 'Yadav',
    phone: '+91 96543 21098',
    district: 'Mathura',
    state: 'Uttar Pradesh',
    village: 'Vrindavan',
    is_active: true,
    total_bookings: 2,
    total_spent: 1400,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    last_booking_date: '2026-07-22',
    preferred_language: 'hi'
  },
  {
    id: 'FARMER-005',
    first_name: 'Manish',
    last_name: 'Joshi',
    phone: '+91 95432 10987',
    district: 'Jaipur',
    state: 'Rajasthan',
    village: 'Sanganer',
    is_active: true,
    total_bookings: 1,
    total_spent: 850,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    last_booking_date: '2026-07-21',
    preferred_language: 'hi'
  },
  {
    id: 'FARMER-006',
    first_name: 'Sunil',
    last_name: 'Pawar',
    phone: '+91 94321 09876',
    district: 'Nashik',
    state: 'Maharashtra',
    village: 'Ozar',
    is_active: true,
    total_bookings: 6,
    total_spent: 4200,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    last_booking_date: '2026-07-23',
    preferred_language: 'mr'
  },
  {
    id: 'FARMER-007',
    first_name: 'Ramesh',
    last_name: 'Gowda',
    phone: '+91 93210 98765',
    district: 'Mandya',
    state: 'Karnataka',
    village: 'Maddur',
    is_active: true,
    total_bookings: 2,
    total_spent: 1250,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    last_booking_date: '2026-07-20',
    preferred_language: 'kn'
  }
];

export const getFarmers = async () => {
  try {
    const response = await api.get('/admin/farmers');
    const list = Array.isArray(response.data) ? response.data : (response.data?.farmers || response.data?.summary || []);
    if (list && list.length > 0) return list;
    return MOCK_FARMERS;
  } catch (err) {
    console.warn('Backend endpoint /admin/farmers unreachable or empty. Returning mock farmer list.', err);
    return MOCK_FARMERS;
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
