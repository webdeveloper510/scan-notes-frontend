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
} from '@material-ui/core';
import { PlayArrow, Stop, Undo, Print, CloudDownload, Edit } from '@material-ui/icons';

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
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useTheme } from '@material-ui/core/styles';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const breadcrumbs = [
  { label: <IntlMessages id={'sidebar.main'} />, link: '/' },
  { label: <IntlMessages id={'pages.detailPage'} />, isActive: true },
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
  },
  editImage: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    zIndex: 2,
  },
}));

const DetailPage = props => {
  const classes = useStyles();
  const History = useHistory();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState(props.location.state.selectedImageURL);
  const [currentMidi, setCurrentMidi] = useState(0);
  const [showImage, setShowImage] = useState(-1);
  const [selectedColor, setSelectedColor] = useState('red');

  const theme = useTheme();
  const canvasRef = useRef(null);
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [zoomRate, setZoomRate] = useState(2);

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

            // set the canvas dimensions to match the scaled image size
            canvas.width = width;
            canvas.height = height;

            // draw the image onto the canvas at the correct size
            ctx.drawImage(img, 0, 0, width, height);
          };
          img.src = results.find(item => item.id == showImage).image;
        }
      };
      setTimeout(handleImageLoad, 0);
    }
  }, [showImage]);

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

  const handleDownloadClick = () => {
    const table = document.getElementById('scan-table');

    // Set the style of the second column (index 1) to hide it in the PDF
    const rows = table.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td');
      if (cells.length > 1) {
        cells[1].style.display = 'none';
      }
      const h_cells = rows[i].getElementsByTagName('th');

      if (h_cells.length > 1) {
        h_cells[1].style.display = 'none';
      }
    }

    for (let i = 0; i < results.length; i++) {
      const pencil = document.getElementById(`pencil-${i}`);
      if (pencil) {
        pencil.style.display = 'none';
      }
    }

    html2canvas(table).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const img = new Image();
      img.src = imgData;

      img.addEventListener('load', function() {
        const imageHeight = img.naturalHeight;
        const imageWidth = img.naturalWidth;
        const titleHeight = 30;

        const pdf = new jsPDF();
        const width = pdf.internal.pageSize.getWidth() * 0.9;

        const height = (width * imageHeight) / imageWidth; //pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', pdf.internal.pageSize.getWidth() * 0.05, titleHeight, width, height);

        // Restore the style of the second column to display it back in the web page
        for (let i = 0; i < rows.length; i++) {
          const cells = rows[i].getElementsByTagName('td');
          if (cells.length > 1) {
            cells[1].style.display = '';
          }
          const h_cells = rows[i].getElementsByTagName('th');
          if (h_cells.length > 1) {
            h_cells[1].style.display = '';
          }
        }

        for (let i = 0; i < results.length; i++) {
          const pencil = document.getElementById(`pencil-${i}`);
          if (pencil) {
            pencil.style.display = '';
          }
        }

        pdf.save('print.pdf');
      });
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
    setIsDrawing(true);
    setStartX(event.nativeEvent.offsetX);
    setStartY(event.nativeEvent.offsetY);
  };

  const handleImageMouseMove = event => {
    if (!isDrawing) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const currentX = event.nativeEvent.offsetX;
    const currentY = event.nativeEvent.offsetY;

    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(currentX, currentY);
    context.strokeStyle = selectedColor;
    context.lineWidth = 2;
    context.stroke();

    setStartX(currentX);
    setStartY(currentY);
  };

  const handleImageMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <PageContainer heading={<IntlMessages id="pages.detailPage" />} breadcrumbs={breadcrumbs}>
      <GridContainer>
        <Grid item xs={12}>
          <CmtCard className={classes.cardRoot}>
            <CmtCardHeader
              className="pt-4"
              title="Results"
              titleProps={{
                variant: 'h4',
                component: 'div',
              }}>
              <Box clone mx={4}>
                <Tooltip title="Print" aria-label="Print">
                  <Button color="primary" variant="contained" onClick={handlePrintClick}>
                    <Print />
                  </Button>
                </Tooltip>
              </Box>
              <Box clone mx={4}>
                <Tooltip title="Download" aria-label="Download">
                  <Button color="primary" variant="contained" onClick={handleDownloadClick}>
                    <CloudDownload />
                  </Button>
                </Tooltip>
              </Box>
              <Box clone mx={4}>
                <Tooltip title="Go Back" aria-label="Go Back">
                  <Button color="primary" onClick={handleGoBackClick}>
                    <Undo />
                  </Button>
                </Tooltip>
              </Box>
            </CmtCardHeader>
            <CmtCardContent className={classes.cardContentRoot}>
              <div className="Cmt-table-responsive" id="scan-table">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Solution</TableCell>
                      <TableCell>Comment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className={`jr-card-thumb image-container ${classes.imageContainer}`}>
                            <CmtImage
                              id={`second_image${result.id}`}
                              src={result.image}
                              style={{ 
                                // width: '200px',
                                //  height: '150px',
                                  objectFit: 'cover' }}
                            />
                            {currentMidi && currentMidi === result.id ? (
                              <audio
                                src={`${mediaURL}${result.source}`}
                                controls
                                autoPlay={result.id === currentMidi}></audio>
                            ) : null}
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
                        <TableCell style={{ padding: '0px' }}>
                          {result.source ? (
                            <IconButton
                              style={{ marginLeft: 4 }}
                              color="secondary"
                              onClick={() => handlePlayMidi(result.id)}>
                              {result.id === currentMidi ? <Stop /> : <PlayArrow />}
                            </IconButton>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <TextField multiline minRows={4} />
                        </TableCell>
                        <TableCell>
                          <TextField multiline minRows={4} />
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
        aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">
          {'Choisissez une tonalité de couleur et modifiez votre image.'}
        </DialogTitle>
        <DialogContent>
          <Box>
            <RadioGroup aria-label="Color" name="color" value={selectedColor} onChange={handleColorChange}>
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
            style={{ height: '500', width: '500', left: 0, top: 0 }}
            onMouseDown={handleImageMouseDown}
            onMouseMove={handleImageMouseMove}
            onMouseUp={handleImageMouseUp}
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
