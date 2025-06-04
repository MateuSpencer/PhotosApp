import React, { useState, useEffect, useRef } from 'react';
import { Box, Slider, IconButton, Typography } from '@mui/material';
import {
  SkipPrevious as PrevIcon,
  SkipNext as NextIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';

const Timeline = ({ mediaItems = [], onSelectItem, selectedItemId }) => {
  const [value, setValue] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [timelineItems, setTimelineItems] = useState([]);
  const playIntervalRef = useRef(null);
  
  // Sort and prepare media items for the timeline
  useEffect(() => {
    if (mediaItems.length === 0) return;
    
    // Sort by capture date
    const sortedItems = [...mediaItems].sort((a, b) => {
      if (!a.capture_date) return 1;
      if (!b.capture_date) return -1;
      return new Date(a.capture_date) - new Date(b.capture_date);
    });
    
    setTimelineItems(sortedItems);
    
    // If there's a selected item, set the timeline value to its position
    if (selectedItemId) {
      const index = sortedItems.findIndex(item => item.id === selectedItemId);
      if (index !== -1) {
        setValue(index);
      }
    }
  }, [mediaItems, selectedItemId]);
  
  // Handle timeline value change
  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (timelineItems[newValue]) {
      onSelectItem(timelineItems[newValue].id);
    }
  };
  
  // Handle play/pause
  const handlePlayPause = () => {
    setPlaying(!playing);
  };
  
  // Handle previous item
  const handlePrev = () => {
    if (value > 0) {
      const newValue = value - 1;
      setValue(newValue);
      if (timelineItems[newValue]) {
        onSelectItem(timelineItems[newValue].id);
      }
    }
  };
  
  // Handle next item
  const handleNext = () => {
    if (value < timelineItems.length - 1) {
      const newValue = value + 1;
      setValue(newValue);
      if (timelineItems[newValue]) {
        onSelectItem(timelineItems[newValue].id);
      }
    }
  };
  
  // Auto-play functionality
  useEffect(() => {
    if (playing) {
      playIntervalRef.current = setInterval(() => {
        setValue(prevValue => {
          const newValue = prevValue < timelineItems.length - 1 ? prevValue + 1 : 0;
          if (timelineItems[newValue]) {
            onSelectItem(timelineItems[newValue].id);
          }
          return newValue;
        });
      }, 3000); // Change slide every 3 seconds
    } else {
      clearInterval(playIntervalRef.current);
    }
    
    return () => {
      clearInterval(playIntervalRef.current);
    };
  }, [playing, timelineItems, onSelectItem]);
  
  // Get current date to display
  const currentDate = timelineItems[value]?.capture_date 
    ? new Date(timelineItems[value].capture_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';
  
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton onClick={handlePrev} disabled={value === 0 || timelineItems.length === 0}>
          <PrevIcon />
        </IconButton>
        <IconButton onClick={handlePlayPause} disabled={timelineItems.length <= 1}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </IconButton>
        <IconButton onClick={handleNext} disabled={value === timelineItems.length - 1 || timelineItems.length === 0}>
          <NextIcon />
        </IconButton>
        <Typography variant="body2" sx={{ ml: 2 }}>
          {currentDate}
        </Typography>
      </Box>
      
      <Slider
        value={value}
        onChange={handleChange}
        min={0}
        max={Math.max(0, timelineItems.length - 1)}
        step={1}
        disabled={timelineItems.length <= 1}
        sx={{
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
          }
        }}
      />
      
      {/* Thumbnails preview - simplified version */}
      <Box sx={{ display: 'flex', overflowX: 'auto', mt: 1, pb: 1 }}>
        {timelineItems.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              width: 60,
              height: 60,
              minWidth: 60,
              bgcolor: selectedItemId === item.id ? 'primary.main' : 'grey.300',
              mr: 1,
              borderRadius: 1,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: selectedItemId === item.id ? '2px solid' : 'none',
              borderColor: 'primary.main'
            }}
            onClick={() => {
              setValue(index);
              onSelectItem(item.id);
            }}
          >
            {item.media_type === 'video' ? (
              <PlayIcon />
            ) : (
              <Typography variant="caption">{index + 1}</Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Timeline;
