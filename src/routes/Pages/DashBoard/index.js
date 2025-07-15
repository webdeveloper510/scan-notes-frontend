import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
  Typography,
} from '@material-ui/core';
import {
  Delete,
  PlayArrow,
  Stop,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  ZoomOutMap,
  CloudUpload,
  PhotoCamera,
  Send,
} from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';

import GridContainer from '../../../@jumbo/components/GridContainer';
import PageContainer from '../../../@jumbo/components/PageComponents/layouts/PageContainer';
import IntlMessages from '../../../@jumbo/utils/IntlMessages';
import { fetchError, fetchStart, fetchSuccess } from '../../../redux/actions';
import Grid from '@material-ui/core/Grid';
import { $http, baseURL, mediaURL } from 'config';
import ToastMessage from '../../Components/ToastMessage';
import { useDispatch } from 'react-redux';
import CmtCard from '../../../@coremat/CmtCard';
import CmtImage from '../../../@coremat/CmtImage';
import PerfectScrollbar from 'react-perfect-scrollbar';
import CmtCardContent from '../../../@coremat/CmtCard/CmtCardContent';
import CmtCardHeader from '../../../@coremat/CmtCard/CmtCardHeader';
import clsx from 'clsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

const breadcrumbs = [
  { label: <IntlMessages id={'sidebar.main'} />, link: '/' },
  { label: <IntlMessages id={'sidebar.dashboard'} />, isActive: true },
];

const useStyles = makeStyles(theme => ({
  imageContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  enlargedImage: {
    position: 'absolute',
    display: 'none',
    width: 200,
    height: 200,
    border: '2px solid #ccc',
    backgroundColor: 'white',
    pointerEvents: 'none',
    backgroundRepeat: 'no-repeat',
  },

  mainLayout: {
    display: 'flex',
    gap: theme.spacing(1),
    height: '100%',
    alignItems: 'flex-start',
  },
  canvasSection: {
    flex: 1,
    minWidth: 0,
    marginTop: '-20px',
    marginLeft: theme.spacing(1),
  },
  selectedImagesSection: {
    width: '400px',
    minWidth: '400px',
    maxHeight: '800px',
    overflow: 'auto',
    order: -1,
    marginTop: '10px',
  },
  selectedImageItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
  },
  selectedImageThumbnail: {
    marginRight: theme.spacing(1),
  },
  selectedImageActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  selectedImageSolution: {
    flex: 1,
    marginLeft: theme.spacing(1),
    fontSize: '0.875rem',
  },
  controlsSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

const DashBoard = props => {
  const classes = useStyles();
  const [photo_img, setPhotoImg] = useState(
    props.location.state && props.location.state.photo_img ? props.location.state.photo_img : undefined,
  );
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [photo_img_url, setPhotoImgUrl] = useState('https://via.placeholder.com/600x400');
  const [selectedImageURL, setSelectedImageURL] = useState(
    props.location.state && props.location.state.selectedImageURL ? props.location.state.selectedImageURL : [],
  );

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(0);
  const canvasRef = useRef(null);

  const videoRef = useRef(null);
  const canvasScanRef = useRef(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [open_scan, setOpenScan] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMidi, setCurrentMidi] = useState(null);
  const [gotoDetail, setGotoDetail] = useState(props.location.state && props.location.state.photo_img ? true : false);
  const History = useHistory();
  const [scale, setScale] = useState(1);
  const [zoomFocus, setZoomFocus] = useState(false);
  let isImageLoading = false;

  useEffect(() => {
    const imageContainer = document.querySelector('#image-container');
    const myCanvas = document.querySelector('#myCanvas');
    const enlargedImage = document.querySelector('#enlarged-image');
    enlargedImage.style.backgroundImage = `url(${photo_img_url})`;
    enlargedImage.style.transform = 'scale(2)';

    myCanvas.addEventListener('mousemove', function(event) {
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      const rect = imageContainer.getBoundingClientRect();
      const canvas_rect = myCanvas.getBoundingClientRect();
      enlargedImage.style.top = `${mouseY - rect.top - 100 + imageContainer.scrollTop}px`;
      enlargedImage.style.left = `${mouseX - rect.left - 100 + imageContainer.scrollLeft}px`;
      enlargedImage.style.display = 'block';
      enlargedImage.style.backgroundPositionX = `${-(mouseX - canvas_rect.left - 100)}px`;
      enlargedImage.style.backgroundPositionY = `${-(mouseY - canvas_rect.top - 100)}px`;
    });
    imageContainer.addEventListener('mouseout', function() {
      enlargedImage.style.display = 'none';
    });
    if (photo_img) handleFileInputChange(photo_img);
  }, []);

useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = function() {
    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;
    const maxWidth = 1800;
    const maxHeight = 1200;

    let canvasWidth = originalWidth;
    let canvasHeight = originalHeight;
    if (originalWidth > maxWidth || originalHeight > maxHeight) {
      const widthRatio = maxWidth / originalWidth;
      const heightRatio = maxHeight / originalHeight;
      const ratio = Math.min(widthRatio, heightRatio);

      canvasWidth = originalWidth * ratio;
      canvasHeight = originalHeight * ratio;
    }
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

  };

  img.src = photo_img_url;
}, [photo_img_url]);
  const handleSubmitClick = () => {
    if (!photo_img) {
      setMessage('You need to select the image.');
      setShowMessage(true);
      return;
    }

    setLoading(true);

    const eventData = new FormData();
    eventData.append('photo_img', photo_img);
    selectedImageURL.forEach((file, index) => {
      eventData.append(`selectedImageURL`, file.file);
    });

    dispatch(fetchStart());

    $http
      .post(`${baseURL}recognize_image/`, eventData)
      .then(response => {
        if (response.data.status) {
          dispatch(fetchSuccess('Success!'));
          let newSelectedImageURL = [...selectedImageURL];
          newSelectedImageURL.forEach((item, index) => {
            item.source = response.data.sheet_wav_data[index];
            item.solution = response.data.sheet_music_data[index];
          });
          setSelectedImageURL(newSelectedImageURL);
          setGotoDetail(true);
        } else {
          dispatch(fetchError(response.data.error));
        }
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        dispatch(fetchError(error.message));
      });
  };

  const handleGotoDetailClick = () => {
    History.push({
      pathname: 'detail-page',
      state: { selectedImageURL, photo_img },
    });
  };

  const handleMessageClose = () => () => {
    setShowMessage(false);
  };

  const loadImageFile = file => {
    let img_file_name = file.name;
    file = new File([file], img_file_name, file);
    setPhotoImgUrl(URL.createObjectURL(file));
  };

  const loadPdfFile = async (file, pageNumber) => {
    try {
      const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;

      setNumPages(pdf.numPages);
      setCurrentPage(pageNumber);

      const page = await pdf.getPage(pageNumber);
      const scale = 3;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      await page.render(renderContext).promise;

      const dataURL = canvas.toDataURL('image/png');
      setPhotoImgUrl(dataURL);
    } catch (error) {
      dispatch(fetchError(`Error loading PDF: ${error}`));
      console.error(error);
    }
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      const newPageNumber = currentPage - 1;
      loadPdfFile(photo_img, newPageNumber);
    }
  };

  const handleNextClick = () => {
    if (currentPage < numPages) {
      const newPageNumber = currentPage + 1;
      loadPdfFile(photo_img, newPageNumber);
    }
  };

  const handleFileInputChange = fileObj => {
    if (fileObj && fileObj.type === 'application/pdf') {
      setPhotoImg(fileObj);
      loadPdfFile(fileObj, 1);
    } else if (fileObj && fileObj.type.startsWith('image/')) {
      setPhotoImg(fileObj);
      setNumPages(0);
      setCurrentPage(1);
      loadImageFile(fileObj);
      const newImage = {
        id: selectedImageURL.length > 0 ? Math.max(...selectedImageURL.map(item => item.id)) + 1 : 1,
        image: URL.createObjectURL(fileObj),
        file: fileObj,
        source: undefined,
        solution: undefined,
      };
      setSelectedImageURL(prevImages => [...prevImages, newImage]);
    } else {
      dispatch(fetchError('Invalid file format'));
    }
    fileObj = null;
  };

const handleMouseDown = e => {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  
  // Get mouse position relative to the canvas element (not the canvas coordinate system)
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  setIsDragging(true);
  setStartX(x);
  setStartY(y);
  setEndX(x);
  setEndY(y);
};
const handleMouseMove = e => {
  const enlargedImage = document.querySelector('#enlarged-image');
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  
  // Get current mouse position relative to canvas element
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Handle zoom focus display logic (only when not dragging)
  if (!isDragging) {
    if (!zoomFocus) {
      enlargedImage.style.display = 'none';
    } else {
      enlargedImage.style.display = 'block';
    }
  } else {
    // Hide enlarged image while dragging
    enlargedImage.style.display = 'none';
  }
  
  // Handle drag selection
  if (isDragging) {
    setEndX(x);
    setEndY(y);
    redrawCanvas();
  }
};
const handleMouseUp = () => {
  const enlargedImage = document.querySelector('#enlarged-image');
  
  if (isDragging) {
    setIsDragging(false);
    
    // Calculate the selection area in canvas element coordinates
    const actualStartX = Math.min(startX, endX);
    const actualStartY = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    
    // Only extract if there's a meaningful selection (minimum 10x10 pixels)
    if (width > 10 && height > 10) {
      extractSelectedArea(actualStartX, actualStartY, width, height);
    }
    
    // Clear the selection rectangle
    redrawCanvas(false);
    
    try {
      const canvas = canvasRef.current;
      enlargedImage.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg')})`;
    } catch (error) {
      console.log(error);
    }
  }
  
  // Restore zoom focus display if enabled
  if (zoomFocus) {
    enlargedImage.style.display = 'block';
  } else {
    enlargedImage.style.display = 'none';
  }
};

const redrawCanvas = (showSelection = true) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const img = new Image();
  img.onload = function() {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Draw selection rectangle if dragging
    if (showSelection && isDragging) {
      const rect = canvas.getBoundingClientRect();
      
      // Convert element coordinates to canvas coordinates
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const actualStartX = Math.min(startX, endX) * scaleX;
      const actualStartY = Math.min(startY, endY) * scaleY;
      const width = Math.abs(endX - startX) * scaleX;
      const height = Math.abs(endY - startY) * scaleY;
      
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(actualStartX, actualStartY, width, height);
    }
  };
  img.src = photo_img_url;
};

const extractSelectedArea = (startXPos, startYPos, width, height) => {
  try {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Convert element coordinates to canvas coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasStartX = startXPos * scaleX;
    const canvasStartY = startYPos * scaleY;
    const canvasWidth = width * scaleX;
    const canvasHeight = height * scaleY;
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
 
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    
    // Extract the selected area from the main canvas using canvas coordinates
    tempCtx.drawImage(canvas, canvasStartX, canvasStartY, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
    
    const blob = dataURLtoBlob(tempCanvas.toDataURL('image/png'));
    const file = new File([blob], 'image.png', { type: 'image/png' });

    const new_id = selectedImageURL.length > 0 ? Math.max(...selectedImageURL.map(item => item.id)) + 1 : 1;

    setSelectedImageURL(prevImages => [
      ...prevImages,
      {
        id: new_id,
        image: tempCanvas.toDataURL('image/png'),
        file: file,
        source: undefined,
        solution: undefined,
      },
    ]);
    setGotoDetail(false);
  } catch (error) {
    console.log('Error extracting selected area:', error);
  }
};
  const dataURLtoBlob = dataURL => {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const encodedString = parts[1];

    try {
      const decodedString = atob(encodedString);
      const byteStringLength = decodedString.length;
      const arrayBuffer = new ArrayBuffer(byteStringLength);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteStringLength; i++) {
        uint8Array[i] = decodedString.charCodeAt(i);
      }

      return new Blob([arrayBuffer], { type: contentType });
    } catch (error) {
      console.error('Error decoding base64 string:', error);
      return null;
    }
  };
  const handleDeleteImage = id => {
    const new_img_arr = [...selectedImageURL];
    const indexToDelete = new_img_arr.findIndex(item => item.id == id);
    if (indexToDelete !== -1) {
      new_img_arr.splice(indexToDelete, 1);
    }
    setSelectedImageURL(new_img_arr);
    setGotoDetail(false);
  };

  const handlePlayMidi = id => {
    if (currentMidi === id) {
      setCurrentMidi(0);
    } else {
      setCurrentMidi(id);
    }
  };

  const handleScanButtonClick = async () => {
    setOpenScan(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  const handleZoomInClick = () => {
    const new_scale = scale * 1.1;
    if (new_scale > 2) return;
    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const image = new Image();

      image.onload = () => {
        try {
          if (isImageLoading) {
            isImageLoading = false;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const enlargedImage = document.querySelector('#enlarged-image');
            enlargedImage.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg')})`;
            setScale(new_scale);
          }
        } catch (error) {
          console.log(error);
        }
      };

      if (!isImageLoading) {
        isImageLoading = true;

        canvas.width *= 1.1;
        canvas.height *= 1.1;

        image.src = photo_img_url;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleZoomOutClick = () => {
    const new_scale = scale / 1.1;
    if (new_scale < 0.3) return;
    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const image = new Image();

      image.onload = () => {
        try {
          if (isImageLoading) {
            isImageLoading = false;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const enlargedImage = document.querySelector('#enlarged-image');
            enlargedImage.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg')})`;
            setScale(new_scale);
          }
        } catch (error) {
          console.log(error);
        }
      };

      if (!isImageLoading) {
        isImageLoading = true;

        canvas.width /= 1.1;
        canvas.height /= 1.1;

        image.src = photo_img_url;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleZoomOutMapClick = () => {
    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const image = new Image();

      image.onload = () => {
        try {
          if (isImageLoading) {
            isImageLoading = false;
            const imageContainer = document.querySelector('#image-container');
            const fullWidth = imageContainer.clientWidth;
            const new_scale = (scale * fullWidth) / canvas.width;
            canvas.width = fullWidth;
            canvas.height = (fullWidth * image.height) / image.width;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const enlargedImage = document.querySelector('#enlarged-image');
            enlargedImage.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg')})`;
            setScale(new_scale);
          }
        } catch (error) {
          console.log(error);
        }
      };

      if (!isImageLoading) {
        isImageLoading = true;
        image.src = photo_img_url;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleZoomFocusClick = () => {
    setZoomFocus(!zoomFocus);
  };

  const handleCaptureButtonClick = () => {
    const context = canvasScanRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasScanRef.current.width, canvasScanRef.current.height);
    const image = canvasScanRef.current.toDataURL('image/png');
    const file = new File([dataURLtoBlob(image)], 'image.png', { type: 'image/png' });

    setPhotoImg(file);
    setPhotoImgUrl(URL.createObjectURL(file));
    setOpenScan(false);
  };

  const handleScanClose = () => {
    setOpenScan(false);
  };

  return (
    <PageContainer heading={<IntlMessages id="sidebar.dashboard" />} breadcrumbs={breadcrumbs}>
      <GridContainer>
        <Grid item xs={12}>
          <GridContainer>
            {/* Control buttons */}
            <Grid item xs={12}>
              <div className={classes.controlsSection}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={e => {
                    document.getElementById('photo_img').click();
                  }}
                  disabled={loading}
                  startIcon={<CloudUpload />}>
                  {<IntlMessages id="dashboard.upload" />}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleScanButtonClick()}
                  disabled={loading}
                  startIcon={<PhotoCamera />}>
                  {<IntlMessages id="dashboard.scan" />}
                </Button>
                <IconButton color="secondary" onClick={() => handleZoomInClick()}>
                  <ZoomIn />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleZoomOutClick()}>
                  <ZoomOut />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleZoomOutMapClick()}>
                  <ZoomOutMap />
                </IconButton>
                <IconButton color={zoomFocus ? 'secondary' : 'primary'} onClick={() => handleZoomFocusClick()}>
                  <CenterFocusStrong />
                </IconButton>
              </div>
            </Grid>

            {/* Main content with side-by-side layout */}
            <Grid item xs={12}>
              <div className={classes.mainLayout}>
                {/* Selected images section - now on the left */}
                <div className={classes.selectedImagesSection}>
                  {selectedImageURL.length > 0 && (
                    <CmtCard>
                      <CmtCardContent>
                        <PerfectScrollbar>
                          {selectedImageURL.map(img => (
                            <div key={img.id} className={classes.selectedImageItem}>
                              <div className={classes.selectedImageThumbnail}>
                                <CmtImage
                                  src={img.image}
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                  }}
                                />
                              </div>
                              <div className={classes.selectedImageSolution}>
                                {img.solution ? (
                                  <Typography variant="body2">{img.solution}</Typography>
                                ) : (
                                  <Typography variant="body2" color="textSecondary"></Typography>
                                )}
                                {currentMidi && currentMidi === img.id && img.source && (
                                  <audio
                                    src={`${mediaURL}${img.source}`}
                                    controls
                                    autoPlay={img.id === currentMidi}
                                    style={{ width: '100%', marginTop: '8px' }}
                                  />
                                )}
                              </div>
                              <div className={classes.selectedImageActions}>
                                {img.source && (
                                  <IconButton size="small" color="primary" onClick={() => handlePlayMidi(img.id)}>
                                    {img.id === currentMidi ? <Stop /> : <PlayArrow />}
                                  </IconButton>
                                )}
                                <IconButton size="small" color="secondary" onClick={() => handleDeleteImage(img.id)}>
                                  <Delete />
                                </IconButton>
                              </div>
                            </div>
                          ))}
                        </PerfectScrollbar>
                        <Box mt={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleSubmitClick}
                            disabled={loading || selectedImageURL.length === 0}
                            startIcon={<Send />}
                            style={{ marginBottom: '8px' }}>
                            {<IntlMessages id="dashboard.submit" />}
                          </Button>
                          <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={handleGotoDetailClick}
                            disabled={!gotoDetail}>
                            {<IntlMessages id="dashboard.goto" />}
                          </Button>
                        </Box>
                      </CmtCardContent>
                    </CmtCard>
                  )}
                </div>
                {/* Canvas section - now on the right */}
                <div className={classes.canvasSection}>
                  <Box mb={2} style={{ textAlign: 'center' }}>
                    <Typography variant="h6">Sheet Music</Typography>
                  </Box>
                  <input
                    type="file"
                    id="photo_img"
                    name="photo_img"
                    style={{ display: 'none' }}
                    onChange={event => handleFileInputChange(event.target.files[0])}
                  />
                  <div
                    style={{
                      width: '100%',
                      maxHeight: '800px',
                      overflow: 'auto',
                      display: 'flex',
                      justifyContent: 'flex-start',
                      marginTop: '10px',
                    }}
                    className={clsx(classes.imageContainer)}
                    id="image-container">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      style={{ maxWidth: '100%', height: 'auto', left: 0, top: 0, marginLeft: '8px' }}
                      id="myCanvas"
                    />
                    <div className={clsx(classes.enlargedImage)} id="enlarged-image"></div>
                  </div>
                  {numPages ? (
                    <Box mt={2} style={{ textAlign: 'center' }}>
                      <Button variant="contained" size="small" color="secondary" onClick={handlePrevClick}>
                        Prev
                      </Button>
                      <span style={{ margin: '0 16px' }}>
                        Page {currentPage} of {numPages}
                      </span>
                      <Button variant="contained" size="small" color="secondary" onClick={handleNextClick}>
                        Next
                      </Button>
                    </Box>
                  ) : null}
                </div>
              </div>
            </Grid>
          </GridContainer>
        </Grid>
      </GridContainer>

      <Dialog fullScreen={fullScreen} open={open_scan} onClose={handleScanClose} aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">{'Take a sheet music with a camera'}</DialogTitle>
        <DialogContent>
          <video ref={videoRef} />
          <canvas ref={canvasScanRef} style={{ display: 'none' }} />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleScanClose} color="primary">
            Close
          </Button>
          <Button variant="contained" color="primary" onClick={handleCaptureButtonClick}>
            Capture
          </Button>
        </DialogActions>
      </Dialog>
      {showMessage && <ToastMessage open={showMessage} onClose={handleMessageClose()} message={message} />}
    </PageContainer>
  );
};

export default DashBoard;
