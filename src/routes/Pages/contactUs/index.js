import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import IntlMessages from '@jumbo/utils/IntlMessages';
import toast from 'react-hot-toast';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(3),
  },
  formContainer: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
  headingTitle: {
    fontWeight: 700,
    fontSize: 28,
    marginBottom: theme.spacing(4),
    color: '#000',
  },
  textField: {
    width: '100%',
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#000',
      },
      '&:hover fieldset': {
        borderColor: '#2f3baa',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2f3baa',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#000',
      '&.Mui-focused': {
        color: '#2f3baa',
      },
    },
    '& input': {
      color: '#000',
    },
  },

  messageBox: {
    width: '100%',
    '& textarea': {
      color: '#000',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#000',
      },
      '&:hover fieldset': {
        borderColor: '#2f3baa',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2f3baa',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#000',
      '&.Mui-focused': {
        color: '#2f3baa',
      },
    },
  },

  submitBtn: {
    backgroundColor: '#2f3baa',
    color: '#fff',
    fontWeight: 600,
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(2),
    width: '100%',
    '&:hover': {
      backgroundColor: '#1f2a8a',
    },
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    textAlign: 'left',
    marginBottom: theme.spacing(1),
  },
}));

const ContactUs = () => {
  const classes = useStyles();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    reason: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (value.trim() !== '') {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validate()) return;

    toast.success('Message sent successfully!');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      reason: '',
      message: '',
    });
    setErrors({});
  };

  return (
    <Container className={classes.root}>
      <Box className={classes.formContainer}>
        <Typography className={classes.headingTitle}>
          <IntlMessages id="contact.title" />
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            name="firstName"
            label={<IntlMessages id="contact.firstName" />}
            variant="outlined"
            value={formData.firstName}
            onChange={handleChange}
            className={classes.textField}
          />
          {errors.firstName && <div className={classes.errorText}>{errors.firstName}</div>}

          <TextField
            name="lastName"
            label={<IntlMessages id="contact.lastName" />}
            variant="outlined"
            value={formData.lastName}
            onChange={handleChange}
            className={classes.textField}
          />
          {errors.lastName && <div className={classes.errorText}>{errors.lastName}</div>}

          <TextField
            name="email"
            label={<IntlMessages id="contact.email" />}
            type="email"
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            className={classes.textField}
          />
          {errors.email && <div className={classes.errorText}>{errors.email}</div>}

          <TextField
            select
            name="reason"
            label={<IntlMessages id="contact.reason" />}
            variant="outlined"
            value={formData.reason}
            onChange={handleChange}
            className={classes.textField}>
            <MenuItem value="question">
              <IntlMessages id="contact.reason.question" />
            </MenuItem>
            <MenuItem value="report">
              <IntlMessages id="contact.reason.report" />
            </MenuItem>
            <MenuItem value="billing">
              <IntlMessages id="contact.reason.billing" />
            </MenuItem>
            <MenuItem value="suggestion">
              <IntlMessages id="contact.reason.suggestion" />
            </MenuItem>
            <MenuItem value="other">
              <IntlMessages id="contact.reason.other" />
            </MenuItem>
          </TextField>
          {errors.reason && <div className={classes.errorText}>{errors.reason}</div>}

          <TextField
            name="message"
            label={<IntlMessages id="contact.message" />}
            placeholder="Write here..."
            value={formData.message}
            onChange={handleChange}
            variant="outlined"
            multiline
            rows={5}
            className={classes.messageBox}
          />
          {errors.message && <div className={classes.errorText}>{errors.message}</div>}

          <Button type="submit" className={classes.submitBtn}>
            <IntlMessages id="contact.send" />
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ContactUs;
