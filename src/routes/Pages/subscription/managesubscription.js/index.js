import React, { useState } from "react";
import { BadgeCheck, CreditCard, Users, BarChart3, Palette, Headphones, Sparkles, FileText, Scan, Cloud, Shield } from "lucide-react";
import { makeStyles } from "@material-ui/core/styles";

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
    borderRadius: '2rem',
    padding: theme.spacing(0.5),
  },
  tabButton: {
    padding: theme.spacing(1, 3),
    borderRadius: '2rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
    '&:hover': {
      color: '#ffffff',
    },
  },
  tabButtonActive: {
    background: '#ffffff',
    color: '#1e293b',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
    },
  },
  planHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: theme.spacing(2),
    },
  },
  planInfo: {
    flex: 1,
  },
  planNameContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
  },
  planName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  badgeIcon: {
    background: 'linear-gradient(to right, #10b981, #34d399)',
    borderRadius: '50%',
    padding: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pricePeriod: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  planDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  daysLeftContainer: {
    textAlign: 'right',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'left',
    },
  },
  daysLeftChip: {
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(1),
  },
  daysLeftText: {
    color: '#ffffff',
    fontWeight: 600,
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
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.spacing(1.5),
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
    },
  },
  featureIcon: {
    color: '#a855f7',
    transition: 'color 0.3s ease',
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 500,
  },
  actionButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    justifyContent: 'center',
  },
  billingButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    fontWeight: 600,
    padding: theme.spacing(2, 4),
    borderRadius: theme.spacing(1.5),
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      transform: 'scale(1.02)',
    },
  },
}));

const ManageSubscriptionPage = () => {
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState('current');

  const currentPlan = {
    name: "Scan Notes Pro",
    price: "$15",
    period: "month",
    features: [
      { icon: <Scan style={{ width: '1rem', height: '1rem' }} />, text: "Unlimited Document Scanning" },
      { icon: <FileText style={{ width: '1rem', height: '1rem' }} />, text: "Advanced OCR Technology" },
      { icon: <Cloud style={{ width: '1rem', height: '1rem' }} />, text: "Cloud Storage & Sync" },
      { icon: <Shield style={{ width: '1rem', height: '1rem' }} />, text: "Premium Security Features" }
    ],
    renewalDate: "August 28, 2025",
    daysLeft: 31
  };

  return (
    <div className={classes.root}>
      {/* Animated background elements */}
      <div className={classes.backgroundElements}>
        <div className={classes.floatingOrb1}></div>
        <div className={classes.floatingOrb2}></div>
        <div className={classes.floatingOrb3}></div>
      </div>

      <div className={classes.container}>
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.headerBadge}>
            <FileText style={{ width: '1rem', height: '1rem', color: '#fbbf24' }} />
            <span className={classes.headerBadgeText}>Scan Notes - Subscription Management</span>
          </div>
          <h1 className={classes.headerTitle}>
            Manage Your Plan
          </h1>
          <p className={classes.headerSubtitle}>
            Keep track of your Scan Notes subscription and enjoy seamless document scanning
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={classes.tabNavigation}>
          <div className={classes.tabContainer}>
            <button
              onClick={() => setSelectedTab('current')}
              className={`${classes.tabButton} ${selectedTab === 'current' ? classes.tabButtonActive : ''}`}
            >
              Current Plan
            </button>
          </div>
        </div>

        {selectedTab === 'current' && (
          <div className={classes.mainPlanContainer}>
            {/* Main Plan Card */}
            <div className={classes.mainPlanCard}>
              <div className={classes.planHeader}>
                <div className={classes.planInfo}>
                  <div className={classes.planNameContainer}>
                    <h2 className={classes.planName}>{currentPlan.name}</h2>
                    <div className={classes.badgeIcon}>
                      <BadgeCheck style={{ width: '1.25rem', height: '1.25rem', color: '#ffffff' }} />
                    </div>
                  </div>
                  <div className={classes.priceContainer}>
                    <span className={classes.price}>{currentPlan.price}</span>
                    <span className={classes.pricePeriod}>/{currentPlan.period}</span>
                  </div>
                  <p className={classes.planDescription}>Currently active subscription</p>
                </div>
                
                <div className={classes.daysLeftContainer}>
                  <div className={classes.daysLeftChip}>
                    <span className={classes.daysLeftText}>{currentPlan.daysLeft} days left</span>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className={classes.featuresGrid}>
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className={classes.featureItem}>
                    <div className={classes.featureIcon}>
                      {feature.icon}
                    </div>
                    <span className={classes.featureText}>{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className={classes.actionButtons}>
                <button className={classes.billingButton}>
                  <CreditCard style={{ width: '1rem', height: '1rem' }} />
                  <span>Cancel Subscription</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSubscriptionPage;