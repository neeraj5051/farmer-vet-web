import React from 'react';

interface TopCitiesListProps {
  data?: { city: string; count: number }[];
}

const defaultData = [
  { city: 'Bengaluru', count: 78 },
  { city: 'Nalanda', count: 26 },
  { city: 'Jehanabad', count: 16 },
  { city: 'Patna', count: 8 },
];

const TopCitiesList: React.FC<TopCitiesListProps> = ({ data }) => {
  const cities = data && data.length > 0 ? data : defaultData;

  return (
    <div style={{
      backgroundColor: 'var(--card-white)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      height: '380px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>Top Cities by Bookings</h3>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
        {cities.slice(0, 5).map((item, i) => (
          <div key={item.city} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: i === 0 ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
            transition: 'background-color 0.15s'
          }}>
            <span style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: i === 0 ? '#dcfce7' : '#f3f4f6',
              color: i === 0 ? '#166534' : 'var(--text-secondary)',
              flexShrink: 0
            }}>
              {i + 1}
            </span>
            <span style={{ flex: 1, fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {item.city}
            </span>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {item.count}
            </span>
          </div>
        ))}
      </div>

      <button style={{ 
        width: '100%', 
        padding: '10px', 
        border: '1px solid var(--border-color)', 
        borderRadius: '8px', 
        background: 'none', 
        color: 'var(--text-secondary)', 
        fontWeight: 600, 
        fontSize: '0.85rem', 
        cursor: 'pointer',
        marginTop: '8px'
      }}>
        View All Cities
      </button>
    </div>
  );
};

export default TopCitiesList;
