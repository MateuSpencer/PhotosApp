import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import Globe from '../globe/Globe';
import Timeline from '../timeline/Timeline';
import axios from 'axios';

function Explore() {
  const [loading, setLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // In a real app, this would fetch from the API
    const fetchMediaItems = async () => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockMediaItems = Array.from({ length: 20 }, (_, i) => {
          // Generate random coordinates around the world
          const latitude = (Math.random() * 180) - 90;
          const longitude = (Math.random() * 360) - 180;
          
          // Generate random dates within the last year
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 365));
          
          return {
            id: i + 1,
            title: `Media ${i + 1}`,
            media_type: i % 5 === 0 ? 'video' : 'photo',
            capture_date: date.toISOString(),
            latitude,
            longitude,
            altitude: Math.random() * 100
          };
        });
        
        setMediaItems(mockMediaItems);
        if (mockMediaItems.length > 0) {
          setSelectedItemId(mockMediaItems[0].id);
        }
      } catch (err) {
        setError('Failed to fetch media items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaItems();
  }, []);

  const handleSelectItem = (itemId) => {
    setSelectedItemId(itemId);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Explore Your Memories
      </Typography>
      
      <Box 
        sx={{ 
          height: 'calc(100vh - 200px)', 
          display: 'flex', 
          flexDirection: 'column',
          border: '1px solid #ccc',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2
        }}
      >
        <Globe 
          mediaItems={mediaItems} 
          onSelectItem={handleSelectItem} 
          selectedItemId={selectedItemId} 
        />
      </Box>
      
      <Box 
        sx={{ 
          border: '1px solid #ccc',
          borderRadius: 2,
        }}
      >
        <Timeline 
          mediaItems={mediaItems} 
          onSelectItem={handleSelectItem} 
          selectedItemId={selectedItemId} 
        />
      </Box>
    </Container>
  );
}

export default Explore;
