import api from './api';

export const MOCK_CONSULTATIONS = [
  // AI / Insemination Bookings
  {
    id: 'AI-2026-001',
    booking_id: 'AI-2026-001',
    type: 'PHYSICAL_VISIT',
    category: 'AI / Insemination',
    service_type: 'AI / Insemination',
    service_category: 'ARTIFICIAL_INSEMINATION',
    status: 'COMPLETED',
    farmer_name: 'Gurpreet Singh',
    farmer_state: 'Punjab',
    state: 'Punjab',
    vet_name: 'Dr. Harpreet Sharma',
    fee: 850,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    symptoms: 'Sahiwal Cow Artificial Insemination (HF Semen Grade A)'
  },
  {
    id: 'AI-2026-002',
    booking_id: 'AI-2026-002',
    type: 'PHYSICAL_VISIT',
    category: 'ARTIFICIAL_INSEMINATION',
    service_type: 'AI',
    service_category: 'AI / Insemination',
    status: 'CONFIRMED',
    farmer_name: 'Rajesh Kumar',
    farmer_state: 'Haryana',
    state: 'Haryana',
    vet_name: 'Dr. Ramesh Yadav',
    fee: 900,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    symptoms: 'Murrah Buffalo Artificial Insemination'
  },
  {
    id: 'AI-2026-003',
    booking_id: 'AI-2026-003',
    type: 'PHYSICAL_VISIT',
    category: 'AI / Insemination',
    service_type: 'AI',
    service_category: 'ARTIFICIAL_INSEMINATION',
    status: 'COMPLETED',
    farmer_name: 'Amit Patel',
    farmer_state: 'Gujarat',
    state: 'Gujarat',
    vet_name: 'Dr. Vikram Desai',
    fee: 950,
    created_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    date: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    symptoms: 'Gir Cattle Semen Insemination'
  },
  {
    id: 'AI-2026-004',
    booking_id: 'AI-2026-004',
    type: 'PHYSICAL_VISIT',
    category: 'ARTIFICIAL_INSEMINATION',
    service_type: 'AI / Insemination',
    service_category: 'AI',
    status: 'CANCELLED',
    farmer_name: 'Suresh Verma',
    farmer_state: 'Uttar Pradesh',
    state: 'Uttar Pradesh',
    vet_name: 'Dr. Ankit Srivastava',
    fee: 800,
    created_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    date: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    symptoms: 'Artificial Insemination Booking'
  },
  {
    id: 'AI-2026-005',
    booking_id: 'AI-2026-005',
    type: 'PHYSICAL_VISIT',
    category: 'AI / Insemination',
    service_type: 'AI',
    service_category: 'ARTIFICIAL_INSEMINATION',
    status: 'NO_SHOW',
    farmer_name: 'Manish Joshi',
    farmer_state: 'Rajasthan',
    state: 'Rajasthan',
    vet_name: 'Dr. Sunita Choudhary',
    fee: 850,
    created_at: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    date: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    symptoms: 'Breeding Artificial Insemination Service'
  },

  // Vaccination Bookings
  {
    id: 'VAC-2026-001',
    booking_id: 'VAC-2026-001',
    type: 'PHYSICAL_VISIT',
    category: 'Vaccination',
    service_type: 'Vaccination',
    service_category: 'VACCINATION',
    status: 'COMPLETED',
    farmer_name: 'Vikramjit Singh',
    farmer_state: 'Punjab',
    state: 'Punjab',
    vet_name: 'Dr. Harpreet Sharma',
    fee: 500,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    symptoms: 'FMD (Foot & Mouth Disease) Vaccination for 10 Cows'
  },
  {
    id: 'VAC-2026-002',
    booking_id: 'VAC-2026-002',
    type: 'PHYSICAL_VISIT',
    category: 'Vaccination',
    service_type: 'Vaccination',
    service_category: 'VACCINATION',
    status: 'IN_PROGRESS',
    farmer_name: 'Dharmendra Yadav',
    farmer_state: 'Uttar Pradesh',
    state: 'Uttar Pradesh',
    vet_name: 'Dr. Ramesh Yadav',
    fee: 650,
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    symptoms: 'HS (Haemorrhagic Septicaemia) Booster Dose'
  },
  {
    id: 'VAC-2026-003',
    booking_id: 'VAC-2026-003',
    type: 'PHYSICAL_VISIT',
    category: 'Vaccination',
    service_type: 'Vaccination',
    service_category: 'VACCINATION',
    status: 'COMPLETED',
    farmer_name: 'Sunil Pawar',
    farmer_state: 'Maharashtra',
    state: 'Maharashtra',
    vet_name: 'Dr. Prakash Shinde',
    fee: 600,
    created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    date: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    symptoms: 'Black Quarter (BQ) Vaccination Drive'
  },
  {
    id: 'VAC-2026-004',
    booking_id: 'VAC-2026-004',
    type: 'PHYSICAL_VISIT',
    category: 'Vaccination',
    service_type: 'Vaccination',
    service_category: 'VACCINATION',
    status: 'CONFIRMED',
    farmer_name: 'Ramesh Gowda',
    farmer_state: 'Karnataka',
    state: 'Karnataka',
    vet_name: 'Dr. Kavita Murthy',
    fee: 550,
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    date: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    symptoms: 'Brucellosis Cattle Vaccination'
  },

  // Online Consultations
  {
    id: 'ONL-2026-001',
    booking_id: 'ONL-2026-001',
    type: 'ONLINE',
    consultation_type: 'video',
    category: 'General Healthcare',
    service_type: 'Online Consultation',
    status: 'COMPLETED',
    farmer_name: 'Balwinder Singh',
    farmer_state: 'Punjab',
    state: 'Punjab',
    vet_name: 'Dr. Harpreet Sharma',
    fee: 300,
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    symptoms: 'High fever and decreased milk yield in Jersey Cow'
  },
  {
    id: 'ONL-2026-002',
    booking_id: 'ONL-2026-002',
    type: 'ONLINE',
    consultation_type: 'phone',
    category: 'Nutrition & Feed',
    service_type: 'Online Consultation',
    status: 'COMPLETED',
    farmer_name: 'Ketan Shah',
    farmer_state: 'Gujarat',
    state: 'Gujarat',
    vet_name: 'Dr. Vikram Desai',
    fee: 250,
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    symptoms: 'Calf digestive disorder advice'
  },

  // In-Person Visit
  {
    id: 'VIS-2026-001',
    booking_id: 'VIS-2026-001',
    type: 'PHYSICAL_VISIT',
    consultation_type: 'visit',
    category: 'Emergency / Surgery',
    service_type: 'In-Person Visit',
    status: 'COMPLETED',
    farmer_name: 'Jaspal Gill',
    farmer_state: 'Punjab',
    state: 'Punjab',
    vet_name: 'Dr. Harpreet Sharma',
    fee: 1200,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    symptoms: 'Dystocia emergency delivery assist'
  }
];

export const getConsultations = async (params?: {
  status?: string;
  period?: string;
  start_date?: string;
  end_date?: string;
}) => {
  try {
    const response = await api.get('/admin/consults', { params });
    const data = response.data;
    const list = data?.summary || (Array.isArray(data) ? data : []);
    if (list && list.length > 0) {
      return data;
    }
    return MOCK_CONSULTATIONS;
  } catch (err) {
    console.warn('Backend endpoint /admin/consults unreachable or empty. Returning mock consultation data.', err);
    return MOCK_CONSULTATIONS;
  }
};

export const getConsultationDetail = async (consultId: string) => {
  try {
    const response = await api.get(`/admin/consults/${consultId}`);
    return response.data;
  } catch (err) {
    console.warn(`Backend endpoint /admin/consults/${consultId} unreachable. Returning mock detail.`, err);
    const found = MOCK_CONSULTATIONS.find(c => c.id === consultId || c.booking_id === consultId);
    return found || MOCK_CONSULTATIONS[0];
  }
};
