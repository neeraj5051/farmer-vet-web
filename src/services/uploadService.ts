import api from './api';

export const uploadAdminImage = async (file: File, folder: string = 'admin_uploads'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/upload/admin-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data.url;
};
