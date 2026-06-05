import api from './api';

export interface ServiceVariant {
    id: string;
    category_id: string;
    name: string;
    name_hi?: string;
    description?: string;
    description_hi?: string;
    base_fee_suggestion?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServiceCategory {
    id: string;
    name: string;
    title: string;
    title_hi?: string;
    description?: string;
    description_hi?: string;
    icon_emoji?: string;
    is_active: boolean;
    variants: ServiceVariant[];
    created_at: string;
    updated_at: string;
}

export const getAdminServices = async (): Promise<ServiceCategory[]> => {
    const response = await api.get('/services/admin/all');
    return response.data;
};

export const createCategory = async (data: Omit<ServiceCategory, 'id' | 'variants' | 'created_at' | 'updated_at'>): Promise<ServiceCategory> => {
    const response = await api.post('/services/categories', data);
    return response.data;
};

export const updateCategory = async (id: string, data: Partial<ServiceCategory>): Promise<ServiceCategory> => {
    const response = await api.put(`/services/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await api.delete(`/services/categories/${id}`);
};

export const createVariant = async (data: Omit<ServiceVariant, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceVariant> => {
    const response = await api.post('/services/variants', data);
    return response.data;
};

export const updateVariant = async (id: string, data: Partial<ServiceVariant>): Promise<ServiceVariant> => {
    const response = await api.put(`/services/variants/${id}`, data);
    return response.data;
};

export const deleteVariant = async (id: string): Promise<void> => {
    await api.delete(`/services/variants/${id}`);
};
