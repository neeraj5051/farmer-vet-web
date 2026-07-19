import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BookingTrendsChartProps {
  data?: { name: string; bookings: number }[];
}

const defaultData = [
  { name: 'Mon', bookings: 120 },
  { name: 'Tue', bookings: 140 },
  { name: 'Wed', bookings: 130 },
  { name: 'Thu', bookings: 150 },
  { name: 'Fri', bookings: 180 },
  { name: 'Sat', bookings: 200 },
  { name: 'Sun', bookings: 190 },
];

const BookingTrendsChart: React.FC<BookingTrendsChartProps> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : defaultData;
  const isBarChart = data && data.length > 0 && data.length <= 5;

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
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              />
              <Bar dataKey="bookings" fill="var(--humal-green)" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="var(--humal-green)" 
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--humal-green)', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: 'var(--humal-green)', strokeWidth: 0 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BookingTrendsChart;
