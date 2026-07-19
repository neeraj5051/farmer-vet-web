import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PaymentMethodsChartProps {
  data?: { name: any; value: any; amount: number; color: string }[];
}

const defaultData = [
  { name: 'UPI', value: 58, amount: 72216, color: '#10b981' },
  { name: 'Cards', value: 24, amount: 29875, color: '#3b82f6' },
  { name: 'Net Banking', value: 12, amount: 14934, color: '#8b5cf6' },
  { name: 'Wallet', value: 6, amount: 7535, color: '#f59e0b' },
];

const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div style={{
      backgroundColor: 'var(--card-white)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      height: '380px'
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 24px 0' }}>Payment Methods</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', height: '280px' }}>
        {/* Donut Chart */}
        <div style={{ flex: 1, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                formatter={((value: any, name: any) => [`${value}%`, name]) as any}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div style={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {chartData.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {item.value}% (₹{item.amount.toLocaleString()})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsChart;
