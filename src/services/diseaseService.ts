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
    group_id?: string;
    group?: DiseaseGroup;
    created_at?: string;
    updated_at?: string;
}

export interface DiseaseGroup {
    id: string;
    name: string;
    name_hi?: string;
    description?: string;
    description_hi?: string;
    icon_emoji?: string;
    image_path?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DiseaseGroupCreate {
    name: string;
    description?: string;
    icon_emoji?: string;
    image_path?: string;
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
    group_id?: string;
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
    group_id?: string;
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

// --- Disease Group Services ---

export const getDiseaseGroups = async (): Promise<DiseaseGroup[]> => {
    const response = await api.get('/diseases/groups/all');
    return response.data;
};

export const createDiseaseGroup = async (data: DiseaseGroupCreate): Promise<DiseaseGroup> => {
    const response = await api.post('/diseases/groups/', data);
    return response.data;
};

export const updateDiseaseGroup = async (id: string, data: Partial<DiseaseGroupCreate>): Promise<DiseaseGroup> => {
    const response = await api.put(`/diseases/groups/${id}`, data);
    return response.data;
};

export const deleteDiseaseGroup = async (id: string): Promise<void> => {
    await api.delete(`/diseases/groups/${id}`);
};
