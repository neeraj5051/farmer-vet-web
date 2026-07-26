import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: '#dcfce7', text: '#10b981', label: 'Completed' },
  COMPLETED_NO_PRESCRIPTION: { bg: '#dcfce7', text: '#10b981', label: 'Completed' },
  IN_PROGRESS: { bg: '#dbeafe', text: '#3b82f6', label: 'In Progress' },
  CONFIRMED: { bg: '#fef3c7', text: '#f59e0b', label: 'Confirmed' },
  AWAITING_PAYMENT: { bg: '#ede9fe', text: '#8b5cf6', label: 'Awaiting Payment' },
  PENDING: { bg: '#fef3c7', text: '#f59e0b', label: 'Pending' },
  CANCELLED: { bg: '#fee2e2', text: '#ef4444', label: 'Cancelled' },
  REJECTED: { bg: '#fee2e2', text: '#ef4444', label: 'Rejected' },
  NO_SHOW: { bg: '#fde8d8', text: '#ea580c', label: 'No Show' },
};

const getServiceLabel = (type: string, category?: string) => {
  const cat = (category || '').toLowerCase();
  const t = (type || '').toLowerCase();
  if (cat.includes('ai') || cat.includes('artificial')) return 'AI / Insemination';
  if (cat.includes('vaccin')) return 'Vaccination';
  if (t.includes('video') || t.includes('phone') || t.includes('online')) return 'Online Consultation';
  return 'In-Person Visit';
};

import { applyGlobalFilters } from '../../utils/filterUtils';

interface RecentBookingsTableProps {
  data?: any[];
}

const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({ data }) => {
  const { dateRange, stateFilter, serviceFilter } = useFilters();

  const filteredData = data && data.length > 0 ? applyGlobalFilters(data, { dateRange, stateFilter, serviceFilter }) : [];
  const bookings = filteredData.slice(0, 5);

  const isEmpty = bookings.length === 0;

  return (
    <div style={{
      backgroundColor: 'var(--card-white)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      overflowX: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recent Bookings</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            Export CSV
          </button>
          <button style={{ color: 'var(--humal-green)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
            View All
          </button>
        </div>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Filtered by: {dateRange} • {stateFilter} • {serviceFilter}
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Booking ID</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Farmer</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Service</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Vet</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Date</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Payment</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}></th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={8} style={{ padding: '40px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No bookings data available. Please check your backend connection.
              </td>
            </tr>
          ) : (
            bookings.map((b: any) => {
              const s = STATUS_MAP[b.status] || { bg: '#f3f4f6', text: '#6b7280', label: b.status || '—' };
              return (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '16px 8px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>{b.id?.slice(0, 13) || '—'}</td>
                  <td style={{ padding: '16px 8px' }}>{b.farmer_name || '—'}</td>
                  <td style={{ padding: '16px 8px' }}>{getServiceLabel(b.type || b.consultation_type || '', b.category)}</td>
                  <td style={{ padding: '16px 8px' }}>{b.vet_name || '—'}</td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{b.date || b.scheduled_at?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{ color: s.text, backgroundColor: s.bg, padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {s.label}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', fontWeight: 600 }}>
                    {b.total_paid ? `₹${b.total_paid}` : '—'}
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentBookingsTable;
