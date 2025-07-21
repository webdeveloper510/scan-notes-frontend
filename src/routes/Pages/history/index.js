import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Box,
  Button,
  IconButton,
  Chip,
  CardActions,
  makeStyles,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import {
  Edit,
  Visibility,
  AccessTime,
  Image as ImageIcon,
  CloudUpload,
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { getHistory } from 'services/auth/Basic/api';
import { $http, baseURL } from 'config';
import { fetchError, fetchStart, fetchSuccess } from '../../../redux/actions';
import { useDispatch } from 'react-redux';
import PageContainer from '../../../@jumbo/components/PageComponents/layouts/PageContainer';
import IntlMessages from '../../../@jumbo/utils/IntlMessages';
import GridContainer from '../../../@jumbo/components/GridContainer';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  headerSection: {
    marginBottom: theme.spacing(4),
    textAlign: 'center',
  },
  statsCard: {
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    color: 'white',
    marginBottom: theme.spacing(3),
  },
  historyCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  cardContent: {
    flexGrow: 1,
  },
  cardActions: {
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  imageGrid: {
    maxHeight: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  imageItem: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
    '&:hover .overlay': {
      opacity: 1,
    },
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  dateChip: {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.secondary,
  },
  countChip: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  noDataContainer: {
    textAlign: 'center',
    padding: theme.spacing(8),
  },
  noDataIcon: {
    fontSize: 64,
    color: theme.palette.grey[400],
    marginBottom: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  actionButton: {
    minWidth: 100,
  },
  editingCard: {
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: theme.shadows[4],
  },
}));

const breadcrumbs = [
  { label: <IntlMessages id={'sidebar.main'} />, link: '/' },
  { label: <IntlMessages id={'sidebar.history'} />, isActive: true },
];

const HistoryPage = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();
  const dispatch = useDispatch();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItems, setEditingItems] = useState(new Set());

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory();
        if (res.status === 200 && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load history.');
        }
      } catch (err) {
        setError('Error loading history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);
const handleEdit = (item) => {
  // Remove the state-based navigation
  history.push(`/dashboard?id=${item.id}`);
};
  const handleView = (item) => {
    // Navigate to detail page for viewing
    const selectedImageURL = item.crop_images.map((img, index) => ({
      id: index + 1,
      image: img.file_url,
      file: null,
      source: undefined,
      solution: undefined,
    }));

    history.push({
      pathname: '/detail-page',
      state: {
        selectedImageURL,
        photo_img: item.orignal_image,
        viewOnly: true,
      },
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <PageContainer heading={<IntlMessages id="sidebar.history" />} breadcrumbs={breadcrumbs}>
        <div className={classes.loadingContainer}>
          <CircularProgress size={60} />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer heading={<IntlMessages id="sidebar.history" />} breadcrumbs={breadcrumbs}>
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer heading={<IntlMessages id="sidebar.history" />} breadcrumbs={breadcrumbs}>
      <GridContainer>
        <Grid item xs={12}>
      
          {/* Stats Card */}
          {/* <Card className={classes.statsCard}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">Total Documents</Typography>
                  <Typography variant="h4">{data.length}</Typography>
                </Box>
                <CloudUpload style={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card> */}

          {data.length === 0 ? (
            <div className={classes.noDataContainer}>
              <ImageIcon className={classes.noDataIcon} />
              <Typography variant="h6" gutterBottom>
                No documents found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Upload your first document to get started
              </Typography>
            </div>
          ) : (
            <Grid container spacing={3}>
              {data.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card 
                    className={`${classes.historyCard} ${
                      editingItems.has(item.id) ? classes.editingCard : ''
                    }`}
                    elevation={3}
                  >
                    <CardContent className={classes.cardContent}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" component="h3">
                           #{item.id}
                        </Typography>
                        <Chip
                          icon={<AccessTime />}
                          label={formatDate(item.created_at)}
                          className={classes.dateChip}
                          size="small"
                        />
                      </Box>

                      <Box mb={2}>
                        <Chip
                          icon={<ImageIcon />}
                          label={`${item.crop_images.length} images`}
                          className={classes.countChip}
                          size="small"
                        />
                      </Box>

                      <Box className={classes.imageGrid}>
                        <Grid container spacing={1}>
                          {item.crop_images.slice(0, 6).map((img, index) => (
                            <Grid item xs={4} key={index}>
                              <div className={classes.imageItem}>
                                <CardMedia
                                  component="img"
                                  image={img.file_url}
                                  alt={img.file_name}
                                  style={{
                                    width: '100%',
                                    height: 80,
                                    objectFit: 'cover',
                                  }}
                                />
                                <div className={`${classes.imageOverlay} overlay`}>
                                  <Typography variant="caption" style={{ color: 'white' }}>
                                    {img.file_name}
                                  </Typography>
                                </div>
                              </div>
                            </Grid>
                          ))}
                          {item.crop_images.length > 6 && (
                            <Grid item xs={4}>
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                style={{
                                  height: 80,
                                  backgroundColor: theme.palette.grey[200],
                                  borderRadius: theme.shape.borderRadius,
                                }}
                              >
                                <Typography variant="caption" color="textSecondary">
                                  +{item.crop_images.length - 6} more
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </CardContent>

                    <CardActions className={classes.cardActions}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Visibility />}
                        onClick={() => handleView(item)}
                        className={classes.actionButton}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={editingItems.has(item.id) ? <CircularProgress size={16} /> : <Edit />}
                        onClick={() => handleEdit(item)}
                        disabled={editingItems.has(item.id)}
                        className={classes.actionButton}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        {editingItems.has(item.id) ? 'Processing...' : 'Edit'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </GridContainer>
    </PageContainer>
  );
};

export default HistoryPage;