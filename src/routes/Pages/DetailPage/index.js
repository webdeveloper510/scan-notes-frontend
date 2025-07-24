import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  IconButton,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Radio,
  FormControlLabel,
  RadioGroup,
  Typography,
  Grid,
} from '@material-ui/core';
import { PlayArrow, Stop, Undo, Print, CloudDownload, Edit } from '@material-ui/icons';
import { useIntl } from 'react-intl';
import GridContainer from '../../../@jumbo/components/GridContainer';
import PageContainer from '../../../@jumbo/components/PageComponents/layouts/PageContainer';
import IntlMessages from '../../../@jumbo/utils/IntlMessages';
import { fetchError, fetchStart, fetchSuccess } from '../../../redux/actions';
import { $http, baseURL, mediaURL } from 'config';
import ToastMessage from '../../Components/ToastMessage';
import { useDispatch } from 'react-redux';
import CmtCard from '../../../@coremat/CmtCard';
import CmtImage from '../../../@coremat/CmtImage';
import PerfectScrollbar from 'react-perfect-scrollbar';
import CmtCardContent from '../../../@coremat/CmtCard/CmtCardContent';
import CmtCardHeader from '../../../@coremat/CmtCard/CmtCardHeader';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { titleComposerData } from 'services/auth/Basic/api';
const breadcrumbs = [
  { label: <IntlMessages id={'sidebar.main'} />, link: '/' },
  { label: <IntlMessages id={'detailPage.worksheet'} />, isActive: true },
];

const useStyles = makeStyles(theme => ({
  cardRoot: {
    [theme.breakpoints.down('xs')]: {
      '& .Cmt-header-root': {
        flexDirection: 'column',
      },
      '& .Cmt-action-default-menu': {
        marginLeft: 0,
        marginTop: 10,
      },
    },
  },
  cardContentRoot: {
    padding: 0,
  },
  scrollbarRoot: {
    height: 275,
  },
  imageContainer: {
    position: 'relative',
    margin: 0,
    padding: 0,
  },
  editImage: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    zIndex: 2,
  },
  headerFields: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
  },
  headerInfo: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  drawingCanvas: {
    border: '1px solid #ccc',
    cursor: 'crosshair',
    display: 'block',
    margin: '10px auto',
  },
  draggableRow: {
    cursor: 'move',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  draggedOver: {
    backgroundColor: '#e3f2fd',
    borderLeft: '4px solid #2196f3',
    transform: 'scale(1.01)',
  },
  beingDragged: {
    opacity: 0.5,
    transform: 'rotate(1deg)',
  },
  tableRowDraggable: {
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
  imageColumn: {
    minWidth: '300px', 
    maxWidth: '70%', 
    width: 'auto',
  },
  solutionColumn: {
    minWidth: '200px', 
    width: 'auto', 
  },
}));

const DetailPage = props => {
  const classes = useStyles();
  const History = useHistory();
  const dispatch = useDispatch();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState(props.location.state.selectedImageURL);
  const [currentMidi, setCurrentMidi] = useState(0);
  const [showImage, setShowImage] = useState(-1);
  const [selectedColor, setSelectedColor] = useState('red');
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [creationDate] = useState(new Date().toLocaleDateString());
  const [solutions, setSolutions] = useState({});
  
  // Get object_id from props.location.state (passed from dashboard)
  const [objectId, setObjectId] = useState(() => {
    return props.location.state?.object_id || '0';
  });
  console.log("🚀 ~ DetailPage ~ objectId:", objectId)

  const intl = useIntl();
  const worksheetLabel = intl.formatMessage({ id: 'detailPage.worksheet' });
  const solutionLabel = intl.formatMessage({ id: 'detailPage.solution' });
  const creationDateLabel = intl.formatMessage({ id: 'detailPage.creationDate' });
  const titleLabel = intl.formatMessage({ id: 'detailPage.title' });
  const composerLabel = intl.formatMessage({ id: 'detailPage.composer' });
  
  const theme = useTheme();
  const canvasRef = useRef(null);
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [zoomRate, setZoomRate] = useState(2);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // API call function for title/composer update
  const updateTitleComposer = async (newTitle, newComposer) => {
    try {
      dispatch(fetchStart());
      
      const payload = {
        object_id: objectId,
        title: newTitle,
        composer: newComposer
      };

      const response = await titleComposerData(payload);
      
      if (response.status === 200 || response.success) {
        dispatch(fetchSuccess('Title and Composer updated successfully!'));
        setMessage('Title and Composer updated successfully!');
        setShowMessage(true);
      } else {
        dispatch(fetchError(response.message || 'Failed to update title and composer'));
        setMessage(response.message || 'Failed to update title and composer');
        setShowMessage(true);
      }
    } catch (error) {
      dispatch(fetchError(error.message || 'Something went wrong'));
      setMessage(error.message || 'Something went wrong');
      setShowMessage(true);
    }
  };
const checkAndUpdateTitleComposer = (currentTitle, currentComposer) => {
  const trimmedTitle = currentTitle.trim();
  const trimmedComposer = currentComposer.trim();
  
  // Only call API if both title and composer are filled
  if (trimmedTitle && trimmedComposer) {
    updateTitleComposer(trimmedTitle, trimmedComposer);
  }
};
  // Handle title change with debounce
const handleTitleChange = (e) => {
  const newTitle = e.target.value;
  setTitle(newTitle);
};

  // Handle composer change with debounce
const handleComposerChange = (e) => {
  const newComposer = e.target.value;
  setComposer(newComposer);
};

  // Handle blur events to call API when user finishes editing
const handleTitleBlur = () => {
  checkAndUpdateTitleComposer(title, composer);
};

const handleComposerBlur = () => {
  checkAndUpdateTitleComposer(title, composer);
};
const handleSaveTitleComposer = () => {
  const trimmedTitle = title.trim();
  const trimmedComposer = composer.trim();
  
  if (trimmedTitle && trimmedComposer) {
    updateTitleComposer(trimmedTitle, trimmedComposer);
  } else {
    setMessage('Please enter both title and composer');
    setShowMessage(true);
  }
};

  useEffect(() => {
    if (showImage >= 0) {
      const handleImageLoad = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = function() {
            let width = img.width * zoomRate;
            let height = img.height * zoomRate;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
          };
          img.src = results.find(item => item.id == showImage).image;
        }
      };
      setTimeout(handleImageLoad, 0);
    }
  }, [showImage, zoomRate]);

  // Drag and drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(item);
  };

  const handleDragEnter = e => {
    e.preventDefault();
  };

  const handleDragLeave = e => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newResultsArray = [...results];
    const draggedIndex = newResultsArray.findIndex(item => item.id === draggedItem.id);
    const targetIndex = newResultsArray.findIndex(item => item.id === targetItem.id);

    const [draggedItemData] = newResultsArray.splice(draggedIndex, 1);
    newResultsArray.splice(targetIndex, 0, draggedItemData);

    setResults(newResultsArray);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleMessageClose = () => () => {
    setShowMessage(false);
  };

  const handlePlayMidi = id => {
    if (currentMidi == id) {
      setCurrentMidi(0);
    } else {
      setCurrentMidi(id);
    }
  };

  const handleGoBackClick = () => {
    History.push({
      pathname: 'dashboard',
      state: { selectedImageURL: results, photo_img: props.location.state.photo_img },
    });
  };

  const handlePrintClick = () => {
    window.print();
  };

  const handleSolutionChange = (resultId, value) => {
    setSolutions(prev => ({
      ...prev,
      [resultId]: value
    }));
  };

  const handleDownloadClick = () => {
    const table = document.getElementById('scan-table');
    const headerInfo = document.getElementById('header-info');
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < results.length; i++) {
      const pencil = document.getElementById(`pencil-${i}`);
      if (pencil) {
        pencil.style.display = 'none';
      }
    }

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px';
    container.style.backgroundColor = 'white';
    container.style.padding = '10px'; 

    const cleanHeader = document.createElement('div');
    cleanHeader.innerHTML = `
     <div style="text-align: center; font-weight: bold; font-size: 20px; margin-bottom: 15px;"> 
      ${worksheetLabel}
    </div>
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 8px; border-bottom: 1px solid #ddd;">
    <span style="flex: 1; text-align: center;"><strong>${creationDateLabel}:</strong> ${creationDate}</span>
    <span style="flex: 1; text-align: center; font-weight: bold;">${title || 'Untitled'}</span>
    <span style="flex: 1; text-align: center;">${composer || 'Unknown'}</span>
  </div>
    `;
    container.appendChild(cleanHeader);

    const tableClone = document.createElement('table');
    tableClone.style.width = '100%';
    tableClone.style.borderCollapse = 'collapse';
    tableClone.style.marginTop = '10px';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const imageHeader = document.createElement('th');
    imageHeader.style.border = '1px solid #ddd';
    imageHeader.style.padding = '8px';
    imageHeader.style.textAlign = 'center';
    imageHeader.style.backgroundColor = '#f5f5f5';
    imageHeader.style.width = '66.66%';
    imageHeader.textContent = intl.formatMessage({ id: 'detailPage.image' });

    const solutionHeader = document.createElement('th');
    solutionHeader.style.border = '1px solid #ddd';
    solutionHeader.style.padding = '8px';
    solutionHeader.style.textAlign = 'center';
    solutionHeader.style.backgroundColor = '#f5f5f5';
    solutionHeader.style.width = '33.33%';
    solutionHeader.textContent = solutionLabel;

    headerRow.appendChild(imageHeader);
    headerRow.appendChild(solutionHeader);
    thead.appendChild(headerRow);
    tableClone.appendChild(thead);

    const tbody = document.createElement('tbody');

    results.forEach((result, index) => {
      const row = document.createElement('tr');

      const imageCell = document.createElement('td');
      imageCell.style.border = '1px solid #ddd';
      imageCell.style.padding = '8px';
      imageCell.style.verticalAlign = 'top';
      imageCell.style.width = '66.66%';

      const img = document.createElement('img');
      img.src = result.image;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      imageCell.appendChild(img);

      const solutionCell = document.createElement('td');
      solutionCell.style.border = '1px solid #ddd';
      solutionCell.style.padding = '8px';
      solutionCell.style.verticalAlign = 'middle';
      solutionCell.style.whiteSpace = 'pre-wrap';
      solutionCell.style.wordBreak = 'break-word';
      solutionCell.style.textAlign = 'center';
      solutionCell.style.width = '33.33%';
      solutionCell.textContent = solutions[result.id] || '';

      row.appendChild(imageCell);
      row.appendChild(solutionCell);
      tbody.appendChild(row);
    });

    tableClone.appendChild(tbody);
    container.appendChild(tableClone);
    document.body.appendChild(container);

    html2canvas(container, {
      backgroundColor: 'white',
      scale: 2,
      logging: false,
      useCORS: true,
    })
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const img = new Image();
        img.src = imgData;

        img.addEventListener('load', function () {
          const imageHeight = img.naturalHeight;
          const imageWidth = img.naturalWidth;
          const titleHeight = 2;

          const pdf = new jsPDF();
          const width = pdf.internal.pageSize.getWidth() * 0.95;
          const height = (width * imageHeight) / imageWidth;

          pdf.addImage(imgData, 'PNG', pdf.internal.pageSize.getWidth() * 0.025, titleHeight, width, height);
          document.body.removeChild(container);

          for (let i = 0; i < results.length; i++) {
            const pencil = document.getElementById(`pencil-${i}`);
            if (pencil) {
              pencil.style.display = '';
            }
          }

          const filename = `${composer || 'Unknown'} ${title || 'Untitled'} ${creationDate.replace(/\//g, '-')}.pdf`;
          pdf.save(filename);
        });
      })
      .catch(error => {
        console.error('Error generating PDF:', error);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }

        for (let i = 0; i < results.length; i++) {
          const pencil = document.getElementById(`pencil-${i}`);
          if (pencil) {
            pencil.style.display = '';
          }
        }
      });
  };

  const handleEditImageClick = index => {
    setShowImage(index);
  };

  const handleImageClose = () => {
    setShowImage(-1);
  };

  const handleSaveImageClick = () => {
    const canvas = canvasRef.current;

    const newImageWidth = canvas.width / zoomRate;
    const newImageHeight = canvas.height / zoomRate;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = newImageWidth;
    tempCanvas.height = newImageHeight;

    tempCtx.drawImage(canvas, 0, 0, newImageWidth, newImageHeight);

    const new_image = tempCanvas.toDataURL('image/png');

    results.find(item => item.id == showImage).image = new_image;
    setShowImage(-1);
  };

  const handleColorChange = event => {
    setSelectedColor(event.target.value);
  };

  const handleImageMouseDown = event => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    setIsDrawing(true);
    setStartX((event.clientX - rect.left) * scaleX);
    setStartY((event.clientY - rect.top) * scaleY);
  };

  const handleImageMouseMove = event => {
    if (!isDrawing) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentX = (event.clientX - rect.left) * scaleX;
    const currentY = (event.clientY - rect.top) * scaleY;

    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(currentX, currentY);
    context.strokeStyle = selectedColor;
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();

    setStartX(currentX);
    setStartY(currentY);
  };

  const handleImageMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <PageContainer heading={<IntlMessages id="detailPage.worksheet" />} breadcrumbs={breadcrumbs}>
      <style>{`
        .MuiTableCell-root {
          padding: 0px 16px !important;
        }
        .MuiTableCell-head {
          padding: 12px 16px !important;
        }
        .MuiTableRow-root {
          height: auto !important;
        }
        .image-container {
          padding: 0 !important;
          margin: 0 !important;
        }
        .jr-card-thumb {
          margin: 0 !important;
          padding: 0 !important;
        }
        .MuiTableCell-root .jr-card-thumb img {
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      <GridContainer>
        <Grid item xs={12}>
          <CmtCard className={classes.cardRoot}>
            <Box display="flex" justifyContent="flex-end" p={2} pt={4}>
              <Box mx={1}>
                <Tooltip title="Save Title & Composer" aria-label="Save">
                  <Button color="secondary" variant="contained" onClick={handleSaveTitleComposer}>
                    Save
                  </Button>
                </Tooltip>
              </Box>
              <Box mx={1}>
                <Tooltip title="Print" aria-label="Print">
                  <Button color="primary" variant="contained" onClick={handlePrintClick}>
                    <Print />
                  </Button>
                </Tooltip>
              </Box>
              <Box mx={1}>
                <Tooltip title="Download" aria-label="Download">
                  <Button color="primary" variant="contained" onClick={handleDownloadClick}>
                    <CloudDownload />
                  </Button>
                </Tooltip>
              </Box>
              <Box mx={1}>
                <Tooltip title="Go Back" aria-label="Go Back">
                  <Button color="primary" onClick={handleGoBackClick}>
                    <Undo />
                  </Button>
                </Tooltip>
              </Box>
            </Box>
            <CmtCardContent className={classes.cardContentRoot}>
              <div id="header-info" className={classes.headerInfo}>
                <Typography variant="h5" gutterBottom align='center'>
                  <IntlMessages id="detailPage.worksheett" />
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={<IntlMessages id="detailpage.Title" />}
                      value={title}
                      onChange={handleTitleChange}
                      onBlur={handleTitleBlur}
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={<IntlMessages id="detailPage.composer" />}
                      value={composer}
                      onChange={handleComposerChange}
                      onBlur={handleComposerBlur}
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={<IntlMessages id="detailPage.date" />}
                      value={creationDate}
                      variant="outlined"
                      margin="normal"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </div>

              <div className="Cmt-table-responsive" id="scan-table">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="20">#</TableCell>
                      <TableCell className={classes.imageColumn}>
                        {<IntlMessages id="detailPage.image" />}
                      </TableCell>
                      <TableCell className={classes.solutionColumn}>
                        {<IntlMessages id="detailPage.solution" />}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow 
                        key={result.id}
                        className={clsx(
                          classes.draggableRow,
                          classes.tableRowDraggable,
                          dragOverItem && dragOverItem.id === result.id && classes.draggedOver,
                          draggedItem && draggedItem.id === result.id && classes.beingDragged,
                        )}
                        draggable
                        onDragStart={e => handleDragStart(e, result)}
                        onDragOver={e => handleDragOver(e, result)}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={e => handleDrop(e, result)}
                        onDragEnd={handleDragEnd}
                      >
                        <TableCell>
                        </TableCell>
                        <TableCell className={classes.imageColumn}>
                          <div className={`jr-card-thumb image-container pb-0 ${classes.imageContainer}`}>
                            <CmtImage id={`second_image${result.id}`} src={result.image} style={{ objectFit: 'cover' }} />
                            <IconButton
                              className={classes.editImage}
                              variant="contained"
                              color="secondary"
                              onClick={() => handleEditImageClick(result.id)}
                              id={`pencil-${index}`}>
                              <Edit />
                            </IconButton>
                          </div>
                        </TableCell>
                        <TableCell 
                          className={`${classes.solutionColumn} solution-column`}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <TextField
                            fullWidth
                            multiline
                            variant="outlined"
                            placeholder="write your solution..."
                            value={solutions[result.id] || ''}
                            onChange={(e) => handleSolutionChange(result.id, e.target.value)}
                            rows={6}
                            style={{ 
                              minHeight: '120px',
                              backgroundColor: '#ffffff',
                              cursor: 'text',
                            }}
                            InputProps={{
                              style: {
                                fontSize: '14px',
                                lineHeight: '1.5',
                                padding: '12px',
                                cursor: 'text',
                              },
                            }}
                            inputProps={{
                              style: {
                                resize: 'vertical',
                                minHeight: '100px',
                                cursor: 'text',
                              },
                              onMouseDown: (e) => {
                                e.stopPropagation();
                              },
                              onClick: (e) => {
                                e.target.focus();
                                e.stopPropagation();
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CmtCardContent>
          </CmtCard>
        </Grid>
      </GridContainer>
      <Dialog
        fullScreen={fullScreen}
        open={showImage >= 0}
        onClose={handleImageClose}
        aria-labelledby="responsive-dialog-title"
        maxWidth="md">
        <DialogTitle id="responsive-dialog-title">
          {'Choose a color and edit your image'}
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <RadioGroup 
              aria-label="Color" 
              name="color" 
              value={selectedColor} 
              onChange={handleColorChange}
              row>
              <FormControlLabel
                value={'red'}
                control={<Radio style={{ color: 'red' }} />}
                style={{ color: 'red' }}
                label="Red"
              />
              <FormControlLabel
                value={'blue'}
                control={<Radio style={{ color: 'blue' }} />}
                style={{ color: 'blue' }}
                label="Blue"
              />
              <FormControlLabel
                value={'green'}
                control={<Radio style={{ color: 'green' }} />}
                style={{ color: 'green' }}
                label="Green"
              />
              <FormControlLabel
                value={'black'}
                control={<Radio style={{ color: 'black' }} />}
                style={{ color: 'black' }}
                label="Black"
              />
            </RadioGroup>
          </Box>
          <canvas
            ref={canvasRef}
            className={classes.drawingCanvas}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '500px',
              display: 'block',
              margin: '0 auto'
            }}
            onMouseDown={handleImageMouseDown}
            onMouseMove={handleImageMouseMove}
            onMouseUp={handleImageMouseUp}
            onMouseLeave={handleImageMouseUp}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleImageClose} color="primary">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveImageClick}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {showMessage && <ToastMessage open={showMessage} onClose={handleMessageClose()} message={message} />}
    </PageContainer>
  );
};

export default DetailPage;