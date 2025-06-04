import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mediaAPI } from '../../services/api';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Fade,
  Paper
} from '@mui/material';
import {
  SkipPrevious as PrevIcon,
  SkipNext as NextIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Globe from '../globe/Globe';
import Timeline from '../timeline/Timeline';

function Presentation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        setLoading(true);
        
        // Fetch media items for this narrative from API
        const response = await mediaAPI.getMediaItems(id);
        const mediaItems = response.data;
        
        setMediaItems(mediaItems);
        if (mediaItems.length > 0) {
          setSelectedItemId(mediaItems[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch media items', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaItems();
  }, [id]);
  
  const handlePlayPause = () => {
    setPlaying(!playing);
  };
  
  const handleSelectItem = (itemId) => {
    setSelectedItemId(itemId);
  };
  
  const handleClose = () => {
    navigate(`/projects/${id}`);
  };
  
  const currentMedia = mediaItems.find(item => item.id === selectedItemId);
  
  return (
    <Box
      sx={{
        bgcolor: 'black',
        color: 'white',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top bar with close button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2
        }}
      >
        <IconButton color="inherit" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        {/* Globe */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 100,
            opacity: 0.8
          }}
        >
          <Globe 
            mediaItems={mediaItems} 
            onSelectItem={handleSelectItem} 
            selectedItemId={selectedItemId} 
          />
        </Box>
        
        {/* Current media */}
        {currentMedia && (
          <Fade in={true}>
            <Paper
              elevation={10}
              sx={{
                width: '60%',
                height: '60%',
                bgcolor: 'grey.900',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: currentMedia.media_type === 'video' ? 'secondary.dark' : 'primary.dark',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {currentMedia.media_type === 'video' ? (
                  <PlayIcon sx={{ fontSize: 60, color: 'white' }} />
                ) : (
                  <Typography variant="h6" color="white">
                    Photo {mediaItems.findIndex(item => item.id === currentMedia.id) + 1}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Fade>
        )}
        
        {/* Media info */}
        {currentMedia && (
          <Box
            sx={{
              mt: 2,
              textAlign: 'center',
              zIndex: 10
            }}
          >
            <Typography variant="h6">
              {currentMedia.location || 'Unknown Location'}
            </Typography>
            <Typography variant="body1">
              {currentMedia.capture_date ? new Date(currentMedia.capture_date).toLocaleDateString() : 'Unknown Date'}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Timeline */}
      <Box
        sx={{
          height: 100,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10
        }}
      >
        <Timeline 
          mediaItems={mediaItems} 
          onSelectItem={handleSelectItem} 
          selectedItemId={selectedItemId} 
        />
      </Box>
    </Box>
  );
}

export default Presentation;
