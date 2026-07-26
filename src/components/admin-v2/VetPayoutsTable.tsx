import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  PAID: { bg: '#dcfce7', text: '#10b981', label: 'Paid' },
  PROCESSED: { bg: '#dcfce7', text: '#10b981', label: 'Paid' },
  PENDING: { bg: '#fef3c7', text: '#f59e0b', label: 'Pending' },
  PROCESSING: { bg: '#dbeafe', text: '#3b82f6', label: 'Processing' },
  FAILED: { bg: '#fee2e2', text: '#ef4444', label: 'Failed' },
  CANCELLED: { bg: '#f3f4f6', text: '#6b7280', label: 'Cancelled' },
};

import { applyGlobalFilters } from '../../utils/filterUtils';

interface VetPayoutsTableProps {
  data?: any[];
}

const VetPayoutsTable: React.FC<VetPayoutsTableProps> = ({ data }) => {
  const { dateRange, stateFilter, serviceFilter } = useFilters();

  const filteredData = data && data.length > 0 ? applyGlobalFilters(data, { dateRange, stateFilter, serviceFilter }) : [];
  const payouts = filteredData.slice(0, 10);
  const isEmpty = payouts.length === 0;

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
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Veterinarian Payouts</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            Export CSV
          </button>
        </div>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Filtered by: {dateRange} • {stateFilter}
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Vet Name</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>District</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Total Earnings</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Humal Comm.</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Net Earning</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Payout Status</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Payout Date</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Payout Mode</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>UTR / Ref No</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={10} style={{ padding: '40px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No payout data available. Please check your backend connection.
              </td>
            </tr>
          ) : (
            payouts.map((p: any) => {
              const sKey = (p.status || 'PENDING').toUpperCase();
              const s = STATUS_MAP[sKey] || STATUS_MAP.PENDING;
              
              const totalEarnings = p.amount ? Math.round(p.amount / 0.8) : 0; // Assuming 80% split
              const humalComm = totalEarnings - p.amount;
              const netEarning = p.amount;

              return (
                <tr key={p.id || p.transaction_id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '16px 8px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.vet_name || '—'}</td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{p.district || p.city || '—'}</td>
                  <td style={{ padding: '16px 8px', fontWeight: 500 }}>₹{totalEarnings.toLocaleString()}</td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>₹{humalComm.toLocaleString()}</td>
                  <td style={{ padding: '16px 8px', fontWeight: 600, color: '#10b981' }}>₹{netEarning.toLocaleString()}</td>
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{ color: s.text, backgroundColor: s.bg, padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {s.label}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{p.processed_at?.slice(0, 10) || p.created_at?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{p.method || p.payment_method || 'Bank Transfer'}</td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.utr || p.reference_no || '—'}</td>
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <div>Showing 1 to {payouts.length} of {data?.length || 0} payouts</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ padding: '4px 8px', border: '1px solid var(--border-color)', background: 'var(--card-white)', borderRadius: '4px', cursor: 'pointer' }}>&lt;</button>
          <span>1</span>
          <button style={{ padding: '4px 8px', border: '1px solid var(--border-color)', background: 'var(--card-white)', borderRadius: '4px', cursor: 'pointer' }}>2</button>
          <button style={{ padding: '4px 8px', border: '1px solid var(--border-color)', background: 'var(--card-white)', borderRadius: '4px', cursor: 'pointer' }}>3</button>
          <span>...</span>
          <button style={{ padding: '4px 8px', border: '1px solid var(--border-color)', background: 'var(--card-white)', borderRadius: '4px', cursor: 'pointer' }}>&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default VetPayoutsTable;
