import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  container: {
    maxWidth: '1200px',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    color: 'white',
  },
  thriveCartContainer: {
    minHeight: '600px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  iframe: {
    width: '100%',
    height: '1500px',
    border: 'none',
  },
}));

const SubscriptionPage = () => {
  const classes = useStyles();
  const { authUser } = useSelector(({ auth }) => auth);
  console.log("🚀 ~ SubscriptionPage ~ authUser:", authUser)

  const userEmail = encodeURIComponent(authUser?.email || '');
  const iframeSrc = `https://lirelamusique.thrivecart.com/fichedetravail/just-test-product/?passthrough[customer_email]=${userEmail}`;

  useEffect(() => {
    console.log("authUser.email:", authUser?.email);
    console.log("iframeSrc:", iframeSrc);
  }, [authUser?.email]);

  return (
    <Box className={classes.root}>
      <Container className={classes.container}>
        <Typography variant="h3" className={classes.header}>
          Choose Your Subscription Plan
        </Typography>

        <div className={classes.thriveCartContainer}>
          {authUser?.email ? (
            <iframe
              className={classes.iframe}
              src={iframeSrc}
              title="ThriveCart Checkout"
              allow="payment"
              scrolling="yes"
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <CircularProgress style={{ color: '#667eea' }} />
              <Typography style={{ color: '#333', marginTop: '10px' }}>
                Loading your checkout...
              </Typography>
            </div>
          )}
        </div>
      </Container>
    </Box>
  );
};

export default SubscriptionPage;
