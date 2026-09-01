import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TopCitiesListProps {
  data?: { district: string; count: number }[];
}

const defaultData = [
  { district: 'Bengaluru', count: 78 },
  { district: 'Nalanda', count: 26 },
  { district: 'Jehanabad', count: 16 },
  { district: 'Patna', count: 8 },
  { district: 'Ludhiana', count: 6 },
  { district: 'Karnal', count: 5 },
  { district: 'Anand', count: 4 },
  { district: 'Jaipur', count: 3 }
];

const TopCitiesList: React.FC<TopCitiesListProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const districts = data !== undefined ? data : defaultData;
  const visibleDistricts = expanded ? districts : districts.slice(0, 4);

  return (
    <div style={{
      backgroundColor: 'var(--card-white)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      minHeight: '380px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Top Districts by Bookings</h3>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--humal-green)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
          {districts.length} Districts
        </span>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        {districts.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            No district location data available for selected filters.
          </div>
        ) : (
          visibleDistricts.map((item, i) => (
            <div key={item.district} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '10px 14px',
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
                {item.district}
              </span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {item.count}
              </span>
            </div>
          ))
        )}
      </div>

      <button 
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        style={{ 
          width: '100%', 
          padding: '10px', 
          border: '1px solid var(--border-color)', 
          borderRadius: '8px', 
          background: '#f8fafc', 
          color: 'var(--text-primary)', 
          fontWeight: 600, 
          fontSize: '0.85rem', 
          cursor: 'pointer',
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.15s ease'
        }}
      >
        <span>{expanded ? 'Show Top 4 Districts' : 'View All Districts'}</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </div>
  );
};

export default TopCitiesList;
