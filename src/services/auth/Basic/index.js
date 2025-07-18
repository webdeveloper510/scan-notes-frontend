import { fetchError, fetchStart, fetchSuccess } from '../../../redux/actions';
import { setAuthUser, setForgetPassMailSent, updateLoadUser } from '../../../redux/actions/Auth';
import React from 'react';

const BasicAuth = {
  onRegister: ({ name, email, password }) => {
    return dispatch => {
      dispatch(fetchStart());

      setTimeout(() => {
        dispatch(fetchSuccess());
        const user = { name: name, email: email, password: password };
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(setAuthUser(user));
      }, 300);
    };
  },

  onLogin: ({ email, password }) => {
    return dispatch => {
      try {
        dispatch(fetchStart());

        setTimeout(() => {
          const user = { name: 'Admin', email: email, password: password };
          dispatch(fetchSuccess());
          localStorage.setItem('user', JSON.stringify(user));
          dispatch(setAuthUser(user));
        }, 300);
      } catch (error) {
        dispatch(fetchError(error.message));
      }
    };
  },
  onLogout: () => {
    return dispatch => {
      dispatch(fetchStart());

      setTimeout(() => {
        dispatch(fetchSuccess());
        localStorage.removeItem('user');
        dispatch(setAuthUser(null));
      }, 300);
    };
  },

  getAuthUser: (loaded = false) => {
    return dispatch => {
      dispatch(fetchStart());
      dispatch(updateLoadUser(loaded));

      setTimeout(() => {
        dispatch(fetchSuccess());
        dispatch(setAuthUser(JSON.parse(localStorage.getItem('user'))));
      }, 300);
    };
  },

  onForgotPassword: ({ email }) => {
    return async dispatch => {
      dispatch(fetchStart());
      try {
        await axios.post('http://localhost:8000/reset-request', { email });
        dispatch(setForgetPassMailSent(true));
        dispatch(fetchSuccess());
      } catch (error) {
        dispatch(fetchError(error.response?.data?.message || 'Failed to send reset email'));
      }
    };
  },

  // ✅ Reset New Password with token
  onResetPassword: ({ token, password }) => {
    return async dispatch => {
      dispatch(fetchStart());
      try {
        await axios.post(`http://localhost:8000/reset-password/${token}/`, { password });
        dispatch(fetchSuccess());
      } catch (error) {
        dispatch(fetchError(error.response?.data?.message || 'Password reset failed'));
      }
    };
  },
  getSocialMediaIcons: () => {
    return <React.Fragment> </React.Fragment>;
  },
};

export default BasicAuth;
