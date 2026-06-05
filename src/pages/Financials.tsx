import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPayments, getPayouts } from '../services/adminService';
import './AdminPages.css';

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
            className={`ap-tab ${activeTab === id ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="ap-page">
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Financial Management</h1>
                    <p className="ap-subtitle">Track payments received and payouts made to vets.</p>
                </div>
            </div>

            <div className="ap-tabs">
                <TabButton id="payments" label="Received Payments" icon={ArrowDownLeft} />
                <TabButton id="payouts" label="Vet Payouts" icon={ArrowUpRight} />
            </div>

            {loading ? (
                <div className="ap-loading">
                    <div className="ap-spin">⏳</div>
                    <p>Loading financials...</p>
                </div>
            ) : (
                <div className="ap-table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>{activeTab === 'payments' ? 'Payer' : 'Recipient (Vet)'}</th>
                                <th>Amount</th>
                                <th>Status</th>
                                {activeTab === 'payments' && (
                                    <th>Breakdown</th>
                                )}
                                <th>Transaction ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'payments' ? payments : payouts).map((item) => (
                                <tr key={item.id} className="ap-row">
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {new Date(item.created_at).toLocaleDateString()} <br />
                                        <small style={{ color: 'rgba(255, 255, 255, 0.4)' }}>{new Date(item.created_at).toLocaleTimeString()}</small>
                                    </td>
                                    <td className="ap-cell-bold">
                                        {activeTab === 'payments' ? item.payer_name : `Dr. ${item.vet_name}`}
                                    </td>
                                    <td className="ap-cell-bold" style={{ color: activeTab === 'payments' ? 'var(--accent-green)' : '#f87171' }}>
                                        {activeTab === 'payments' ? '+' : '-'} ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td>
                                        <span className="ap-badge" style={{
                                            backgroundColor: (item.status === 'COMPLETED' || item.status === 'PROCESSED') ? 'var(--accent-green-glow)' : 'rgba(245, 158, 11, 0.12)',
                                            color: (item.status === 'COMPLETED' || item.status === 'PROCESSED') ? 'var(--accent-green)' : '#fde68a',
                                            border: (item.status === 'COMPLETED' || item.status === 'PROCESSED') ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    {activeTab === 'payments' && (
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            Vet: ₹{item.vet_share?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <br />
                                            Plat: ₹{item.platform_share?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                        </td>
                                    )}
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace', opacity: 0.8 }}>
                                        {item.transaction_id || '—'}
                                    </td>
                                </tr>
                            ))}
                            {(activeTab === 'payments' ? payments : payouts).length === 0 && (
                                <tr>
                                    <td colSpan={activeTab === 'payments' ? 6 : 5} className="ap-empty">
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
