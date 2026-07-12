import React, { useEffect, useState } from 'react';
import { serviceCardService, type ServiceCard } from '../services/serviceCardService';
import { uploadAdminImage } from '../services/uploadService';
import './AdminPages.css';

const ManageServiceCards: React.FC = () => {
    const [cards, setCards] = useState<ServiceCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const data = await serviceCardService.getAllServiceCardsAdmin();
            setCards(data);
        } catch (error) {
            console.error("Failed to fetch service cards", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cardId: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        try {
            setUploadingImageId(cardId);
            const url = await uploadAdminImage(file, 'service_cards');
            await serviceCardService.updateServiceCard(cardId, { image_url: url });
            // Refresh
            fetchCards();
        } catch (error: any) {
            console.error("Failed to upload image", error);
            alert(error?.response?.data?.detail || 'Failed to upload image');
        } finally {
            setUploadingImageId(null);
        }
    };

    if (loading) return <div>Loading Service Cards...</div>;

    return (
        <div className="admin-page-container">
            <h2>Manage Service Cards</h2>
            <p>Upload images for the Farmer Dashboard action cards.</p>

            <div className="cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
                {cards.map(card => (
                    <div key={card.id} className="card-item" style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', width: '300px' }}>
                        <h3>{card.title}</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>{card.subtitle}</p>
                        
                        <div style={{ marginBottom: '16px', height: '150px', backgroundColor: '#f0f0f0', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {card.image_url ? (
                                <img src={card.image_url} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ color: '#999' }}>No Image</span>
                            )}
                        </div>

                        <div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }} 
                                id={`upload-${card.id}`}
                                onChange={(e) => handleImageUpload(e, card.id)}
                                disabled={uploadingImageId === card.id}
                            />
                            <label 
                                htmlFor={`upload-${card.id}`} 
                                style={{ 
                                    display: 'block', 
                                    textAlign: 'center', 
                                    backgroundColor: uploadingImageId === card.id ? '#ccc' : '#4CAF50', 
                                    color: 'white', 
                                    padding: '8px', 
                                    borderRadius: '4px', 
                                    cursor: uploadingImageId === card.id ? 'not-allowed' : 'pointer' 
                                }}
                            >
                                {uploadingImageId === card.id ? 'Uploading...' : 'Upload Image'}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageServiceCards;
