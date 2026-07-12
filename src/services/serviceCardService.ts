import api from './api';

export interface ServiceCard {
    id: string;
    title: string;
    subtitle: string;
    title_hi?: string;
    subtitle_hi?: string;
    image_url?: string;
    navigation_route: string;
    navigation_params?: any;
    order_index: int;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const serviceCardService = {
    getAllServiceCardsAdmin: async (): Promise<ServiceCard[]> => {
        const response = await api.get('/service_cards/all');
        return response.data;
    },

    updateServiceCard: async (id: string, data: Partial<ServiceCard>): Promise<ServiceCard> => {
        const response = await api.put(`/service_cards/${id}`, data);
        return response.data;
    }
};
