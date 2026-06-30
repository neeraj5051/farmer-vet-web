import { Edit2, Plus, Trash2, X, Newspaper, Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Article, ArticleCreateInput, ArticleUpdateInput } from '../services/articleService';
import { getAllArticlesAdmin, createArticle, updateArticle, deleteArticle } from '../services/articleService';
import { uploadAdminImage } from '../services/uploadService';

const ManageArticles = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [viewerImage, setViewerImage] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<ArticleCreateInput>({
        title: '',
        title_hi: '',
        content: '',
        content_hi: '',
        category: '',
        image_url: '',
        is_published: true
    });

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const data = await getAllArticlesAdmin();
            setArticles(data);
        } catch (error) {
            console.error("Failed to fetch articles", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim() || !formData.category.trim()) {
            alert("Title, Category, and Content are required.");
            return;
        }

        try {
            if (editingArticle) {
                const updatePayload: ArticleUpdateInput = {
                    title: formData.title,
                    title_hi: formData.title_hi || '',
                    content: formData.content,
                    content_hi: formData.content_hi || '',
                    category: formData.category,
                    image_url: formData.image_url || '',
                    is_published: formData.is_published
                };
                await updateArticle(editingArticle.id, updatePayload);
            } else {
                await createArticle(formData);
            }
            setIsModalOpen(false);
            fetchArticles();
            resetForm();
        } catch (error) {
            console.error("Failed to save article", error);
            alert("Failed to save article configuration");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const url = await uploadAdminImage(file, 'articles');
            setFormData(prev => ({ ...prev, image_url: url }));
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;
        try {
            await deleteArticle(id);
            fetchArticles();
        } catch (error) {
            console.error("Failed to delete article", error);
            alert("Failed to delete article");
        }
    };

    const openEditModal = (article: Article) => {
        setEditingArticle(article);
        setFormData({
            title: article.title,
            title_hi: article.title_hi || '',
            content: article.content,
            content_hi: article.content_hi || '',
            category: article.category,
            image_url: article.image_url || '',
            is_published: article.is_published
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingArticle(null);
        setFormData({
            title: '',
            title_hi: '',
            content: '',
            content_hi: '',
            category: '',
            image_url: '',
            is_published: true
        });
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading articles...</div>;

    return (
        <div className="ap-page p-8 min-h-screen">
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Pashu Gyan (Articles)</h1>
                    <p className="ap-subtitle">Create, edit, and publish blogs and advisory articles for farmers.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="ap-add-btn"
                >
                    <Plus size={18} className="mr-2" />
                    New Article
                </button>
            </div>

            <div className="ap-table-wrap">
                <table className="ap-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article.id} className="ap-row">
                                <td>
                                    {article.image_url ? (
                                        <img src={article.image_url} alt={article.title} className="w-12 h-12 object-cover rounded-lg" />
                                    ) : (
                                        <div className="w-12 h-12 flex items-center justify-center rounded-lg text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <Newspaper size={20} />
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <div className="ap-cell-bold">{article.title}</div>
                                    {article.title_hi && <div className="text-xs text-gray-400 font-medium">{article.title_hi}</div>}
                                </td>
                                <td>
                                    <span className="ap-badge" style={{ background: '#d1fae5', color: '#065f46', whiteSpace: 'nowrap' }}>
                                        {article.category}
                                    </span>
                                </td>
                                <td>
                                    <span className="ap-badge" style={{ background: article.is_published ? '#d1fae5' : '#fef3c7', color: article.is_published ? '#065f46' : '#92400e' }}>
                                        {article.is_published ? <Eye size={12} className="mr-1 inline" /> : <EyeOff size={12} className="mr-1 inline" />}
                                        {article.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="text-gray-400 text-sm">
                                    {new Date(article.created_at).toLocaleDateString()}
                                </td>
                                <td className="text-right space-x-2">
                                    <button
                                        onClick={() => openEditModal(article)}
                                        className="ap-btn-sm ap-btn-outline"
                                        title="Edit Article"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="ap-btn-sm ap-btn-danger"
                                        title="Delete Article"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {articles.length === 0 && (
                            <tr>
                                <td colSpan={6} className="ap-empty">
                                    No articles found. Create one to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="ap-modal-backdrop">
                    <div className="ap-modal w-full max-w-2xl" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="ap-modal-header border-b" style={{ borderColor: 'var(--border-glass)' }}>
                            <h3 className="ap-title text-lg">
                                {editingArticle ? 'Edit Article' : 'New Pashu Gyan Article'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="ap-modal-close">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="ap-modal-body space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="ap-label">Category *</label>
                                    <input
                                        type="text"
                                        required
                                        className="ap-input"
                                        placeholder="e.g. Nutrition, Disease Prevention"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="ap-switch">
                                        <input
                                            type="checkbox"
                                            id="is_published"
                                            checked={formData.is_published}
                                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                        />
                                        <span className="ap-switch-slider"></span>
                                    </label>
                                    <label htmlFor="is_published" className="ml-3 text-sm font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }}>Publish Immediately</label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="ap-label">Title (English) *</label>
                                    <input
                                        type="text"
                                        required
                                        className="ap-input"
                                        placeholder="Enter English title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="ap-label">Title (Hindi)</label>
                                    <input
                                        type="text"
                                        className="ap-input"
                                        placeholder="हिंदी शीर्षक दर्ज करें"
                                        value={formData.title_hi}
                                        onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="ap-label mb-2 block">Image Upload</label>
                                <div className="flex flex-wrap items-center gap-4">
                                    {formData.image_url && (
                                        <div className="relative group">
                                            <img 
                                                src={formData.image_url} 
                                                alt="Preview" 
                                                className="w-32 h-32 rounded-lg object-cover border cursor-pointer transition-opacity hover:opacity-90" 
                                                style={{ borderColor: 'var(--border-glass)' }} 
                                                onClick={() => setViewerImage(formData.image_url || null)}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm("Are you sure you want to remove this image?")) {
                                                        setFormData({ ...formData, image_url: '' });
                                                    }
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold border-none cursor-pointer shadow-lg hover:bg-red-600 transition-colors"
                                                title="Remove Image"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-start gap-2">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageUpload} 
                                            style={{ display: 'none' }} 
                                            id="article-image-upload" 
                                            disabled={uploadingImage}
                                        />
                                        <label 
                                            htmlFor="article-image-upload" 
                                            className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                                            style={{ 
                                                borderColor: 'var(--border-glass)',
                                                background: 'rgba(255,255,255,0.02)'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        >
                                            <div className="flex flex-col items-center justify-center p-2 text-center">
                                                <Plus size={24} className="mb-2 text-gray-400" />
                                                <span className="text-xs text-gray-400">
                                                    {uploadingImage ? 'Uploading...' : formData.image_url ? 'Change Image' : 'Upload Image'}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="ap-label">Content (English) *</label>
                                <textarea
                                    required
                                    className="ap-textarea"
                                    rows={6}
                                    placeholder="Write English blog content here... Use newlines to separate paragraphs or lists starting with •"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="ap-label">Content (Hindi)</label>
                                <textarea
                                    className="ap-textarea"
                                    rows={6}
                                    placeholder="हिंदी ब्लॉग सामग्री यहाँ लिखें..."
                                    value={formData.content_hi}
                                    onChange={(e) => setFormData({ ...formData, content_hi: e.target.value })}
                                />
                            </div>

                            <div className="ap-modal-footer mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="ap-btn-sm ap-btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ap-btn-sm ap-btn-primary"
                                >
                                    {editingArticle ? 'Update Article' : 'Create Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Full Screen Image Viewer Modal */}
            {viewerImage && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 p-4"
                    onClick={() => setViewerImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                        onClick={() => setViewerImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img 
                        src={viewerImage} 
                        alt="Full screen preview" 
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
};

export default ManageArticles;
