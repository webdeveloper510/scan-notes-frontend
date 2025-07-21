import React, { useState } from 'react';
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
  planCard: {
    height: '100%',
    position: 'relative',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    },
  },
  popularPlan: {
    border: '3px solid #ff6b6b',
    transform: 'scale(1.05)',
    '&:hover': {
      transform: 'scale(1.05) translateY(-8px)',
    },
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#ff6b6b',
    color: 'white',
    fontWeight: 'bold',
  },
  planHeader: {
    textAlign: 'center',
    paddingBottom: theme.spacing(2),
    borderBottom: '1px solid #eee',
  },
  planName: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
  planPrice: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    lineHeight: 1,
  },
  planPeriod: {
    color: theme.palette.text.secondary,
    fontSize: '1rem',
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: theme.palette.text.secondary,
    fontSize: '1.5rem',
    marginRight: theme.spacing(1),
  },
  discount: {
    backgroundColor: '#4caf50',
    color: 'white',
    fontSize: '0.8rem',
    marginLeft: theme.spacing(1),
  },
  featureList: {
    marginTop: theme.spacing(2),
  },
  featureItem: {
    paddingLeft: 0,
  },
  featureIcon: {
    color: '#4caf50',
    minWidth: 36,
  },
  selectButton: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5),
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  primaryButton: {
    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
    },
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.spacing(3),
    padding: theme.spacing(1),
  },
  toggleText: {
    color: 'white',
    margin: theme.spacing(0, 2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
  errorAlert: {
    marginBottom: theme.spacing(3),
  },
  guaranteeBadge: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
    padding: theme.spacing(1, 2),
    borderRadius: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
}));

const SubscriptionPage = () => {
  const classes = useStyles();
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState('');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      features: [
        'Upload up to 50 images per month',
        'Basic image recognition',
        'Standard processing speed',
        'Email support',
        'Access to mobile app'
      ],
      stripePriceId: isYearly ? 'price_basic_yearly' : 'price_basic_monthly',
      color: '#2196f3',
    },
    {
      id: 'pro',
      name: 'Professional',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      features: [
        'Upload up to 200 images per month',
        'Advanced image recognition',
        'Priority processing speed',
        'Advanced music notation features',
        'Priority email support',
        'Access to all platforms',
        'Export in multiple formats'
      ],
      stripePriceId: isYearly ? 'price_pro_yearly' : 'price_pro_monthly',
      popular: true,
      color: '#ff6b6b',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      features: [
        'Unlimited image uploads',
        'Premium image recognition',
        'Fastest processing speed',
        'Advanced AI features',
        'Custom integrations',
        'Dedicated account manager',
        'Phone & email support',
        'Custom branding options'
      ],
      stripePriceId: isYearly ? 'price_enterprise_yearly' : 'price_enterprise_monthly',
      color: '#9c27b0',
    },
  ];

  const handlePlanSelect = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan.id);
    setError('');

    try {
      // Call your backend API to create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planId: plan.id,
          billingPeriod: isYearly ? 'yearly' : 'monthly',
        }),
      });

      const { sessionId, url } = await response.json();

      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      setError('Failed to process payment. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const calculateSavings = (monthlyPrice, yearlyPrice) => {
    const yearlySavings = (monthlyPrice * 12) - yearlyPrice;
    const percentage = Math.round((yearlySavings / (monthlyPrice * 12)) * 100);
    return { amount: yearlySavings, percentage };
  };

  return (
    <div className={classes.root}>
      <Container className={classes.container}>
        <div className={classes.header}>
          <Typography variant="h2" className={classes.title}>
            Choose Your Plan
          </Typography>
          <Typography variant="h6" className={classes.subtitle}>
            Unlock the full potential of our image recognition platform
          </Typography>
        </div>

        {/* Billing Toggle */}
        <div className={classes.toggleContainer}>
          <Typography className={classes.toggleText}>Monthly</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isYearly}
                onChange={(e) => setIsYearly(e.target.checked)}
                color="primary"
              />
            }
            label=""
          />
          <Typography className={classes.toggleText}>
            Yearly
            <Chip 
              label="Save up to 20%" 
              size="small" 
              className={classes.discount}
              style={{ marginLeft: 8 }}
            />
          </Typography>
        </div>

        {error && (
          <Alert severity="error" className={classes.errorAlert}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {plans.map((plan) => {
            const savings = calculateSavings(plan.monthlyPrice, plan.yearlyPrice);
            const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isLoading = loading && selectedPlan === plan.id;

            return (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card 
                  className={`${classes.planCard} ${plan.popular ? classes.popularPlan : ''}`}
                >
                  {plan.popular && (
                    <Chip 
                      label="Most Popular" 
                      className={classes.popularBadge}
                      icon={<Star />}
                    />
                  )}
                  
                  <CardContent>
                    <div className={classes.planHeader}>
                      <Typography variant="h4" className={classes.planName}>
                        {plan.name}
                      </Typography>
                      
                      <Box display="flex" alignItems="baseline" justifyContent="center">
                        {isYearly && (
                          <Typography className={classes.originalPrice}>
                            ${(plan.monthlyPrice * 12).toFixed(0)}
                          </Typography>
                        )}
                        <Typography className={classes.planPrice}>
                          ${currentPrice.toFixed(0)}
                        </Typography>
                      </Box>
                      
                      <Typography className={classes.planPeriod}>
                        per {isYearly ? 'year' : 'month'}
                      </Typography>
                      
                      {isYearly && (
                        <Typography variant="body2" style={{ color: '#4caf50', marginTop: 8 }}>
                          Save ${savings.amount.toFixed(0)} ({savings.percentage}%)
                        </Typography>
                      )}
                    </div>

                    <List className={classes.featureList}>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} className={classes.featureItem}>
                          <ListItemIcon className={classes.featureIcon}>
                            <CheckCircle />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    <Button
                      fullWidth
                      variant="contained"
                      className={`${classes.selectButton} ${plan.popular ? classes.primaryButton : ''}`}
                      onClick={() => handlePlanSelect(plan)}
                      disabled={loading}
                      startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    >
                      {isLoading ? 'Processing...' : `Choose ${plan.name}`}
                    </Button>

                    {plan.popular && (
                      <div className={classes.guaranteeBadge}>
                        <Security style={{ marginRight: 8 }} />
                        <Typography variant="body2">
                          30-day money-back guarantee
                        </Typography>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Additional Features Section */}
        <Box mt={6} textAlign="center">
          <Typography variant="h4" style={{ color: 'white', marginBottom: 32 }}>
            Why Choose Our Platform?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <CloudUpload style={{ fontSize: 48, color: '#4caf50', marginBottom: 16 }} />
                <Typography variant="h6" style={{ color: 'white', marginBottom: 8 }}>
                  Easy Upload
                </Typography>
                <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Drag and drop or click to upload your music sheets
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Speed style={{ fontSize: 48, color: '#2196f3', marginBottom: 16 }} />
                <Typography variant="h6" style={{ color: 'white', marginBottom: 8 }}>
                  Fast Processing
                </Typography>
                <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Get results in seconds with our advanced AI technology
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <MusicNote style={{ fontSize: 48, color: '#ff6b6b', marginBottom: 16 }} />
                <Typography variant="h6" style={{ color: 'white', marginBottom: 8 }}>
                  Music Recognition
                </Typography>
                <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Convert sheet music to digital format with high accuracy
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <HelpOutlineIcon style={{ fontSize: 48, color: '#9c27b0', marginBottom: 16 }} />
                <Typography variant="h6" style={{ color: 'white', marginBottom: 8 }}>
                  24/7 Support
                </Typography>
                <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Get help whenever you need it from our expert team
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  );
};

export default SubscriptionPage;