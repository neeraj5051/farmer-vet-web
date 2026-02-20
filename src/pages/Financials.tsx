import { ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPayments, getPayouts } from '../services/adminService';

const Financials = () => {
    const [activeTab, setActiveTab] = useState<'payments' | 'payouts'>('payments');
    const [payments, setPayments] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [paymentsData, payoutsData] = await Promise.all([
                    getPayments(),
                    getPayouts()
                ]);
                setPayments(paymentsData);
                setPayouts(payoutsData);
            } catch (error) {
                console.error("Failed to fetch financials", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === id ? '#dcfce7' : 'transparent',
                color: activeTab === id ? '#166534' : '#6b7280',
                borderBottom: activeTab === id ? '2px solid #16a34a' : '2px solid transparent',
                borderRadius: '0.5rem 0.5rem 0 0',
                fontWeight: 600
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Financial Management</h1>

            <div style={{ borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <TabButton id="payments" label="Received Payments" icon={ArrowDownLeft} />
                <TabButton id="payouts" label="Vet Payouts" icon={ArrowUpRight} />
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={32} color="#16a34a" />
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                                    {activeTab === 'payments' ? 'Payer' : 'Recipient (Vet)'}
                                </th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                                {activeTab === 'payments' && (
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Breakdown</th>
                                )}
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Transaction ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'payments' ? payments : payouts).map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151' }}>
                                        {new Date(item.created_at).toLocaleDateString()} <br />
                                        <small style={{ color: '#9ca3af' }}>{new Date(item.created_at).toLocaleTimeString()}</small>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#111827', fontWeight: 500 }}>
                                        {activeTab === 'payments' ? item.payer_name : `Dr. ${item.vet_name}`}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: activeTab === 'payments' ? '#059669' : '#dc2626' }}>
                                        {activeTab === 'payments' ? '+' : '-'} ₹{item.amount.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor: (item.status === 'COMPLETED' || item.status === 'PROCESSED') ? '#d1fae5' : '#fef3c7',
                                            color: (item.status === 'COMPLETED' || item.status === 'PROCESSED') ? '#065f46' : '#92400e'
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    {activeTab === 'payments' && (
                                        <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                                            Vet: ₹{item.vet_share?.toFixed(1)} <br />
                                            Plat: ₹{item.platform_share?.toFixed(1)}
                                        </td>
                                    )}
                                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                        {item.transaction_id || '-'}
                                    </td>
                                </tr>
                            ))}
                            {(activeTab === 'payments' ? payments : payouts).length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Financials;
