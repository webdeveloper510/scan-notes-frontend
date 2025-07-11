import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, TextField, Switch, Button, FormControlLabel } from '@material-ui/core';
import IntlMessages from '../../../utils/IntlMessages';
import { AuhMethods } from '../../../../services/auth';
import ContentLoader from '../../ContentLoader';
import { alpha, makeStyles } from '@material-ui/core/styles';
import CmtImage from '../../../../@coremat/CmtImage';
import Typography from '@material-ui/core/Typography';
import { CurrentAuthMethod } from '../../../constants/AppConstants';
import AuthWrapper from './AuthWrapper';
import { NavLink } from 'react-router-dom';
import { KeyboardDatePicker } from '@material-ui/pickers';

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
      width: props => (props.variant === 'default' ? '50%' : '100%'),
      order: 1,
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
  textCapital: {
    textTransform: 'capitalize',
  },
  textAcc: {
    textAlign: 'center',
    '& a': {
      marginLeft: 4,
    },
  },
  alrTextRoot: {
    textAlign: 'center',
    [theme.breakpoints.up('sm')]: {
      textAlign: 'right',
    },
  },
}));

//variant = 'default', 'standard', 'bgColor'
const SignUp = ({ method = CurrentAuthMethod, variant = 'default', wrapperVariant = 'default' }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [school, setSchool] = useState('');
  const [teacher, setTeacher] = useState(false);
  const [software, setSoftware] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const classes = useStyles({ variant });

  const onSubmit = () => {
    dispatch(
      AuhMethods[method].onRegister({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        address,
        birthday,
        school,
        teacher,
        software,
      }),
    );
  };

  return (
    <AuthWrapper variant={wrapperVariant}>
      {variant === 'default' ? (
        <Box className={classes.authThumb}>
          <CmtImage src={'/images/auth/sign-up-img.png'} />
        </Box>
      ) : null}
      <Box className={classes.authContent}>
        <Box mb={7}>
          <CmtImage src={'/images/logo.png'} />
        </Box>
        <Typography component="div" variant="h1" className={classes.titleRoot}>
          <IntlMessages id="appModule.createAccount" />
        </Typography>
        <form>
          <Box mb={2}>
            <TextField
              label={<IntlMessages id="appModule.email" />}
              fullWidth
              required
              onChange={event => setEmail(event.target.value)}
              defaultValue={email}
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
            />
          </Box>
          <Box mb={2}>
            <TextField
              type="password"
              label={<IntlMessages id="appModule.password" />}
              required
              fullWidth
              onChange={event => setPassword(event.target.value)}
              defaultValue={password}
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label={<IntlMessages id="appModule.firstName" />}
              required
              fullWidth
              onChange={event => setFirstName(event.target.value)}
              defaultValue={firstName}
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label={<IntlMessages id="appModule.lastName" />}
              required
              fullWidth
              onChange={event => setLastName(event.target.value)}
              defaultValue={lastName}
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label={<IntlMessages id="appModule.phoneNumber" />}
              required
              fullWidth
              onChange={event => setPhoneNumber(event.target.value)}
              defaultValue={phoneNumber}
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label={<IntlMessages id="appModule.address" />}
              required
              fullWidth
              onChange={event => setAddress(event.target.value)}
              defaultValue={address}
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
            />
          </Box>
          <Box mb={2}>
            <KeyboardDatePicker
              disableToolbar
              required
              variant="inline"
              format="MM/DD/yyyy"
              margin="normal"
              id="birthday"
              label={<IntlMessages id="appModule.birthday" />}
              value={birthday}
              onChange={setBirthday}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label={<IntlMessages id="appModule.school" />}
              fullWidth
              onChange={event => setSchool(event.target.value)}
              defaultValue={school}
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
            />
          </Box>
          <Box mb={2}>
            {/* <TextField
              label={<IntlMessages id="appModule.teacher" />}
              required
              fullWidth
              onChange={event => setTeacher(event.target.value)}
              defaultValue={teacher}
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
            /> */}
            <FormControlLabel
              value="start"
              control={<Switch checked={teacher} onChange={event => setTeacher(event.target.checked)} name="teacher" />}
              label={<IntlMessages id="appModule.teacher" />}
              labelPlacement="start"
            />
          </Box>
          <Box mb={2}>
            <TextField
              label={<IntlMessages id="appModule.software" />}
              required
              fullWidth
              onChange={event => setSoftware(event.target.value)}
              defaultValue={software}
              margin="normal"
              variant="outlined"
              className={classes.textFieldRoot}
            />
          </Box>
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent={{ sm: 'space-between' }}
            mb={3}>
            <Box mb={{ xs: 2, sm: 0 }}>
              <Button onClick={onSubmit} variant="contained" color="primary">
                <IntlMessages id="appModule.regsiter" />
              </Button>
            </Box>

            <Typography className={classes.alrTextRoot}>
              <NavLink to="/signin">
                <IntlMessages id="signUp.alreadyMember" />
              </NavLink>
            </Typography>
          </Box>
        </form>

        <Box mb={3}>{dispatch(AuhMethods[method].getSocialMediaIcons())}</Box>

        <Typography className={classes.textAcc}>
          Have an account?
          <NavLink to="/signin">Sign In</NavLink>
        </Typography>
        <ContentLoader />
      </Box>
    </AuthWrapper>
  );
};

export default SignUp;
