import api from './api';


export const login = async (phone: string, password: string) => {
    const response = await api.post('/auth/login', {
        phone: phone,
        password: password
    });
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/auth/me'); // Assuming /me endpoint exists or similar
    return response.data;
};
