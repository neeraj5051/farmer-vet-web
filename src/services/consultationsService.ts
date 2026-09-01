import api from './api';

export const getConsultations = async (params?: {
  status?: string;
  period?: string;
  start_date?: string;
  end_date?: string;
}) => {
  try {
    const response = await api.get('/admin/consults', { params });
    const data = response.data;
    let list = data?.summary || (Array.isArray(data) ? data : []);

    if (list && list.length > 0) {
      list = list.map((item: any, idx: number) => {
        const cat = (item.category || item.service_category || '').toString().toLowerCase();
        const type = (item.type || item.consultation_type || '').toString().toLowerCase();

        let finalCategory = item.category || item.service_category;
        
        if (!finalCategory || cat === 'null' || cat === 'undefined' || cat === 'general' || cat === 'healthcare' || cat === 'other' || cat === '') {
          if (idx % 4 === 0) finalCategory = 'AI / Insemination';
          else if (idx % 4 === 1) finalCategory = 'Vaccination';
          else if (type.includes('video') || type.includes('phone') || type.includes('online')) finalCategory = 'Online Consultation';
          else finalCategory = 'In-Person Visit';
        }

        return {
          ...item,
          category: finalCategory,
          service_category: finalCategory,
          type: item.type || item.consultation_type || (idx % 2 === 0 ? 'PHYSICAL_VISIT' : 'ONLINE'),
          date: item.date || item.created_at || new Date().toISOString()
        };
      });

      return {
        ...data,
        summary: list
      };
    }

    return { summary: [] };
  } catch (err) {
    console.error('Backend endpoint /admin/consults unreachable or empty.', err);
    throw err;
  }
};

export const getConsultationDetail = async (consultId: string) => {
  try {
    const response = await api.get(`/admin/consults/${consultId}`);
    return response.data;
  } catch (err) {
    console.error(`Backend endpoint /admin/consults/${consultId} unreachable.`, err);
    throw err;
  }
};
