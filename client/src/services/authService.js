import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.data) {
    localStorage.setItem('schedulo_user', JSON.stringify(response.data.data));
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.data) {
    localStorage.setItem('schedulo_user', JSON.stringify(response.data.data));
  }
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('schedulo_user');
};
