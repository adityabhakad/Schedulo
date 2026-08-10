export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const displayMinutes = String(m || 0).padStart(2, '0');
  return `${displayHour}:${displayMinutes} ${period}`;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'COMPLETED':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'CANCELLED':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'REJECTED':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    case 'RESCHEDULED':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
};
