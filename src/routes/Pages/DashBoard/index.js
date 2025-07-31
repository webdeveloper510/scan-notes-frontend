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
import { freeTrialCheck ,deleteHistory} from 'services/auth/Basic/api';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import toast from 'react-hot-toast';
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
    marginTop: '0px',
    // marginLeft: theme.spacing(1),
  },
  selectedImagesSection: {
    flex: 1,
    width: '400px',
    minWidth: '400px',
    maxHeight: '800px',
    overflow: 'auto',
    order: -1,
  },
  selectedImageItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
    cursor: 'move',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f0f0f0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
  },
  draggedOver: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    transform: 'scale(1.02)',
  },

  beingDragged: {
    opacity: 0.5,
    transform: 'rotate(2deg)',
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
  sectionTitle: {
    textAlign: 'center',
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
  const [objectId, setObjectId] = useState(null);
  const dispatch = useDispatch();
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasFreeTrial, setHasFreeTrial] = useState(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [photo_img_url, setPhotoImgUrl] = useState(
  props.location.state && props.location.state.selectedImageURL_url 
    ? props.location.state.selectedImageURL_url 
    : 'https://via.placeholder.com/600x400'
);
const [selectedImageURL, setSelectedImageURL] = useState(
  props.location.state && props.location.state.selectedImageURL 
    ? props.location.state.selectedImageURL 
    : []
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
  const location = useLocation();
const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const fetchHistoryItemById = async (historyId) => {
  try {
    const response = await $http.get(`${baseURL}user-history/`);
    if (response.data.status === 200) {
      const historyItem = response.data.data.find(item => item.id === parseInt(historyId));
      return historyItem;
    }
    return null;
  } catch (error) {
    console.error('Error fetching history item:', error);
    return null;
  }
};
useEffect(() => {
  const imageContainer = document.querySelector('#image-container');
  const myCanvas = document.querySelector('#myCanvas');
  const enlargedImage = document.querySelector('#enlarged-image');
  if (myCanvas) {
    myCanvas.addEventListener('mousemove', function(event) {
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      const rect = imageContainer.getBoundingClientRect();
      const canvas_rect = myCanvas.getBoundingClientRect();
      if (enlargedImage) {
        enlargedImage.style.top = `${mouseY - rect.top - 100 + imageContainer.scrollTop}px`;
        enlargedImage.style.left = `${mouseX - rect.left - 100 + imageContainer.scrollLeft}px`;
        enlargedImage.style.display = 'block';
        enlargedImage.style.backgroundPositionX = `${-(mouseX - canvas_rect.left - 100)}px`;
        enlargedImage.style.backgroundPositionY = `${-(mouseY - canvas_rect.top - 100)}px`;
      }
    });
  }

  if (imageContainer) {
    imageContainer.addEventListener('mouseout', function() {
      if (enlargedImage) {
        enlargedImage.style.display = 'none';
      }
    });
  }
  const urlParams = new URLSearchParams(location.search);
  const historyId = urlParams.get('id');

  if (historyId) {
    loadHistoryItem(historyId);
  } else if (props.location.state && props.location.state.fromHistory) {
    if (props.location.state.selectedImageURL_url) {
      setPhotoImgUrl(props.location.state.selectedImageURL_url);
    }
  } else if (photo_img) {
    handleFileInputChange(photo_img);
  }
}, [location.search]);
const loadHistoryItem = async (historyId) => {
  setIsLoadingHistory(true);
  try {
    const historyItem = await fetchHistoryItemById(historyId);
    if (historyItem) {
      setPhotoImgUrl(historyItem.orignal_image);
      setObjectId(historyItem.id || historyId);
      
      const convertedImages = historyItem.crop_images.map((cropImg, index) => ({
        id: index + 1,
        image: cropImg.file_url,
        file: null,
        source: undefined,
        solution: undefined,
        fileName: cropImg.file_name,
        isFromHistory: true
      }));
      
      setSelectedImageURL(convertedImages);
      setGotoDetail(convertedImages.length > 0);
      try {
        const response = await fetch(historyItem.orignal_image);
        const blob = await response.blob();
        const file = new File([blob], 'original_image.jpg', { type: blob.type });
        setPhotoImg(file);
        setTimeout(() => {
          if (canvasRef.current) {
            redrawCanvasFromImage(historyItem.orignal_image);
          }
        }, 100);
        
      } catch (error) {
        console.error('Error creating file from URL:', error)
        setTimeout(() => {
          if (canvasRef.current) {
            redrawCanvasFromImage(historyItem.orignal_image);
          }
        }, 100);
      }

    } else {
      dispatch(fetchError('History item not found'));
    }
  } catch (error) {
    dispatch(fetchError('Error loading history item'));
    console.error('Error loading history item:', error);
  } finally {
    setIsLoadingHistory(false);
  }
};
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas || !photo_img_url) return;
  if (isLoadingHistory) return;
  
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

  img.onerror = function() {
    console.error('Failed to load image:', photo_img_url);
  };

  img.crossOrigin = 'anonymous';
  img.src = photo_img_url;
}, [photo_img_url, isLoadingHistory]); 
const handleSubmitClick = () => {
  if (!photo_img) {
    setMessage('You need to select the image.');
    setShowMessage(true);
    return;
  }

  setLoading(true);

  const eventData = new FormData();
  eventData.append('photo_img', photo_img);
  
  const urlParams = new URLSearchParams(location.search);
  const historyId = urlParams.get('id');
  
  if (historyId) {
    eventData.append('object_id', historyId);
  } else {
    eventData.append('object_id', '0');
  }
  
  selectedImageURL.forEach((file, index) => {
    eventData.append(`selectedImageURL`, file.file);
  });

  dispatch(fetchStart());

  $http
    .post(`${baseURL}recognize_image/`, eventData)
    .then(response => {
      if (response.data.status === 200) {
        dispatch(fetchSuccess('Success!'));
            const responseObjectId = response.data.object_id || response.data.data?.object_id;

        setObjectId(responseObjectId);
        let newSelectedImageURL = [...selectedImageURL];
        newSelectedImageURL.forEach((item, index) => {
          // item.source = response.data.data.sheet_wav_data[index];
          // item.solution = response.data.data.sheet_music_data[index];
        });
        setSelectedImageURL(newSelectedImageURL);
        setGotoDetail(true);
          setTimeout(() => {
        window.location.reload();
      }, 1500); // 1.5 second delay to show success message

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
const isComingFromHistory = () => {
  const urlParams = new URLSearchParams(location.search);
  return urlParams.get('id') !== null;
};
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

    const newImageArray = [...selectedImageURL];
    const draggedIndex = newImageArray.findIndex(item => item.id === draggedItem.id);
    const targetIndex = newImageArray.findIndex(item => item.id === targetItem.id);
    const [draggedItemData] = newImageArray.splice(draggedIndex, 1);
    newImageArray.splice(targetIndex, 0, draggedItemData);

    setSelectedImageURL(newImageArray);
    setDraggedItem(null);
    setDragOverItem(null);
    setGotoDetail(false);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };
const handleGotoDetailClick = () => {
  const urlParams = new URLSearchParams(location.search);
  const historyId = urlParams.get('id');
  const currentObjectId = historyId || objectId;

  History.push({
    pathname: 'detail-page',
    state: { 
      selectedImageURL, 
      photo_img, 
      object_id: currentObjectId,
      title: props.location.state?.title || '',
      COMPOSER: props.location.state?.COMPOSER || '',
    },
  });
};

  const handleMessageClose = () => () => {
    setShowMessage(false);
  };
const loadImageFile = file => {
  let img_file_name = file.name;
  file = new File([file], img_file_name, file);
  const imageUrl = URL.createObjectURL(file);
  setPhotoImgUrl(imageUrl);
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
const handleFileInputChange = async (fileObj) => {
  const fileInput = document.getElementById('photo_img');

  try {
    const response = await freeTrialCheck();

    if (response?.status === 404) {
    toast.error(response?.message || 'Free trial not available');
      setHasFreeTrial(false);
      setShowSubscriptionDialog(false);
      if (fileInput) fileInput.value = '';
      return;
    }

    const { trial, subscription_status } = response || {};

    if (trial === true) {
      setHasFreeTrial(true);
    } else {
      if (subscription_status === "active") {
        setHasFreeTrial(true);
      } else {
        setHasFreeTrial(false);
        setShowSubscriptionDialog(true);
        if (fileInput) fileInput.value = '';
        return;
      }
    }
  } catch (error) {
    console.error('Error checking free trial:', error);
    dispatch(fetchError('Something went wrong while checking subscription'));
    setHasFreeTrial(false);
    setShowSubscriptionDialog(false);
    if (fileInput) fileInput.value = '';
    return;
  }
  if (fileObj && fileObj.type === 'application/pdf') {
    setPhotoImg(fileObj);
    loadPdfFile(fileObj, 1);
  } else if (fileObj?.type?.startsWith?.('image/')) {
    setPhotoImg(fileObj);
    setNumPages(0);
    setCurrentPage(1);
    loadImageFile(fileObj);
    setGotoDetail(false);
  } else {
    dispatch(fetchError('Invalid file format'));
  }

  if (fileInput) {
    fileInput.value = '';
  }
};

const handleMouseDown = e => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  setIsDragging(true);
  setStartX(x);
  setStartY(y);
  setEndX(x);
  setEndY(y);

  e.preventDefault();
};

const handleMouseMove = e => {
  const enlargedImage = document.querySelector('#enlarged-image');
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (!isDragging) {
    if (!zoomFocus) {
      if (enlargedImage) enlargedImage.style.display = 'none';
    } else {
      if (enlargedImage) enlargedImage.style.display = 'block';
    }
  } else {
    // Hide enlarged image while dragging
    if (enlargedImage) enlargedImage.style.display = 'none';
  }

  // Handle drag selection
  if (isDragging) {
    setEndX(x);
    setEndY(y);
    // Call redrawCanvas to show the selection rectangle
    requestAnimationFrame(() => {
      redrawCanvas(true);
    });
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

    // Clear the selection rectangle by redrawing without selection
    setTimeout(() => {
      redrawCanvas(false);
      
      // Update enlarged image background
      try {
        const canvas = canvasRef.current;
        if (enlargedImage && canvas) {
          enlargedImage.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg')})`;
        }
      } catch (error) {
        console.log('Error updating enlarged image:', error);
      }
    }, 50);
  }

  // Restore zoom focus display if enabled
  if (zoomFocus && enlargedImage) {
    enlargedImage.style.display = 'block';
  } else if (enlargedImage) {
    enlargedImage.style.display = 'none';
  }
};

  const redrawCanvas = (showSelection = true) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  img.onload = function() {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (showSelection && isDragging && startX !== endX && startY !== endY) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const actualStartX = Math.min(startX, endX) * scaleX;
      const actualStartY = Math.min(startY, endY) * scaleY;
      const width = Math.abs(endX - startX) * scaleX;
      const height = Math.abs(endY - startY) * scaleY;
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; 
      ctx.lineWidth = 2;
      ctx.strokeRect(actualStartX, actualStartY, width, height);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.fillRect(actualStartX, actualStartY, width, height);
    }
  };
  
  img.onerror = function() {
    console.error('Failed to load image for redraw:', photo_img_url);
  };
  
  img.crossOrigin = 'anonymous';
  img.src = photo_img_url;
};

const redrawCanvasFromImage = (imageUrl) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
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
    
    // Update enlarged image background
    const enlargedImage = document.querySelector('#enlarged-image');
    if (enlargedImage) {
      enlargedImage.style.backgroundImage = `url(${imageUrl})`;
    }
  };

  img.onerror = function() {
    console.error('Failed to load image:', imageUrl);
  };

  img.crossOrigin = 'anonymous';
  img.src = imageUrl;
};
const extractSelectedArea = (startXPos, startYPos, width, height) => {
  try {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasStartX = startXPos * scaleX;
    const canvasStartY = startYPos * scaleY;
    const canvasWidth = width * scaleX;
    const canvasHeight = height * scaleY;
    const cleanCanvas = document.createElement('canvas');
    const cleanCtx = cleanCanvas.getContext('2d');

    cleanCanvas.width = canvas.width;
    cleanCanvas.height = canvas.height;

    const img = new Image();
    img.onload = function() {
      cleanCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;

      tempCtx.drawImage(
        cleanCanvas,
        canvasStartX,
        canvasStartY,
        canvasWidth,
        canvasHeight,
        0,
        0,
        canvasWidth,
        canvasHeight,
      );

      const blob = dataURLtoBlob(tempCanvas.toDataURL('image/png'));
      const file = new File([blob], 'cropped_image.png', { type: 'image/png' });
      const new_id = selectedImageURL.length > 0 ? Math.max(...selectedImageURL.map(item => item.id)) + 1 : 1;

      setSelectedImageURL(prevImages => [
        ...prevImages,
        {
          id: new_id,
          image: tempCanvas.toDataURL('image/png'),
          file: file,
          source: undefined,
          solution: undefined,
          isFromHistory: false 
        },
      ]);
      setGotoDetail(false);
    };

    img.crossOrigin = 'anonymous';
    img.src = photo_img_url;
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
const handleDeleteImage = async (id, isFullObject = false) => {
  const new_img_arr = [...selectedImageURL];
  const indexToDelete = new_img_arr.findIndex(item => item.id === id);
  
  if (indexToDelete === -1) {
    dispatch(fetchError('Image not found'));
    return;
  }

  const cropImage = new_img_arr[indexToDelete];
  
  // Only call API if the image is from history
  if (cropImage.isFromHistory) {
    const urlParams = new URLSearchParams(location.search);
    const historyId = urlParams.get('id');
    const obj_id = historyId;

    // Build correct payload
    let payload = { obj_id, status: isFullObject };

    if (!isFullObject) {
      payload.objects_urls = [cropImage.image]; // ✅ correct key as per API
    }

    try {
      const response = await deleteHistory(payload);

      if (response.status === 200) {
        if (isFullObject) {
          dispatch(fetchSuccess('Object deleted successfully!'));
        } else {
          // Remove from local state after successful API call
          new_img_arr.splice(indexToDelete, 1);
          setSelectedImageURL(new_img_arr);
          dispatch(fetchSuccess('Crop image deleted successfully!'));
        }
      } else {
        dispatch(fetchError(`Failed to delete ${isFullObject ? 'the object' : 'the crop image'}`));
      }
    } catch (error) {
      dispatch(fetchError(`Error deleting ${isFullObject ? 'the object' : 'the crop image'}`));
      console.error(`Error deleting ${isFullObject ? 'the object' : 'the crop image'}:`, error);
    }
  } else {
    // For non-history images (newly cropped), just remove from local state
    new_img_arr.splice(indexToDelete, 1);
    setSelectedImageURL(new_img_arr);
    dispatch(fetchSuccess('Image removed successfully!'));
  }
};
  const handlePlayMidi = id => {
    if (currentMidi === id) {
      setCurrentMidi(0);
    } else {
      setCurrentMidi(id);
    }
  };

const handleScanButtonClick = async () => {
  try {
    const response = await freeTrialCheck();
    const { trial, payment_status } = response || {};

    if (trial === true) {
      setHasFreeTrial(true);
    } else {
      if (payment_status === "order.success") {
        setHasFreeTrial(true);
      } else {
        setHasFreeTrial(false);
        setShowSubscriptionDialog(true);
        return;
      }
    }
  } catch (error) {
    console.error('Error checking free trial:', error);
    setHasFreeTrial(false);
    setShowSubscriptionDialog(true);
    return;
  }
  setOpenScan(true);
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoRef.current.srcObject = stream;
  videoRef.current.play();
};


  const handleSubscriptionRedirect = () => {
    setShowSubscriptionDialog(false);
    History.push('/subscription'); 
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
    {!isComingFromHistory() && (
      <>
        <Button
          variant="contained"
          color="primary"
          onClick={e => {
            document.getElementById('photo_img').click();
          }}
          disabled={loading}
          startIcon={<CloudUpload />}>
         <IntlMessages id="dashboard.upload" />
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleScanButtonClick()}
          disabled={loading}
          startIcon={<PhotoCamera />}>
         <IntlMessages id="dashboard.scan" />
        </Button>
      </>
    )}
    {/* Always show zoom controls */}
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
                    <>
                      <Box className={classes.sectionTitle} style={{ marginBottom: '8px' }}>
                        <Typography variant="h6">
                          <IntlMessages id="dashboard.imageTitle" />
                        </Typography>
                      </Box>
                      <CmtCard>
                        <CmtCardContent>
                          <PerfectScrollbar>
                            {selectedImageURL.map(img => (
                              <div
                                key={img.id}
                                className={clsx(
                                  classes.selectedImageItem,
                                  dragOverItem && dragOverItem.id === img.id && classes.draggedOver,
                                  draggedItem && draggedItem.id === img.id && classes.beingDragged,
                                )}
                                draggable
                                onDragStart={e => handleDragStart(e, img)}
                                onDragOver={e => handleDragOver(e, img)}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={e => handleDrop(e, img)}
                                onDragEnd={handleDragEnd}>
                                <div className={classes.selectedImageThumbnail}>
                                  <CmtImage
                                    src={img.image}
                                    style={{
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
                              <IntlMessages id="dashboard.submit" />
                            </Button>
                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={handleGotoDetailClick}
                              disabled={!gotoDetail}>
                              <IntlMessages id="dashboard.goto" />
                            </Button>
                          </Box>
                        </CmtCardContent>
                      </CmtCard>
                    </>
                  )}
                </div>
                {/* Canvas section - now on the right */}
                <div className={classes.canvasSection}>
                  <Box mb={2} style={{ textAlign: 'center' }}>
                    <Typography variant="h6">
                      <IntlMessages id="dashboard.sheet" />
                    </Typography>
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
      <Dialog open={showSubscriptionDialog} onClose={() => setShowSubscriptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
           <IntlMessages id="dashboard.freeTrial" />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubscriptionDialog(false)} color="primary">
            <IntlMessages id="dashboard.cancel" />
          </Button>
          <Button onClick={handleSubscriptionRedirect} color="primary" variant="contained">
            <IntlMessages id="dashboard.buysubscription" />
          </Button>
        </DialogActions>
      </Dialog>
      {showMessage && <ToastMessage open={showMessage} onClose={handleMessageClose()} message={message} />}
    </PageContainer>
  );
};

export default DashBoard;