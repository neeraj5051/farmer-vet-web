import { Edit2, Plus, Trash2, X, Newspaper, Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Article, ArticleCreateInput, ArticleUpdateInput } from '../services/articleService';
import { getAllArticlesAdmin, createArticle, updateArticle, deleteArticle } from '../services/articleService';

const ManageArticles = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

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
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Pashu Gyan (Articles)</h1>
                    <p className="text-gray-500 mt-1">Create, edit, and publish blogs and advisory articles for farmers.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    New Article
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Image</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Title</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Category</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {articles.map((article) => (
                            <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    {article.image_url ? (
                                        <img src={article.image_url} alt={article.title} className="w-12 h-12 object-cover rounded-lg" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">
                                            <Newspaper size={20} />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-800">
                                    <div className="font-semibold">{article.title}</div>
                                    {article.title_hi && <div className="text-xs text-gray-500 font-normal">{article.title_hi}</div>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800">
                                        {article.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {article.is_published ? <Eye size={12} className="mr-1" /> : <EyeOff size={12} className="mr-1" />}
                                        {article.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {new Date(article.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openEditModal(article)}
                                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {articles.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                    No articles found. Create one to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingArticle ? 'Edit Article' : 'New Pashu Gyan Article'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="e.g. Nutrition, Disease Prevention"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                        checked={formData.is_published}
                                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                    />
                                    <label htmlFor="is_published" className="ml-2 text-sm text-gray-700 font-medium">Publish Immediately</label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (English) *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="Enter English title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (Hindi)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="हिंदी शीर्षक दर्ज करें"
                                        value={formData.title_hi}
                                        onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="https://images.unsplash.com/... (leave blank for default)"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                />
                                {formData.image_url && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-400 mb-1">Image Preview:</p>
                                        <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content (English) *</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                                    rows={6}
                                    placeholder="Write English blog content here... Use newlines to separate paragraphs or lists starting with •"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content (Hindi)</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                                    rows={6}
                                    placeholder="हिंदी ब्लॉग सामग्री यहाँ लिखें..."
                                    value={formData.content_hi}
                                    onChange={(e) => setFormData({ ...formData, content_hi: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    {editingArticle ? 'Update Article' : 'Create Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageArticles;
