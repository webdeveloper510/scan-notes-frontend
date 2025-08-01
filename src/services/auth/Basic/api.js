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
export const registerUser = async ({
  email,
  password,
  first_name,
  last_name,
  phone_number,
  address,
  birthday,
  school,
  teacher,
  software,
}) => {
  try {
    const response = await API.post('users/register', {
      email,
      password,
      first_name,
      last_name,
      phone_number,
      address,
      birthday: (birthday || new Date()).toISOString().substring(0, 10),
      school,
      teacher,
      software,
    });
    return response.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: 'Something went wrong' };
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
}
export const titleComposerData =async (payload) => {
  try {
    const response = await API.post('/title-composer-update/', payload);
    return response.data;
  } catch (error) {
    return error?.response?.data || { message: 'Something went wrong' };
  }
}
export const getSubscription = async () => {
  try {
    const response = await API.get('/payment-detail');
    return response.data;
  } catch (error) {
    return error?.response?.data || { message: 'Something went wrong' };
  }
};
export const cancelSubscription = async (payload) => {
  try {
    const response = await API.post('/cancel-subscription/', payload);
    return response.data;
  } catch (error) {
    return error?.response?.data || { message: 'Something went wrong' };
  }
}