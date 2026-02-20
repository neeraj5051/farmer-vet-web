import api from './api';

export interface FeeConfig {
    id: string;
    name: string;
    fee_type: 'PERCENTAGE' | 'FIXED';
    category: 'SERVICE_FEE' | 'TAX';
    value: number;
    description?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface FeeConfigCreate {
    name: string;
    fee_type: 'PERCENTAGE' | 'FIXED';
    category: 'SERVICE_FEE' | 'TAX';
    value: number;
    description?: string;
    is_active?: boolean;
}

export interface FeeConfigUpdate {
    name?: string;
    fee_type?: 'PERCENTAGE' | 'FIXED';
    category?: 'SERVICE_FEE' | 'TAX';
    value?: number;
    description?: string;
    is_active?: boolean;
}

export const getFees = async (): Promise<FeeConfig[]> => {
    const response = await api.get('/admin-fees/');
    return response.data;
};

export const createFee = async (data: FeeConfigCreate): Promise<FeeConfig> => {
    const response = await api.post('/admin-fees/', data);
    return response.data;
};

export const updateFee = async (id: string, data: FeeConfigUpdate): Promise<FeeConfig> => {
    const response = await api.put(`/admin-fees/${id}`, data);
    return response.data;
};

export const deleteFee = async (id: string): Promise<void> => {
    await api.delete(`/admin-fees/${id}`);
};
