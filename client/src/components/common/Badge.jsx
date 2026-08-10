import React from 'react';
import { getStatusBadgeStyle } from '../../utils/formatters';

export const StatusBadge = ({ status }) => {
  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase ${badgeStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
};
