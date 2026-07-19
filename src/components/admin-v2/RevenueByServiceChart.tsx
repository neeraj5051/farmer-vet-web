import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RevenueByServiceChartProps {
  data?: { name: string; revenue: number; color: string }[];
}

const defaultData = [
  { name: 'Online Consultation', revenue: 52100, color: '#3b82f6' },
  { name: 'In-person Visit', revenue: 34800, color: '#8b5cf6' },
  { name: 'Artificial Insemination', revenue: 24700, color: '#f59e0b' },
  { name: 'Vaccination', revenue: 12900, color: '#10b981' },
];

const RevenueByServiceChart: React.FC<RevenueByServiceChartProps> = ({ data }) => {
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
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 24px 0' }}>Revenue by Service</h3>
      <div style={{ width: '100%', height: '290px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 30, left: 10 }} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} 
              dy={10}
              interval={0}
              angle={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} 
              tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueByServiceChart;
