import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

interface BookingTrendsChartProps {
  data?: { name: string; bookings: number; online?: number; ai?: number; vaccination?: number; inPerson?: number }[];
}

const defaultData = [
  { name: 'Mon', bookings: 120, online: 60, ai: 30, vaccination: 20, inPerson: 10 },
  { name: 'Tue', bookings: 140, online: 70, ai: 35, vaccination: 25, inPerson: 10 },
  { name: 'Wed', bookings: 130, online: 65, ai: 30, vaccination: 20, inPerson: 15 },
  { name: 'Thu', bookings: 150, online: 75, ai: 40, vaccination: 20, inPerson: 15 },
  { name: 'Fri', bookings: 180, online: 90, ai: 45, vaccination: 30, inPerson: 15 },
  { name: 'Sat', bookings: 200, online: 100, ai: 50, vaccination: 35, inPerson: 15 },
  { name: 'Sun', bookings: 190, online: 95, ai: 45, vaccination: 35, inPerson: 15 },
];

const COLORS = {
  online: '#10b981',      // Green
  ai: '#8b5cf6',          // Purple
  vaccination: '#f59e0b', // Orange
  inPerson: '#3b82f6',    // Blue
};

const BookingTrendsChart: React.FC<BookingTrendsChartProps> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : defaultData;
  const isBarChart = data && data.length > 0 && data.length <= 8;

  const renderLegend = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', fontSize: '0.75rem', paddingTop: '12px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS.online }} />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Online Consultation</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS.ai }} />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>AI / Insemination</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS.vaccination }} />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Vaccination</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS.inPerson }} />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>In-person Visit</span>
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: 'var(--card-white)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      height: '400px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Booking Trends</h3>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {isBarChart ? (
            <BarChart data={chartData} margin={{ top: 20, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend content={renderLegend} />
              <Bar dataKey="online" stackId="a" fill={COLORS.online} name="Online Consultation">
                <LabelList dataKey="online" position="center" fill="#ffffff" fontSize={11} fontWeight={700} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
              </Bar>
              <Bar dataKey="ai" stackId="a" fill={COLORS.ai} name="AI / Insemination">
                <LabelList dataKey="ai" position="center" fill="#ffffff" fontSize={11} fontWeight={700} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
              </Bar>
              <Bar dataKey="vaccination" stackId="a" fill={COLORS.vaccination} name="Vaccination">
                <LabelList dataKey="vaccination" position="center" fill="#ffffff" fontSize={11} fontWeight={700} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
              </Bar>
              <Bar dataKey="inPerson" stackId="a" fill={COLORS.inPerson} name="In-person Visit" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="inPerson" position="center" fill="#ffffff" fontSize={11} fontWeight={700} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
                <LabelList dataKey="bookings" position="top" fill="var(--text-primary)" fontSize={12} fontWeight={700} dy={-6} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 20, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend content={renderLegend} />
              <Line 
                type="monotone" 
                dataKey="online" 
                stroke={COLORS.online} 
                name="Online Consultation"
                strokeWidth={2.5}
                dot={{ r: 3, fill: COLORS.online, strokeWidth: 1.5, stroke: '#fff' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              >
                <LabelList dataKey="online" position="top" fill={COLORS.online} fontSize={10} fontWeight={700} dy={-4} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
              </Line>
              <Line 
                type="monotone" 
                dataKey="ai" 
                stroke={COLORS.ai} 
                name="AI / Insemination"
                strokeWidth={2.5}
                dot={{ r: 3, fill: COLORS.ai, strokeWidth: 1.5, stroke: '#fff' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              >
                <LabelList dataKey="ai" position="top" fill={COLORS.ai} fontSize={10} fontWeight={700} dy={-4} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
              </Line>
              <Line 
                type="monotone" 
                dataKey="vaccination" 
                stroke={COLORS.vaccination} 
                name="Vaccination"
                strokeWidth={2.5}
                dot={{ r: 3, fill: COLORS.vaccination, strokeWidth: 1.5, stroke: '#fff' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              >
                <LabelList dataKey="vaccination" position="top" fill={COLORS.vaccination} fontSize={10} fontWeight={700} dy={-4} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
              </Line>
              <Line 
                type="monotone" 
                dataKey="inPerson" 
                stroke={COLORS.inPerson} 
                name="In-person Visit"
                strokeWidth={2.5}
                dot={{ r: 3, fill: COLORS.inPerson, strokeWidth: 1.5, stroke: '#fff' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              >
                <LabelList dataKey="inPerson" position="top" fill={COLORS.inPerson} fontSize={10} fontWeight={700} dy={-4} formatter={(v: any) => (Number(v) > 0 ? v : '')} />
              </Line>
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BookingTrendsChart;
