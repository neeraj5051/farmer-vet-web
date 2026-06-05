import api from './api';

export interface Article {
    id: string;
    title: string;
    title_hi?: string;
    content: string;
    content_hi?: string;
    category: string;
    image_url?: string;
    is_published: boolean;
    author_id?: string;
    created_at: string;
    updated_at: string;
}

export interface ArticleCreateInput {
    title: string;
    title_hi?: string;
    content: string;
    content_hi?: string;
    category: string;
    image_url?: string;
    is_published?: boolean;
}

export interface ArticleUpdateInput {
    title?: string;
    title_hi?: string;
    content?: string;
    content_hi?: string;
    category?: string;
    image_url?: string;
    is_published?: boolean;
}

export const getArticles = async (): Promise<Article[]> => {
    const response = await api.get('/articles/');
    return response.data;
};

export const getAllArticlesAdmin = async (): Promise<Article[]> => {
    const response = await api.get('/articles/all');
    return response.data;
};

export const createArticle = async (payload: ArticleCreateInput): Promise<Article> => {
    const response = await api.post('/articles/', payload);
    return response.data;
};

export const updateArticle = async (id: string, payload: ArticleUpdateInput): Promise<Article> => {
    const response = await api.put(`/articles/${id}`, payload);
    return response.data;
};

export const deleteArticle = async (id: string): Promise<void> => {
    await api.delete(`/articles/${id}`);
};
