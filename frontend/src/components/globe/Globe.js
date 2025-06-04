import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { Box, CircularProgress } from '@mui/material';

const GlobeComponent = ({ mediaItems = [], onSelectItem, selectedItemId }) => {
  const mountRef = useRef(null);
  const globeContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const globeRef = useRef(null);
  const isInitializedRef = useRef(false);
  const resizeHandlerRef = useRef(null);

  // Initialize the Globe.gl instance
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    const initializeGlobe = () => {
      const container = globeContainerRef.current;
      if (!container) {
        console.log('Container not ready, retrying...');
        setTimeout(initializeGlobe, 100);
        return;
      }

      // Check container dimensions
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.log('Container has no dimensions, retrying...');
        setTimeout(initializeGlobe, 100);
        return;
      }

      try {
        console.log('Creating Globe.gl instance with dimensions:', rect.width, 'x', rect.height);
        
        // Create Globe.gl instance
        const globe = new Globe(container)
          .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
          .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
          .showAtmosphere(true)
          .atmosphereColor('#3a228a')
          .atmosphereAltitude(0.25)
          .backgroundColor('rgba(0, 0, 17, 0.8)')
          .width(rect.width)
          .height(rect.height)
          .enablePointerInteraction(true);

        globeRef.current = globe;
        isInitializedRef.current = true;

        // Handle window resize
        const handleResize = () => {
          if (globeRef.current && globeContainerRef.current) {
            const newRect = globeContainerRef.current.getBoundingClientRect();
            if (newRect.width > 0 && newRect.height > 0) {
              try {
                globeRef.current
                  .width(newRect.width)
                  .height(newRect.height);
              } catch (error) {
                console.warn('Error during globe resize:', error);
              }
            }
          }
        };
        
        resizeHandlerRef.current = handleResize;
        window.addEventListener('resize', handleResize);

        setLoading(false);
        setError(null);
        console.log('Globe.gl initialization complete');
        
      } catch (error) {
        console.error('Error initializing Globe.gl:', error);
        setLoading(false);
        setError(`Failed to initialize globe: ${error.message}`);
      }
    };

    // Start initialization with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeGlobe, 50);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      
      // Remove resize listener
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
      
      // Clean up globe
      if (globeRef.current) {
        try {
          const globe = globeRef.current;
          
          // Clear any data
          if (typeof globe.pointsData === 'function') {
            globe.pointsData([]);
          }
          
          // Stop animations
          if (typeof globe.pauseAnimation === 'function') {
            globe.pauseAnimation();
          }
          
          // Dispose if available
          if (typeof globe._destructor === 'function') {
            globe._destructor();
          }
          
        } catch (error) {
          console.warn('Error during globe cleanup:', error);
        } finally {
          globeRef.current = null;
          isInitializedRef.current = false;
        }
      }
    };
  }, []);

  // Add markers for media items
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) {
      console.log('Globe not initialized yet, skipping markers update');
      return;
    }

    try {
      console.log('Adding markers for', mediaItems.length, 'media items');

      // Filter media items that have location data
      const itemsWithLocation = mediaItems.filter(item => 
        item.latitude !== null && 
        item.longitude !== null && 
        !isNaN(item.latitude) && 
        !isNaN(item.longitude)
      );

      console.log('Items with location:', itemsWithLocation.length);

      // Convert media items to Globe.gl points format
      const pointsData = itemsWithLocation.map(item => ({
        lat: item.latitude,
        lng: item.longitude,
        id: item.id,
        mediaItem: item,
        selected: selectedItemId === item.id
      }));

      // Update globe with points data (even if empty array)
      globe
        .pointsData(pointsData)
        .pointAltitude(0.1)
        .pointRadius(0.8)
        .pointColor(d => d.selected ? '#ff4444' : '#ffdd44')
        .pointLabel(d => d.mediaItem.title || `Media Item ${d.id}`)
        .onPointClick((point, event) => {
          if (onSelectItem && point.id) {
            onSelectItem(point.id);
          }
        });

      console.log('Added', pointsData.length, 'markers');
    } catch (error) {
      console.error('Error adding markers to globe:', error);
    }
  }, [mediaItems, selectedItemId, onSelectItem]);

  // Focus on selected item
  useEffect(() => {
    const globe = globeRef.current;
    if (selectedItemId && globe) {
      try {
        // Find the selected item
        const selectedItem = mediaItems.find(item => item.id === selectedItemId);
        if (selectedItem && selectedItem.latitude && selectedItem.longitude) {
          // Animate camera to focus on the selected point
          globe.pointOfView(
            { 
              lat: selectedItem.latitude, 
              lng: selectedItem.longitude, 
              altitude: 2.5 
            },
            1500 // animation duration in ms
          );
        }
      } catch (error) {
        console.error('Error focusing on selected item:', error);
      }
    }
  }, [selectedItemId, mediaItems]);

  return (
    <Box 
      ref={mountRef} 
      sx={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        overflow: 'hidden' // Prevent any overflow issues
      }}
    >
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center',
            color: 'error.main'
          }}
        >
          Error: {error}
        </Box>
      )}
      {/* Debug info */}
      {!loading && !error && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            zIndex: 10,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            p: 1,
            borderRadius: 1,
            fontSize: '0.8rem'
          }}
        >
          Globe: {globeRef.current ? 'Initialized' : 'Not initialized'} | 
          Items: {mediaItems.length} | 
          With location: {mediaItems.filter(item => 
            item.latitude !== null && item.longitude !== null && 
            !isNaN(item.latitude) && !isNaN(item.longitude)
          ).length}
        </Box>
      )}
      {/* Create an isolated div for Globe.gl to prevent React conflicts */}
      <div 
        ref={globeContainerRef}
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '4px'
        }}
        suppressHydrationWarning={true}
      />
    </Box>
  );
};

export default GlobeComponent;
