import React, { useState, useEffect } from "react";
import {
  BadgeCheck,
  CreditCard,
  Scan,
  FileText,
  Cloud,
  Shield,
} from "lucide-react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  CircularProgress,
} from "@material-ui/core";
import { getSubscription, cancelSubscription } from "services/auth/Basic/api";
import dayjs from "dayjs";
import IntlMessages from "@jumbo/utils/IntlMessages";
import { Alert } from "@material-ui/lab";
const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #1e293b 100%)',
    padding: theme.spacing(2),
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundElements: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  },
  floatingOrb1: {
    position: 'absolute',
    top: '-10rem',
    right: '-10rem',
    width: '20rem',
    height: '20rem',
    background: 'rgba(168, 85, 247, 0.7)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    mixBlendMode: 'multiply',
    animation: '$pulse 4s ease-in-out infinite',
  },
  floatingOrb2: {
    position: 'absolute',
    bottom: '-10rem',
    left: '-10rem',
    width: '20rem',
    height: '20rem',
    background: 'rgba(59, 130, 246, 0.7)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    mixBlendMode: 'multiply',
    animation: '$pulse 4s ease-in-out infinite 2s',
  },
  floatingOrb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '15rem',
    height: '15rem',
    background: 'rgba(236, 72, 153, 0.5)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    mixBlendMode: 'multiply',
    animation: '$pulse 4s ease-in-out infinite 4s',
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.7 },
    '50%': { opacity: 1 },
  },
  container: {
    position: 'relative',
    maxWidth: '72rem',
    margin: '0 auto',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(6),
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '2rem',
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(3),
  },
  headerBadgeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  headerTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #ffffff, #e9d5ff, #ffffff)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
    },
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.125rem',
    maxWidth: '32rem',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  tabNavigation: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(4),
  },
  tabContainer: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(0.5),
  },
  tabButton: {
    padding: theme.spacing(1.5, 3),
    borderRadius: theme.spacing(1),
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#ffffff',
      background: 'rgba(255, 255, 255, 0.1)',
    },
  },
  tabButtonActive: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  mainPlanContainer: {
    maxWidth: '64rem',
    margin: '0 auto',
  },
  mainPlanCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: theme.spacing(3),
    padding: theme.spacing(4),
    transition: 'all 0.5s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateY(-2px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    },
  },
  planHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
  },
  planInfo: {
    flex: 1,
  },
  planNameContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
  planName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0,
  },
  badgeIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pricePeriod: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  planDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    margin: theme.spacing(0.5, 0),
    '& span': {
      color: 'rgba(255, 255, 255, 0.9)',
    },
  },
  daysLeftContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  daysLeftChip: {
    padding: theme.spacing(1, 2),
    borderRadius: '2rem',
    background: 'rgba(34, 197, 94, 0.2)',
    border: '1px solid rgba(34, 197, 94, 0.5)',
  },
  daysLeftText: {
    color: '#22c55e',
    fontWeight: 500,
    fontSize: '0.875rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.spacing(1.5),
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-1px)',
    },
  },
  featureIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    borderRadius: '0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    '& svg': {
      width: '1.25rem',
      height: '1.25rem',
      color: '#ffffff',
    },
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 500,
    flex: 1,
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  billingButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 3),
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: theme.spacing(1.5),
    color: '#f87171',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(239, 68, 68, 0.3)',
      border: '1px solid rgba(239, 68, 68, 0.7)',
      transform: 'scale(1.05)',
    },
  },
  updateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 3),
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: theme.spacing(1.5),
    color: '#ffffff',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transform: 'scale(1.05)',
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(10, 0),
  },
  loadingSpinner: {
    width: '3rem',
    height: '3rem',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: '$spin 1s linear infinite',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  dialogContent: {
    textAlign: 'center',
    padding: theme.spacing(3),
  },
  dialogTitle: {
    color: '#333',
    fontWeight: 'bold',
  },
  dialogText: {
    color: '#666',
    marginBottom: theme.spacing(2),
  },
  cancelButtonLoading: {
    opacity: 0.7,
    pointerEvents: 'none',
  },
}));

const ManageSubscriptionPage = () => {
  const classes = useStyles();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Cancel subscription states
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

 useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      const response = await getSubscription();

      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const activeSubscription = response.data.find(
          (sub) => sub.subscription_status === 'active'
        );

        if (activeSubscription) {
          setSubscription(activeSubscription);
        } else {
          setSubscription(null); // No active subscription
        }
      } else {
        setSubscription(null); // No subscription data
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null); // Also fallback in error
    } finally {
      setLoading(false);
    }
  })();
}, []);


const handleCancelSubscription = async () => {
  setCancelLoading(true);

  try {
    const result = await cancelSubscription(); // ✅ No payload

    if (result.success && result.subscription_status === 'cancelled') {
      setSnackbar({
        open: true,
        message: result.message || 'Subscription cancelled successfully',
        severity: 'success'
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      setSnackbar({
        open: true,
        message: result.message || 'Failed to cancel subscription',
        severity: 'error'
      });
    }
  } catch (error) {
    setSnackbar({
      open: true,
      message: error?.response?.data?.message || 'An error occurred while cancelling subscription',
      severity: 'error'
    });
  } finally {
    setCancelLoading(false);
    setOpenCancelDialog(false);
  }
};
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
return (
  <div className={classes.root}>
    <div className={classes.backgroundElements}>
      <div className={classes.floatingOrb1}></div>
      <div className={classes.floatingOrb2}></div>
      <div className={classes.floatingOrb3}></div>
    </div>

    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.headerBadge}>
          <FileText style={{ width: '1rem', height: '1rem', color: '#fbbf24' }} />
          <span className={classes.headerBadgeText}>
            <IntlMessages id="subscription.scanNotesManagement" />
          </span>
        </div>
        <h1 className={classes.headerTitle}>
          <IntlMessages id="subscription.manageYourPlan" />
        </h1>
        <p className={classes.headerSubtitle}>
          <IntlMessages id="subscription.description" />
        </p>
      </div>

      {loading ? (
        <div className={classes.loadingContainer}>
          <div className={classes.loadingSpinner}></div>
        </div>
      ) : subscription && subscription.subscription_status === "active" ? (
        <div className={classes.mainPlanContainer}>
          <div className={classes.mainPlanCard}>
            {/* Plan Header */}
            <div className={classes.planHeader}>
              <div className={classes.planInfo}>
                <div className={classes.planNameContainer}>
                  <div className={classes.badgeIcon}>
                    <BadgeCheck style={{ width: '1.25rem', height: '1.25rem', color: '#22c55e' }} />
                  </div>
                </div>
                <div className={classes.priceContainer}>
                  <span className={classes.price}>{subscription.amount}</span>
                  <span className={classes.pricePeriod}>
                    <IntlMessages id="subscription.perMonth" />
                  </span>
                </div>
                <p className={classes.planDescription}>
                  <IntlMessages id="subscription.invoiceId" />: <span>{subscription.invoice_id}</span>
                </p>
                <p className={classes.planDescription}>
                  <IntlMessages id="subscription.email" />: <span>{subscription.email}</span>
                </p>
                <p className={classes.planDescription}>
                  <IntlMessages id="subscription.startDate" />: <span>{dayjs(subscription.start_date).format("MMM DD, YYYY")}</span>
                </p>
                <p className={classes.planDescription}>
                  <IntlMessages id="subscription.dueDate" />: <span>{subscription.end_date ? dayjs(subscription.end_date).format("MMM DD, YYYY") : '-'}</span>
                </p>
              </div>
            </div>

            {/* Features */}
            <div className={classes.featuresGrid}>
              {[
                { icon: <Scan />, textId: 'subscription.feature.unlimitedScan', color: '#3b82f6' },
                { icon: <FileText />, textId: 'subscription.feature.advancedOCR', color: '#8b5cf6' },
                { icon: <Cloud />, textId: 'subscription.feature.cloudSync', color: '#06b6d4' },
                { icon: <Shield />, textId: 'subscription.feature.premiumSecurity', color: '#22c55e' }
              ].map((feature, index) => (
                <div key={index} className={classes.featureItem}>
                  <div className={classes.featureIcon}>
                    {React.cloneElement(feature.icon, { style: { width: '1.25rem', height: '1.25rem', color: feature.color } })}
                  </div>
                  <span className={classes.featureText}>
                    <IntlMessages id={feature.textId} />
                  </span>
                </div>
              ))}
            </div>

            {/* Cancel Button */}
            <div className={classes.actionButtons}>
              <button 
                className={`${classes.billingButton} ${cancelLoading ? classes.cancelButtonLoading : ''}`}
                onClick={() => setOpenCancelDialog(true)}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <CircularProgress size={16} style={{ color: '#f87171' }} />
                ) : (
                  <CreditCard style={{ width: '1rem', height: '1rem' }} />
                )}
                <span>
                  <IntlMessages id="subscription.cancelButton" />
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.loadingContainer}>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.125rem' }}>
            <IntlMessages id="subscription.noActivePlan" defaultMessage="No active subscription found." />
          </p>
        </div>
      )}
    </div>

    {/* Cancel Dialog */}
    <Dialog
      open={openCancelDialog}
      onClose={() => !cancelLoading && setOpenCancelDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle}>
        <IntlMessages id="subscription.cancelTitle" defaultMessage="Cancel Subscription" />
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <p className={classes.dialogText}>
          <IntlMessages 
            id="subscription.cancelConfirmation" 
            defaultMessage="Are you sure you want to cancel your subscription? This action cannot be undone and you will lose access to premium features."
          />
        </p>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setOpenCancelDialog(false)}
          disabled={cancelLoading}
          color="primary"
        >
          <IntlMessages id="subscription.keepSubscription" defaultMessage="Keep Subscription" />
        </Button>
        <Button
          onClick={handleCancelSubscription}
          disabled={cancelLoading}
          color="secondary"
          variant="contained"
          startIcon={cancelLoading && <CircularProgress size={20} />}
        >
          {cancelLoading ? (
            <IntlMessages id="subscription.cancelling" defaultMessage="Cancelling..." />
          ) : (
            <IntlMessages id="subscription.confirmCancel" defaultMessage="Cancel Subscription" />
          )}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Snackbar */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  </div>
);

};

export default ManageSubscriptionPage;