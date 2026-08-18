import React from 'react';

export const MetricCard = ({ title, value, icon: Icon, color = '#3b82f6' }) => {
  return (
    <div className="metric-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="metric-header">
        <span>{title}</span>
        {Icon && <Icon size={20} style={{ color }} />}
      </div>
      <div className="metric-value">{value}</div>
    </div>
  );
};
