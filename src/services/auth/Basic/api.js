import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.fichedetravail.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add token to each request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

export const contactSupport = async (payload) => {
  try {
    const response = await API.post('users/contact-support', payload);
    return response.data;
  } catch (error) {
    return error?.response?.data || { message: 'Something went wrong' };
  }
};

export const freeTrialCheck = async () => {
  try {
    const response = await API.get('/free-trial');
    return response.data;
  } catch (error) {
    return error?.response?.data || { message: 'Something went wrong' };
  }
};
export const getHistory = async () => {
  try {
    const response = await API.get('/user-history');
    return response.data;
  } catch (error) {
    return error?.response?.data || { message: 'Something went wrong' };
  }
};
export const updateHistory = async (id, payload) => {
  try {
    const response = await API.put(`/edit-history/`, payload);
    return response.data;
  } catch (error) {
    return error?.response?.data || { message: 'Something went wrong' };
  }
}
export const deleteHistory = async (payload) => {
  try {
    const response = await API.delete(`/delete-history/`, {
      data: payload,
    });
    return response;
  } catch (error) {
    return error?.response || { status: 500, data: { message: 'Something went wrong' } };
  }
};
