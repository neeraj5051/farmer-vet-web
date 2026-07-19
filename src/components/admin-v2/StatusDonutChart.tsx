import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatusDonutChartProps {
  data?: { name: any; value: any; count: number; color: string }[];
  title: string;
  centerText?: string;
  centerSubtext?: string;
}

const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ 
  data = [], 
  title,
  centerText,
  centerSubtext
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--card-white)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      height: '380px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>{title}</h3>
      
      {data.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          No data available
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ flex: 1, height: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={((value: any, name: any) => [`${value}%`, name]) as any}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label (optional) */}
            {centerText && (
              <div style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{centerText}</div>
                {centerSubtext && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{centerSubtext}</div>}
              </div>
            )}
          </div>
          
          <div style={{ flex: '0 0 170px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0, marginTop: 4 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {item.count.toLocaleString()} ({item.value}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDonutChart;
