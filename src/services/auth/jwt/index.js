import { fetchError, fetchStart, fetchSuccess } from '../../../redux/actions';
import { setAuthUser, setForgetPassMailSent, updateLoadUser } from '../../../redux/actions/Auth';
import React from 'react';
import axios from './config';

const JWTAuth = {
  onRegister: ({ email, password, firstName, lastName, phoneNumber, address, birthday, school, teacher, software }) => {
    return dispatch => {
      dispatch(fetchStart());
      axios
        .post('users/register', {
          email: email,
          password: password,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          address: address,
          birthday: (birthday ? birthday : new Date()).toISOString().substring(0, 10),
          school: school,
          teacher: teacher,
          software: software,
        })
        .then(({ data }) => {
          if (data.result) {
            localStorage.setItem('token', data.token.access_token);
            axios.defaults.headers.common['Authorization'] = data.token.access_token;
            dispatch(fetchSuccess());
            dispatch(JWTAuth.getAuthUser(true, data.token.access_token));
          } else {
            dispatch(fetchError(data.error));
          }
        })
        .catch(function(error) {
          dispatch(fetchError(error.message));
        });
    };
  },

  onLogin: ({ email, password }) => {
    return dispatch => {
      try {
        dispatch(fetchStart());
        axios
          .post('users/login', {
            email: email,
            password: password,
          })
          .then(({ data }) => {
            if (data.success) {
              localStorage.setItem('token', data.token);
              axios.defaults.headers.common['Authorization'] = data.token;
              dispatch(fetchSuccess());
              dispatch(JWTAuth.getAuthUser(true, data.token));
            } else {
              dispatch(fetchError(data.error));
            }
          })
          .catch(function(error) {
            dispatch(fetchError(error.message));
          });
      } catch (error) {
        dispatch(fetchError(error.message));
      }
    };
  },
  onLogout: () => {
    return dispatch => {
      dispatch(fetchStart());
      axios
        .post('users/logout')
        .then(({ data }) => {
          if (data.success) {
            dispatch(fetchSuccess());
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            dispatch(setAuthUser(null));
          } else {
            dispatch(fetchError(data.error));
          }
        })
        .catch(function(error) {
          dispatch(fetchError(error.message));
        });
    };
  },

  getAuthUser: (loaded = false, token) => {
    return dispatch => {
      if (!token) {
        const token = localStorage.getItem('token');
        if (token) axios.defaults.headers.common['Authorization'] = token;
      }
      dispatch(fetchStart());
      dispatch(updateLoadUser(loaded));
      axios
        .post('users/me')
        .then(({ data }) => {
          if (data.success) {
            dispatch(fetchSuccess());
            dispatch(setAuthUser(data.user));
          } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            dispatch(updateLoadUser(true));
          }
        })
        .catch(function(error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          dispatch(updateLoadUser(true));
        });
    };
  },

  onForgotPassword: ({ email }) => {
    return async dispatch => {
      dispatch(fetchStart());
      try {
        await axios.post('users/reset-request', { email });
        dispatch(setForgetPassMailSent(true));
        dispatch(fetchSuccess());
      } catch (error) {
        dispatch(fetchError(error.response?.data?.message || 'Failed to send reset email'));
      }
    };
  },

  // ✅ Reset New Password with token
  onResetPassword: ({ token, new_password, confirm_password }) => {
    return async dispatch => {
      dispatch(fetchStart());
      try {
        await axios.post(`users/reset-password/${token}/`, { new_password, confirm_password });
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

export default JWTAuth;
