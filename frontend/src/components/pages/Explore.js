import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import GlobeComponent from '../globe/Globe';
import Timeline from '../timeline/Timeline';
import ErrorBoundary from '../ErrorBoundary';
import { mediaAPI } from '../../services/api';

function Explore() {
  const [loading, setLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        setLoading(true);
        
        // Fetch all media items from API
        console.log('Fetching media items...');
        
        const response = await mediaAPI.getAllMediaItems();
        const mediaItems = response.data || [];
        console.log('Fetched media items from API:', mediaItems.length);
        
        // Filter items with location data for debugging
        const itemsWithLocation = mediaItems.filter(item => 
          item.latitude !== null && item.longitude !== null
        );
        console.log('Items with location data:', itemsWithLocation.length);
        
        setMediaItems(mediaItems);
        if (mediaItems.length > 0) {
          setSelectedItemId(mediaItems[0].id);
        }
      } catch (err) {
        setError('Failed to fetch media items');
        console.error('Error fetching media items:', err);
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
        <ErrorBoundary>
          <GlobeComponent 
            key="explore-globe"
            mediaItems={mediaItems} 
            onSelectItem={handleSelectItem} 
            selectedItemId={selectedItemId} 
          />
        </ErrorBoundary>
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
