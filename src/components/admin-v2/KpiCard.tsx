import React from 'react';
import './KpiCard.css';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number; // percentage
    isPositive: boolean;
    label: string;
  };
  highlightColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, trend, highlightColor }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <div className="kpi-icon" style={highlightColor ? { color: highlightColor, backgroundColor: `${highlightColor}15` } : {}}>
          {icon}
        </div>
      </div>
      <div className="kpi-content">
        <div className="kpi-value">{value}</div>
        <div className="kpi-title">{title}</div>
        
        {(trend || subtitle) && (
          <div className="kpi-footer">
            {trend && (
              <span className={`kpi-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && (
              <span className="kpi-subtitle">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
