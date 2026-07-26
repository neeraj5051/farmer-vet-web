import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Download, Eye, X, Copy, AlertTriangle } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { applyGlobalFilters } from '../../utils/filterUtils';

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
  NO_SHOW_VET: { bg: '#fde8d8', text: '#ea580c', label: 'Vet No-Show' },
  NO_SHOW_FARMER: { bg: '#fde8d8', text: '#ea580c', label: 'Farmer No-Show' },
};

const getServiceLabel = (type: string, category?: string) => {
  const cat = (category || '').toLowerCase();
  const t = (type || '').toLowerCase();
  if (cat.includes('ai') || cat.includes('artificial')) return 'AI / Insemination';
  if (cat.includes('vaccin')) return 'Vaccination';
  if (t.includes('video') || t.includes('phone') || t.includes('online')) return 'Online Consultation';
  return 'In-Person Visit';
};

interface RecentBookingsTableProps {
  data?: any[];
}

const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({ data }) => {
  const navigate = useNavigate();
  const { dateRange, stateFilter, serviceFilter } = useFilters();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const filteredData = data && data.length > 0 ? applyGlobalFilters(data, { dateRange, stateFilter, serviceFilter }) : [];
  const bookings = filteredData.slice(0, 5);
  const isEmpty = bookings.length === 0;

  // Handle Export CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = ['Booking ID', 'Farmer Name', 'Service', 'Vet Name', 'Date', 'Status', 'Amount (INR)'];
    const rows = filteredData.map(b => [
      `"${b.id || b.booking_id || ''}"`,
      `"${b.farmer_name || ''}"`,
      `"${getServiceLabel(b.type || b.consultation_type || '', b.category)}"`,
      `"${b.vet_name || ''}"`,
      `"${b.date || b.created_at || ''}"`,
      `"${b.status || ''}"`,
      `"${b.total_paid || b.amount || 0}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Humal_Bookings_${dateRange.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Booking ID
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    alert(`Copied Booking ID: ${id}`);
    setActiveMenuId(null);
  };

  return (
    <div style={{
      backgroundColor: 'var(--card-white)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recent Bookings</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button"
            onClick={handleExportCSV}
            style={{ 
              color: 'var(--text-primary)', 
              background: '#f8fafc', 
              border: '1px solid var(--border-color)', 
              borderRadius: '6px', 
              padding: '6px 14px', 
              fontWeight: 600, 
              cursor: 'pointer', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
          <button 
            type="button"
            onClick={() => navigate('/admin-v2/bookings')}
            style={{ 
              color: 'var(--humal-green)', 
              background: 'rgba(16, 185, 129, 0.08)', 
              border: '1px solid rgba(16, 185, 129, 0.2)', 
              borderRadius: '6px',
              padding: '6px 14px',
              fontWeight: 600, 
              cursor: 'pointer', 
              fontSize: '0.85rem',
              transition: 'all 0.15s ease'
            }}
          >
            View All
          </button>
        </div>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Filtered by: {dateRange} • {stateFilter} • {serviceFilter}
      </div>
      
      <div style={{ overflowX: 'auto' }}>
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
              <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No bookings data available for the selected filters.
                </td>
              </tr>
            ) : (
              bookings.map((b: any) => {
                const s = STATUS_MAP[b.status] || { bg: '#f3f4f6', text: '#6b7280', label: b.status || '—' };
                const isMenuOpen = activeMenuId === b.id;

                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '16px 8px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {b.id?.slice(0, 13) || '—'}
                    </td>
                    <td style={{ padding: '16px 8px' }}>{b.farmer_name || '—'}</td>
                    <td style={{ padding: '16px 8px' }}>{getServiceLabel(b.type || b.consultation_type || '', b.category)}</td>
                    <td style={{ padding: '16px 8px' }}>{b.vet_name || '—'}</td>
                    <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{b.date || b.created_at?.slice(0, 10) || '—'}</td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{ color: s.text, backgroundColor: s.bg, padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px', fontWeight: 600 }}>
                      {b.total_paid || b.amount ? `₹${b.total_paid || b.amount}` : '—'}
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right', position: 'relative' }}>
                      <button 
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : b.id)}
                        style={{ 
                          background: '#f1f5f9', 
                          border: '1px solid #cbd5e1', 
                          borderRadius: '6px',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer', 
                          color: '#0f172a',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        title="Actions Menu"
                      >
                        <MoreHorizontal size={18} color="#0f172a" />
                      </button>

                      {/* Dropdown Action Menu */}
                      {isMenuOpen && (
                        <div style={{
                          position: 'absolute',
                          right: '8px',
                          top: '48px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                          width: '180px',
                          zIndex: 100,
                          padding: '6px 0',
                          textAlign: 'left'
                        }}>
                          <button
                            type="button"
                            onClick={() => { setSelectedBooking(b); setActiveMenuId(null); }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'none',
                              textAlign: 'left',
                              fontSize: '0.83rem',
                              color: '#0f172a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <Eye size={14} color="#3b82f6" />
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyId(b.id)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'none',
                              textAlign: 'left',
                              fontSize: '0.83rem',
                              color: '#0f172a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <Copy size={14} color="#10b981" />
                            Copy ID
                          </button>
                          <button
                            type="button"
                            onClick={() => { navigate('/admin-v2/bookings'); setActiveMenuId(null); }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'none',
                              textAlign: 'left',
                              fontSize: '0.83rem',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              borderTop: '1px solid #f1f5f9'
                            }}
                          >
                            <AlertTriangle size={14} color="#ef4444" />
                            Manage Booking
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Booking Details</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>ID: {selectedBooking.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}
              >
                <X size={16} color="#0f172a" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Farmer:</span>
                <strong style={{ color: '#0f172a' }}>{selectedBooking.farmer_name || '—'} ({selectedBooking.farmer_state || 'India'})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Assigned Vet:</span>
                <strong style={{ color: '#0f172a' }}>{selectedBooking.vet_name || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Service Type:</span>
                <strong style={{ color: '#0d5c3a' }}>{getServiceLabel(selectedBooking.type || selectedBooking.consultation_type || '', selectedBooking.category)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Date & Time:</span>
                <strong style={{ color: '#0f172a' }}>{selectedBooking.date || '—'} {selectedBooking.time || ''}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Total Fee:</span>
                <strong style={{ color: '#10b981', fontSize: '1rem' }}>₹{selectedBooking.total_paid || selectedBooking.amount || 0}</strong>
              </div>
              {selectedBooking.symptoms && (
                <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Symptoms / Notes:</span>
                  <p style={{ margin: 0, color: '#334155', fontSize: '0.85rem' }}>{selectedBooking.symptoms}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#0d5c3a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentBookingsTable;
