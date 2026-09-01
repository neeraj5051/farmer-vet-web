import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

interface ConsultationStatusChartProps {
  data?: { name: string; completed: number; live: number; cancelled: number; noShow: number; rescheduled: number }[];
}

const defaultData = [
  { name: '12 May', completed: 85, live: 25, cancelled: 12, noShow: 8, rescheduled: 5 },
  { name: '13 May', completed: 92, live: 30, cancelled: 10, noShow: 6, rescheduled: 7 },
  { name: '14 May', completed: 78, live: 22, cancelled: 15, noShow: 9, rescheduled: 4 },
  { name: '15 May', completed: 110, live: 35, cancelled: 8, noShow: 5, rescheduled: 6 },
  { name: '16 May', completed: 145, live: 28, cancelled: 11, noShow: 7, rescheduled: 3 },
  { name: '17 May', completed: 160, live: 40, cancelled: 9, noShow: 4, rescheduled: 8 },
  { name: '18 May', completed: 130, live: 32, cancelled: 13, noShow: 6, rescheduled: 5 },
];

const COLORS = {
  completed: '#10b981',
  live: '#3b82f6',
  cancelled: '#ef4444',
  noShow: '#f59e0b',
  rescheduled: '#8b5cf6',
};

const ConsultationStatusChart: React.FC<ConsultationStatusChartProps> = ({ data }) => {
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
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>Consultation Status</h3>
      
      <div style={{ width: '100%', height: '290px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Legend 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }}
            />
            <Bar dataKey="completed" stackId="a" fill={COLORS.completed} name="Completed" radius={[0, 0, 0, 0]}>
              <LabelList dataKey="completed" position="center" fill="#ffffff" fontSize={11} fontWeight={700} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
            </Bar>
            <Bar dataKey="live" stackId="a" fill={COLORS.live} name="Live">
              <LabelList dataKey="live" position="center" fill="#ffffff" fontSize={11} fontWeight={700} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
            </Bar>
            <Bar dataKey="noShow" stackId="a" fill={COLORS.noShow} name="No Show" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="noShow" position="center" fill="#ffffff" fontSize={11} fontWeight={700} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConsultationStatusChart;
