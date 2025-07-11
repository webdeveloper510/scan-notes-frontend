import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.fichedetravail.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const contactSupport = async payload => {
  try {
    const response = await API.post('users/contact-support', payload);
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: 'Something went wrong' };
  }
};
