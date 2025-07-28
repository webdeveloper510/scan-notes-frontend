import React, { useEffect, useState, useMemo } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  ButtonGroup,
} from '@material-ui/core';
import {
  Edit,
  Visibility,
  AccessTime,
  Image as ImageIcon,
  CloudUpload,
  ViewModule,
  ViewList,
  ArrowUpward,
  ArrowDownward,
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
  controlsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  viewToggle: {
    marginLeft: 'auto',
  },
  viewButton: {
    minWidth: 120,
  },
  activeViewButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
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
    '&:hover $imageOverlay': {
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
  titleComposerInfo: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius,
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
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  thumbnailCell: {
    width: 80,
    padding: theme.spacing(1),
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
  },
  actionCell: {
    width: 200,
  },
  sortLabel: {
    '& .MuiTableSortLabel-icon': {
      opacity: 1,
    },
  },
  titleText: {
    fontWeight: 600,
  },
  buttonSpacer: {
    marginLeft: theme.spacing(1),
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
  const [displayMode, setDisplayMode] = useState('thumbnail'); // 'thumbnail' or 'column'
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc',
  });

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
    history.push(`/dashboard?id=${item.id}`, {
      title: item.title,
      COMPOSER: item.COMPOSER,
    });
  };

  const handleView = (item) => {
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
          title: item.title,        
      COMPOSER: item.COMPOSER, 
      object_id: item.id,
      },
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle null values for title and composer
        if (sortConfig.key === 'title' || sortConfig.key === 'COMPOSER') {
          aValue = aValue || '';
          bValue = bValue || '';
        }
        
        // Handle date sorting
        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

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

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
  };

  const renderThumbnailView = () => (
    <Grid container spacing={3}>
      {sortedData.map((item) => (
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

              {/* Title and Composer Information */}
              <Box className={classes.titleComposerInfo}>
                <Typography variant="body2" color="textPrimary">
                  <span className={classes.titleText}>Title:</span> {item.title || 'Not specified'}
                </Typography>
                <Typography variant="body2" color="textPrimary">
                  <span className={classes.titleText}>Composer:</span> {item.COMPOSER || 'Not specified'}
                </Typography>
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
                        <div className={classes.imageOverlay}>
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
  );

  const renderColumnView = () => (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className={classes.thumbnailCell}>
              <Typography variant="subtitle2">Thumbnail</Typography>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortConfig.key === 'title'}
                direction={sortConfig.key === 'title' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('title')}
                className={classes.sortLabel}
              >
                <Typography variant="subtitle2"><IntlMessages id={'detailpage.Title'} /></Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortConfig.key === 'COMPOSER'}
                direction={sortConfig.key === 'COMPOSER' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('COMPOSER')}
                className={classes.sortLabel}
              >
                <Typography variant="subtitle2"><IntlMessages id={'detailPage.composer'} /></Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortConfig.key === 'created_at'}
                direction={sortConfig.key === 'created_at' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('created_at')}
                className={classes.sortLabel}
              >
                <Typography variant="subtitle2"><IntlMessages id={'detailPage.date'} /></Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell className={classes.actionCell}>
              <Typography variant="subtitle2"><IntlMessages id={'detailPage.actions'} /></Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell className={classes.thumbnailCell}>
                {item.crop_images.length > 0 && (
                  <img
                    src={item.crop_images[0].file_url}
                    alt="Thumbnail"
                    className={classes.thumbnailImage}
                  />
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.title || 'Not specified'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.COMPOSER || 'Not specified'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(item.created_at)}
                </Typography>
              </TableCell>
              <TableCell className={classes.actionCell}>
                <Box display="flex" style={{ gap: theme.spacing(1) }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Visibility />}
                    onClick={() => handleView(item)}
                    size="small"
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={editingItems.has(item.id) ? <CircularProgress size={16} /> : <Edit />}
                    onClick={() => handleEdit(item)}
                    disabled={editingItems.has(item.id)}
                    size="small"
                  >
                    {editingItems.has(item.id) ? 'Processing...' : 'Edit'}
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
          {/* Controls Section */}
          <Box className={classes.controlsSection}>

            <ButtonGroup className={classes.viewToggle} size="small">
              <Button
                className={`${classes.viewButton} ${displayMode === 'thumbnail' ? classes.activeViewButton : ''}`}
                onClick={() => handleDisplayModeChange('thumbnail')}
                startIcon={<ViewModule />}
              >
                Thumbnail
              </Button>
              <Button
                className={`${classes.viewButton} ${displayMode === 'column' ? classes.activeViewButton : ''}`}
                onClick={() => handleDisplayModeChange('column')}
                startIcon={<ViewList />}
              >
                Column
              </Button>
            </ButtonGroup>
          </Box>

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
            displayMode === 'thumbnail' ? renderThumbnailView() : renderColumnView()
          )}
        </Grid>
      </GridContainer>
    </PageContainer>
  );
};

export default HistoryPage;