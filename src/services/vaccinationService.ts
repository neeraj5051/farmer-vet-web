import api from './api';

export const getVaccinationConsults = async () => {
    // Vaccinations are filtered from consults - category includes "vaccin"
    const response = await api.get('/admin/consults');
    const data = response.data;
    const allConsults = data?.summary || (Array.isArray(data) ? data : []);
    return allConsults.filter((c: any) => {
        const cat = (c.category || '').toLowerCase();
        return cat.includes('vaccin') || cat.includes('vacc');
    });
};

export const getVaccinationSchedules = async () => {
    try {
        const response = await api.get('/admin/vaccination-schedules');
        return response.data;
    } catch {
        return [];
    }
};
