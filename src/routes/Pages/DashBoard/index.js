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
    width: 200 /* Adjust the width as per your requirement */,
    height: 200 /* Adjust the height as per your requirement */,
    border: '2px solid #ccc' /* Add any desired border styles */,
    backgroundColor: 'white' /* Set the background color of the enlarged image area */,
    pointerEvents: 'none' /* Allow mouse events to pass through the enlarged image area */,
    backgroundRepeat: 'no-repeat',
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
  const [currentMidi, setCurrentMidi] = useState(0);
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

      // Set the position of the enlarged image container
      enlargedImage.style.top = `${mouseY - rect.top - 100 + imageContainer.scrollTop}px`;
      enlargedImage.style.left = `${mouseX - rect.left - 100 + imageContainer.scrollLeft}px`;
      enlargedImage.style.display = 'block';
      // if (photo_img_url != 'https://via.placeholder.com/600x400')
      //   enlargedImage.style.backgroundImage = `url(${myCanvas.toDataURL('image/jpeg')})`;
      // Set the content of the enlarged image container
      enlargedImage.style.backgroundPositionX = `${-(mouseX - canvas_rect.left - 100)}px`;
      enlargedImage.style.backgroundPositionY = `${-(mouseY - canvas_rect.top - 100)}px`;
    });

    // Register the mouseout event listener
    imageContainer.addEventListener('mouseout', function() {
      // Hide the enlarged image container when the mouse moves out
      enlargedImage.style.display = 'none';
    });
    if (photo_img) handleFileInputChange(photo_img);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
      const fixedWidth = 200;
      const fixedHeight = 200;
      canvas.width = fixedWidth;
      canvas.height = fixedHeight;
      ctx.drawImage(img, 0, 0, fixedWidth, fixedHeight);
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
      const scale = 2;
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

      const dataURL = canvas.toDataURL('image/jpeg');
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
      // The file is a PDF
      setPhotoImg(fileObj);
      loadPdfFile(fileObj, 1);
    } else if (fileObj && fileObj.type.startsWith('image/')) {
      // The file is an image
      setPhotoImg(fileObj);
      setNumPages(0);
      setCurrentPage(1);
      loadImageFile(fileObj);

      // Create a new image object to store in selectedImageURL
      const newImage = {
        id: selectedImageURL.length > 0 ? Math.max(...selectedImageURL.map(item => item.id)) + 1 : 1,
        image: URL.createObjectURL(fileObj), // Create a URL for the uploaded image
        file: fileObj,
        source: undefined,
        solution: undefined,
      };

      // Update the selectedImageURL state with the new image
      setSelectedImageURL(prevImages => [...prevImages, newImage]);
    } else {
      // The file is not a PDF or an image
      dispatch(fetchError('Invalid file format'));
    }
    fileObj = null;
  };

  const handleMouseDown = e => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
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

    if (!zoomFocus) {
      enlargedImage.style.display = 'none';
    } else {
      enlargedImage.style.display = 'block';
    }
    if (!isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setEndX(x);
    setEndY(y);
    redrawCanvas();
    enlargedImage.style.display = 'none';
  };

  const handleMouseUp = () => {
    const enlargedImage = document.querySelector('#enlarged-image');

    if (!zoomFocus) {
      enlargedImage.style.display = 'none';
    } else {
      enlargedImage.style.display = 'block';
    }

    setIsDragging(false);
    redrawCanvas();
    extractSelectedArea();
    try {
      const canvas = canvasRef.current;
      enlargedImage.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg')})`;
    } catch (error) {
      console.log(error);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the original image
    const img = new Image();
    img.src = photo_img_url;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw the selected rectangular area

    const width = endX - startX;
    const height = endY - startY;
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.lineWidth = 2;

    ctx.strokeRect(startX, startY, width, height);
  };

  const extractSelectedArea = () => {
    try {
      const canvas = canvasRef.current;
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      const width = endX - startX;
      const height = endY - startY;

      // Set the dimensions of the temporary canvas
      tempCanvas.width = width;
      tempCanvas.height = height;

      // Draw the selected area onto the temporary canvas
      tempCtx.drawImage(canvas, startX, startY, width, height, 0, 0, width, height);

      // Return the data URL of the extracted image

      const blob = dataURLtoBlob(tempCanvas.toDataURL('image/png'));

      // Create a new File object from the Blob
      const file = new File([blob], 'image.png', { type: 'image/png' });

      const new_id = selectedImageURL.length > 0 ? Math.max(...selectedImageURL.map(item => item.id)) + 1 : 1;

      selectedImageURL.push({
        id: new_id,
        image: tempCanvas.toDataURL('image/png'),
        file: file,
        source: undefined,
        solution: undefined,
      });
      setGotoDetail(false);
    } catch (error) {
      console.log(error);
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
      return null; // or handle the error in an appropriate way
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
    if (currentMidi == id) {
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
            const new_scale = (new_scale * fullWidth) / canvas.width;
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
            <Grid item xs={12} sm={12} md={12}>
              <CmtCard>
                <CmtCardHeader title="Selected Image" className="pt-4"></CmtCardHeader>
                <CmtCardContent>
                  <PerfectScrollbar>
                    <Box className="Cmt-table-responsive">
                      <Table>
                        <TableBody>
                          {selectedImageURL.map(img => (
                            <TableRow key={img.id}>
                              <TableCell>
                                <div className="jr-card-thumb">
                                  <CmtImage
                                    id={`second_image${img.id}`}
                                    src={img.image}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                  />
                                  {currentMidi && currentMidi === img.id ? (
                                    <audio
                                      src={`${mediaURL}${img.source}`}
                                      controls
                                      autoPlay={img.id === currentMidi}></audio>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell style={{ padding: '0px' }}>
                                {img.source ? (
                                  <IconButton
                                    style={{ marginLeft: 4 }}
                                    color="secondary"
                                    onClick={() => handlePlayMidi(img.id)}>
                                    {img.id === currentMidi ? <Stop /> : <PlayArrow />}
                                  </IconButton>
                                ) : null}
                              </TableCell>
                              <TableCell>{img.solution ? img.solution : ''}</TableCell>
                              <TableCell style={{ padding: '0px' }}>
                                <IconButton
                                  style={{ marginLeft: 4 }}
                                  color="secondary"
                                  onClick={() => handleDeleteImage(img.id)}>
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </PerfectScrollbar>
                  <Box mt={4}>
                    <GridContainer>
                      <Grid item xs={6} style={{ textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSubmitClick}
                          disabled={loading || selectedImageURL.length == 0}
                          startIcon={<Send />}>
                          Submit
                        </Button>
                      </Grid>
                      <Grid item xs={6} style={{ textAlign: 'center' }}>
                        <Button variant="contained" color="primary" onClick={handleGotoDetailClick} disabled={!gotoDetail}>
                          Go to Detail
                        </Button>
                      </Grid>
                    </GridContainer>
                  </Box>
                </CmtCardContent>
              </CmtCard>
            </Grid>
            <Grid item xs={4} style={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={e => {
                  document.getElementById('photo_img').click();
                }}
                disabled={loading}
                startIcon={<CloudUpload />}>
                Upload Image/PDF
              </Button>
            </Grid>
            <Grid item xs={4} style={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleScanButtonClick()}
                disabled={loading}
                startIcon={<PhotoCamera />}>
                Scan
              </Button>
            </Grid>
            <Grid item xs={4} style={{ textAlign: 'center' }}>
              <IconButton style={{ marginLeft: 4 }} color="secondary" onClick={() => handleZoomInClick()}>
                <ZoomIn />
              </IconButton>
              <IconButton style={{ marginLeft: 4 }} color="secondary" onClick={() => handleZoomOutClick()}>
                <ZoomOut />
              </IconButton>
              <IconButton style={{ marginLeft: 4 }} color="secondary" onClick={() => handleZoomOutMapClick()}>
                <ZoomOutMap />
              </IconButton>
              <IconButton
                style={{ marginLeft: 4 }}
                color={zoomFocus ? 'secondary' : 'primary'}
                onClick={() => handleZoomFocusClick()}>
                <CenterFocusStrong />
              </IconButton>
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Box mb={6} style={{ textAlign: 'center' }}>
                {/* <div className="jr-card-thumb">
                  <CmtImage
                    src={photo_img_url}
                    alt={'photo image'}
                    style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                  />
                </div> */}
                <div className="d-flex justify-content-center mt-2">Sheet Music</div>
                <input
                  type="file"
                  id="photo_img"
                  name="photo_img"
                  style={{ display: 'none' }}
                  onChange={event => handleFileInputChange(event.target.files[0])}
                />
                <div
                  style={{ width: '100%', height: '800px', overflow: 'auto' }}
                  className={clsx(classes.imageContainer)}
                  id="image-container">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{ height: '500', width: '500', left: 0, top: 0 }}
                    id="myCanvas"
                  />
                  <div className={clsx(classes.enlargedImage)} id="enlarged-image"></div>
                </div>
                {numPages ? (
                  <Box mt={4}>
                    <Button variant="contained" size="small" color="secondary" className="mr-3" onClick={handlePrevClick}>
                      Prev
                    </Button>
                    <span>
                      Page {currentPage} of {numPages}
                    </span>
                    <Button variant="contained" size="small" color="secondary" className="ml-3" onClick={handleNextClick}>
                      Next
                    </Button>
                  </Box>
                ) : null}
                {/* <button onClick={handleCropButtonClick}>Crop Image</button> */}
              </Box>
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
