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

interface RecentTransactionsTableProps {
  data?: any[];
}

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ data }) => {
  const { dateRange, stateFilter } = useFilters();

  const transactions = data && data.length > 0 ? data.slice(0, 5) : [];
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
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recent Transactions</h3>
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
        Filtered by: {dateRange} • {stateFilter}
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Transaction ID</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Payer</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Amount</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Method</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}>Date</th>
            <th style={{ padding: '12px 8px', fontWeight: 600 }}></th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={7} style={{ padding: '40px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No transaction data available. Please check your backend connection.
              </td>
            </tr>
          ) : (
            transactions.map((txn: any) => {
              const statusKey = (txn.status || 'PENDING').toUpperCase();
              const badge = STATUS_BADGE[statusKey] || STATUS_BADGE.PENDING;
              const isOutgoing = (txn.type || '').toLowerCase().includes('payout') || (txn.type || '').toLowerCase().includes('refund');
              return (
                <tr key={txn.id || txn.transaction_id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '16px 8px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    {(txn.transaction_id || txn.id || '—').slice(0, 16)}
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isOutgoing ? <ArrowUpRight size={14} color="#ef4444" /> : <ArrowDownRight size={14} color="#10b981" />}
                      {txn.payer_name || txn.vet_name || txn.farmer_name || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', fontWeight: 600 }}>₹{(txn.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: '16px 8px' }}>{txn.payment_method || txn.method || 'UPI'}</td>
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{ color: badge.text, backgroundColor: badge.bg, padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {statusKey}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{txn.created_at?.slice(0, 10) || txn.date || '—'}</td>
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

export default RecentTransactionsTable;
