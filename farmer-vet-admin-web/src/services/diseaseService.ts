import api from './api';

export interface Disease {
    id: string;
    name: string;
    name_hi?: string;
    category: string;
    description: string;
    description_hi?: string;
    body_system: string;
    disease_type: string;
    species: string;
    symptoms: string[];
    symptoms_hi?: string[];
    causes: string[];
    treatments: string[];
    pathogen_type: string;
    pathogen_name: string;
    severity_level: number;
    image_path?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DiseaseCreate {
    name: string;
    category: string;
    description: string;
    body_system: string;
    disease_type: string;
    species: string;
    symptoms: string[];
    causes: string[];
    treatments: string[];
    pathogen_type: string;
    pathogen_name: string;
    severity_level: number;
    image_path?: string;
}

export interface DiseaseUpdate {
    name?: string;
    category?: string;
    description?: string;
    body_system?: string;
    disease_type?: string;
    species?: string;
    symptoms?: string[];
    causes?: string[];
    treatments?: string[];
    pathogen_type?: string;
    pathogen_name?: string;
    severity_level?: number;
    image_path?: string;
}

// Helper to ensure arrays are arrays (backend sometimes returns null for empty)
const sanitizeDisease = (d: Disease): Disease => ({
    ...d,
    symptoms: d.symptoms || [],
    causes: d.causes || [],
    treatments: d.treatments || []
});

export const getDiseases = async (): Promise<Disease[]> => {
    const response = await api.get('/diseases');
    return response.data.map(sanitizeDisease);
};

export const getDisease = async (id: string): Promise<Disease> => {
    const response = await api.get(`/diseases/${id}`);
    return sanitizeDisease(response.data);
};

export const createDisease = async (data: DiseaseCreate): Promise<Disease> => {
    const response = await api.post('/diseases/', data);
    return sanitizeDisease(response.data);
};

export const updateDisease = async (id: string, data: DiseaseUpdate): Promise<Disease> => {
    const response = await api.put(`/diseases/${id}`, data);
    return sanitizeDisease(response.data);
};

export const deleteDisease = async (id: string): Promise<void> => {
    await api.delete(`/diseases/${id}`);
};
