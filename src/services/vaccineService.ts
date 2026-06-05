import api from './api';

export interface Vaccine {
    id: string;
    name: string;
    name_hi: string | null;
    description: string | null;
    description_hi: string | null;
    pathogen_name: string | null;
    category: string | null;
    age_of_first_vaccination: string | null;
    dosage_schedule: string | null;
    seasonal_timing: string | null;
    target_animals: string | null;
    key_notes: string | null;
    key_notes_hi: string | null;
    image_url: string | null;
    price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const getVaccines = async (): Promise<Vaccine[]> => {
    const response = await api.get('/vaccines/');
    return response.data;
};

export const createVaccine = async (data: Partial<Vaccine>): Promise<Vaccine> => {
    const response = await api.post('/vaccines/', data);
    return response.data;
};

export const updateVaccine = async (id: string, data: Partial<Vaccine>): Promise<Vaccine> => {
    const response = await api.put(`/vaccines/${id}`, data);
    return response.data;
};

export const deleteVaccine = async (id: string): Promise<void> => {
    await api.delete(`/vaccines/${id}`);
};
