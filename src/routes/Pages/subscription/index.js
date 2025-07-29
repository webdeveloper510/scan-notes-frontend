import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  CheckCircle,
  Star,
  CloudUpload,
  PhotoCamera,
  MusicNote,
  Speed,
  Security,
  Support
} from '@material-ui/icons';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
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
  title: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },
  subtitle: {
    opacity: 0.9,
    fontSize: '1.2rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    color: 'white',
  },
  loadingText: {
    marginTop: theme.spacing(2),
    opacity: 0.9,
  },
  errorAlert: {
    marginBottom: theme.spacing(3),
  },
  thriveCartContainer: {
    minHeight: '600px',
    position: 'relative',
  },
  hiddenWhileLoading: {
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
  },
  visibleAfterLoading: {
    opacity: 1,
    transition: 'opacity 0.3s ease-in-out',
  }
}));

const SubscriptionPage = () => {
  const classes = useStyles();
  const [isYearly, setIsYearly] = useState(false);
  const [thriveCartLoading, setThriveCartLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState('');
const { authUser } = useSelector(({ auth }) => auth);
  useEffect(() => {
     let timeoutId = null;
    let intervalId = null;
    let scriptLoadTimeout = null;

    // Set up the main timeout for loading failure
    timeoutId = setTimeout(() => {
      if (thriveCartLoading) {
        // setError('Having trouble loading subscription options. Please refresh the page or try again later.');
        setThriveCartLoading(false);
      }
    }, 15000);
    const script = document.createElement('script');
    script.src = "//tinder.thrivecart.com/embed/v2/thrivecart.js";
    script.async = true;
    script.id = "tc-lirelamusique-32-J0I18V";
    
    script.onload = () => {
      console.log('ThriveCart script loaded');
      
      scriptLoadTimeout = setTimeout(() => {
        if (thriveCartLoading) {
          console.log('ThriveCart script loaded but content not detected, checking for content...');
          intervalId = setInterval(() => {
            const thriveCartElement = document.querySelector('.tc-v2-embeddable-target');
            
            if (thriveCartElement) {
              const hasContent = 
                thriveCartElement.children.length > 0 && 
                (
                  thriveCartElement.querySelector('form') ||
                  thriveCartElement.querySelector('button') ||
                  thriveCartElement.querySelector('.tc-product') ||
                  thriveCartElement.querySelector('[class*="price"]') ||
                  thriveCartElement.textContent.trim().length > 50
                );
              
              if (hasContent) {
                console.log('ThriveCart content detected');
                setThriveCartLoading(false);
                clearInterval(intervalId);
                if (timeoutId) clearTimeout(timeoutId);
              }
            }
          }, 500); 
        }
      }, 1000);
    };
    
    script.onerror = () => {
      console.error('Failed to load ThriveCart script');
      setError('Failed to load subscription options. Please refresh the page.');
      setThriveCartLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
    };

    document.body.appendChild(script);
    const immediateIntervalId = setInterval(() => {
      const thriveCartElement = document.querySelector('.tc-v2-embeddable-target');
      
      if (thriveCartElement) {
        const hasContent = 
          thriveCartElement.children.length > 0 && 
          (
            thriveCartElement.querySelector('form') ||
            thriveCartElement.querySelector('button') ||
            thriveCartElement.querySelector('.tc-product') ||
            thriveCartElement.querySelector('[class*="price"]') ||
            thriveCartElement.textContent.trim().length > 50
          );
        
        if (hasContent) {
          console.log('ThriveCart content detected (immediate check)');
          setThriveCartLoading(false);
          clearInterval(immediateIntervalId);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    }, 1000);

    return () => {
      const existingScript = document.getElementById("tc-lirelamusique-32-J0I18V");
      if (existingScript) {
        existingScript.remove();
      }
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      if (scriptLoadTimeout) clearTimeout(scriptLoadTimeout);
      clearInterval(immediateIntervalId);
    };
  }, []);

  return (
    <Box className={classes.root}>
      <Container className={classes.container}>
        <Typography variant="h3" className={classes.header}>
          Choose Your Subscription Plan
        </Typography>

        {error && (
          <Alert severity="error" className={classes.errorAlert}>
            {error}
          </Alert>
        )}

        <div className={classes.thriveCartContainer}>
          {thriveCartLoading && (
            <div className={classes.loadingContainer}>
              <CircularProgress size={60} style={{ color: 'white' }} />
              <Typography variant="body1" className={classes.loadingText}>

              </Typography>
            </div>
          )}
          
          <div
            className={`tc-v2-embeddable-target ${
              thriveCartLoading ? classes.hiddenWhileLoading : classes.visibleAfterLoading
            }`}
            data-thrivecart-account="lirelamusique"
            data-thrivecart-tpl="v2"
            data-thrivecart-product="32"
            data-thrivecart-embeddable="tc-lirelamusique-32-J0I18V"
            data-thrivecart-customer-email={authUser?.email || ""}
          />
        </div>
      </Container>
    </Box>
  );
};

export default SubscriptionPage;