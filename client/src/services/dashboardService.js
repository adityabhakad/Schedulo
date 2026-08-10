import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getAppointmentsSummary = async () => {
  const response = await api.get('/dashboard/appointments-summary');
  return response.data;
};

export const getServicePerformance = async () => {
  const response = await api.get('/dashboard/service-performance');
  return response.data;
};

export const getStaffWorkload = async () => {
  const response = await api.get('/dashboard/staff-workload');
  return response.data;
};
