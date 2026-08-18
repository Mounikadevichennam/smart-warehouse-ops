import React from 'react';

export const StatusBadge = ({ type, value }) => {
  if (type === 'priority') {
    return <span className={`badge badge-${value}`}>{value}</span>;
  }
  return <span className={`badge badge-status badge-${value}`}>{value?.replace(/_/g, ' ')}</span>;
};
