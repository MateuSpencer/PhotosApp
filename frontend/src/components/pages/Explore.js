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
        
        // Add dummy data for testing globe visibility
        const dummyData = [
          {
            id: 1,
            title: 'Test Photo 1',
            latitude: 40.7128,
            longitude: -74.0060,
            media_type: 'photo',
            location: 'New York, NY',
            capture_date: '2024-01-15'
          },
          {
            id: 2,
            title: 'Test Photo 2',
            latitude: 51.5074,
            longitude: -0.1278,
            media_type: 'photo',
            location: 'London, UK',
            capture_date: '2024-02-20'
          },
          {
            id: 3,
            title: 'Test Photo 3',
            latitude: 35.6762,
            longitude: 139.6503,
            media_type: 'photo',
            location: 'Tokyo, Japan',
            capture_date: '2024-03-10'
          }
        ];
        
        try {
          const response = await mediaAPI.getAllMediaItems();
          const apiMediaItems = response.data || [];
          console.log('Fetched media items from API:', apiMediaItems.length);
          
          // Use API data if available, otherwise use dummy data
          const mediaItems = apiMediaItems.length > 0 ? apiMediaItems : dummyData;
          console.log('Using media items:', mediaItems.length);
          console.log('Sample media item:', mediaItems[0]);
          
          // Filter items with location data for debugging
          const itemsWithLocation = mediaItems.filter(item => 
            item.latitude !== null && item.longitude !== null
          );
          console.log('Items with location data:', itemsWithLocation.length);
          
          setMediaItems(mediaItems);
          if (mediaItems.length > 0) {
            setSelectedItemId(mediaItems[0].id);
          }
        } catch (apiError) {
          console.warn('API call failed, using dummy data:', apiError);
          console.log('Using dummy data for testing');
          setMediaItems(dummyData);
          setSelectedItemId(dummyData[0].id);
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
