import React from 'react';
import { MoreHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: '#dcfce7', text: '#10b981' },
  SUCCESS: { bg: '#dcfce7', text: '#10b981' },
  PROCESSED: { bg: '#dcfce7', text: '#10b981' },
  FAILED: { bg: '#fee2e2', text: '#ef4444' },
  PENDING: { bg: '#fef3c7', text: '#f59e0b' },
  PROCESSING: { bg: '#fef3c7', text: '#f59e0b' },
  REFUNDED: { bg: '#f3f4f6', text: '#6b7280' },
};

interface TransactionsTableProps {
  data?: any[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ data }) => {
  const { dateRange, stateFilter, districtFilter } = useFilters();

  const transactions = data && data.length > 0 ? data.slice(0, 10) : [];
  const isEmpty = transactions.length === 0;

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
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>All Transactions</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            Export CSV
          </button>
        </div>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Filtered by: {dateRange} • {stateFilter} • {districtFilter}
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Transaction ID</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Booking ID</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Farmer</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Vet</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Service</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>District</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Amount</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Method</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Date & Time</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}></th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={11} style={{ padding: '40px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No transaction data available. Please check your backend connection.
              </td>
            </tr>
          ) : (
            transactions.map((txn: any) => {
              const statusKey = (txn.status || 'PENDING').toUpperCase();
              const badge = STATUS_BADGE[statusKey] || STATUS_BADGE.PENDING;
              const isOutgoing = (txn.type || '').toLowerCase().includes('payout') || (txn.type || '').toLowerCase().includes('refund');
              return (
                <tr key={txn.id || txn.transaction_id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '16px 8px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {(txn.transaction_id || txn.id || '—').slice(0, 16)}
                  </td>
                  <td style={{ padding: '16px 8px', fontFamily: 'monospace', fontSize: '0.75rem' }}>{txn.booking_id?.slice(0, 13) || '—'}</td>
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isOutgoing ? <ArrowUpRight size={14} color="#ef4444" /> : <ArrowDownRight size={14} color="#10b981" />}
                      {txn.farmer_name || txn.payer_name || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px' }}>{txn.vet_name || '—'}</td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{txn.service_type || '—'}</td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{txn.district || '—'}</td>
                  <td style={{ padding: '16px 8px', fontWeight: 600 }}>₹{(txn.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{txn.payment_method || txn.method || 'UPI'}</td>
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{ color: badge.text, backgroundColor: badge.bg, padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {statusKey}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{txn.created_at?.slice(0, 16).replace('T', ', ') || txn.date || '—'}</td>
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
        <div>Showing 1 to {transactions.length} of {data?.length || 0} transactions</div>
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

export default TransactionsTable;
