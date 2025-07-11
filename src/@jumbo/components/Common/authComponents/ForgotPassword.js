import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Typography, Link } from '@material-ui/core';
import { alpha } from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';

import CmtImage from '../../../../@coremat/CmtImage';
import IntlMessages from '../../../utils/IntlMessages';
import ContentLoader from '../../ContentLoader';
import { CurrentAuthMethod } from '../../../constants/AppConstants';
import AuthWrapper from './AuthWrapper';
import toast from 'react-hot-toast';
import { AuhMethods } from '../../../../services/auth'; // ← this is BasicAuth.js

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

const ForgotPassword = ({ method = CurrentAuthMethod, variant = 'default', wrapperVariant = 'default' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles({ variant });

  const [email, setEmail] = useState('');

  const handleEmailSubmit = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      await dispatch(AuhMethods[method].onForgotPassword({ email }));
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error('Failed to send reset email');
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
          Forgot Password
        </Typography>

        <form>
          <div className={'mb-5'}>
            <TextField
              label={<IntlMessages id="appModule.email" />}
              fullWidth
              onChange={event => setEmail(event.target.value)}
              value={email}
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
            />
          </div>
          <div className={'mb-5'}>
            <Button onClick={handleEmailSubmit} variant="contained" color="primary">
              <IntlMessages id="appModule.resetPassword" />
            </Button>
          </div>

          <div>
            <Typography>
              Don't remember your email?
              <span className={'ml-2'}>
                <Link href="/contact-us">
                  <IntlMessages id="appModule.contactSupport" />
                </Link>
              </span>
            </Typography>
          </div>
        </form>

        <ContentLoader />
      </div>
    </AuthWrapper>
  );
};

export default ForgotPassword;
