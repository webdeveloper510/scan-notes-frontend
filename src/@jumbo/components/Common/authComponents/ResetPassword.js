import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Button, TextField, Typography } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { alpha } from '@material-ui/core/styles';

import toast from 'react-hot-toast';

import CmtImage from '../../../../@coremat/CmtImage';
import { AuhMethods } from '../../../../services/auth';
import ContentLoader from '../../ContentLoader';
import { CurrentAuthMethod } from '../../../constants/AppConstants';
import AuthWrapper from './AuthWrapper';

const useStyles = makeStyles(theme => ({
  authThumb: {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    [theme.breakpoints.up('md')]: {
      width: '50%',
      order: 2,
    },
  },
  authContent: {
    padding: 30,
    [theme.breakpoints.up('md')]: {
      order: 1,
      width: props => (props.variant === 'default' ? '50%' : '100%'),
    },
    [theme.breakpoints.up('xl')]: {
      padding: 50,
    },
  },
  titleRoot: {
    marginBottom: 14,
    color: theme.palette.text.primary,
  },
  textFieldRoot: {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(theme.palette.common.dark, 0.12),
    },
  },
}));

const ResetPassword = ({ method = CurrentAuthMethod, variant = 'default', wrapperVariant = 'default' }) => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles({ variant });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await dispatch(AuhMethods[method].onResetPassword({ token, password: newPassword }));
      toast.success('Password reset successful!');
      history.push('/signin');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  return (
    <AuthWrapper variant={wrapperVariant}>
      {variant === 'default' && (
        <div className={classes.authThumb}>
          <CmtImage src={'/images/auth/forgot-img.png'} />
        </div>
      )}
      <div className={classes.authContent}>
        <div className={'mb-7'}>
          <CmtImage src={'/images/logo.png'} />
        </div>
        <Typography component="div" variant="h1" className={classes.titleRoot}>
          Reset Password
        </Typography>
        <form>
          <div className={'mb-5'}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <div className={'mb-5'}>
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className={'mb-5'}>
            <Button onClick={handleSubmit} variant="contained" color="primary" fullWidth>
              Submit
            </Button>
          </div>
        </form>
        <ContentLoader />
      </div>
    </AuthWrapper>
  );
};

export default ResetPassword;
