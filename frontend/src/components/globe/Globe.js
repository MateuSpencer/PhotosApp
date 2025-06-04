import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { 
  Cartesian3, 
  createOsmBuildingsAsync, 
  Ion, 
  IonImageryProvider,
  Math as CesiumMath, 
  Terrain, 
  Viewer, 
  Color, 
  Cartesian2,
  NearFarScalar,
  LabelStyle,
  HeightReference,
  VerticalOrigin
} from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import { Box, CircularProgress } from '@mui/material';

// Set Cesium base URL for static assets
window.CESIUM_BASE_URL = '/';

// Set your Cesium Ion access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzN2E1NDIxZC03ZmVjLTRmNDYtODkwYi1hNDQ3ZjA2NmFmOWMiLCJpZCI6MjI3MDk5LCJpYXQiOjE3MjA0Mzc1ODN9.MkW6DXegSoRWiKE7yYnl3CzHEwvnAOo78XCLrSKkpQk';

const GlobeComponent = ({ mediaItems = [], onSelectItem, selectedItemId }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const entitiesRef = useRef(new Map()); // Track entities for cleanup

  // Initialize Cesium viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    try {
      console.log('Initializing Cesium viewer...');
      
      // Initialize the Cesium Viewer
      const viewer = new Viewer(containerRef.current, {
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        infoBox: true,
        selectionIndicator: true
      });

      viewerRef.current = viewer;

      // Enable lighting based on sun/moon positions
      viewer.scene.globe.enableLighting = true;

      // Remove buildings for lighter performance
      // createOsmBuildingsAsync().then(buildingTileset => {
      //   viewer.scene.primitives.add(buildingTileset);
      // }).catch(error => {
      //   console.warn('Could not load building tileset:', error);
      // });

      // Set initial camera position (San Francisco as per tutorial)
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
        orientation: {
          heading: CesiumMath.toRadians(0.0),
          pitch: CesiumMath.toRadians(-15.0),
        }
      });

      // Handle click events
      viewer.cesiumWidget.screenSpaceEventHandler.setInputAction((event) => {
        const pickedObject = viewer.scene.pick(event.position);
        if (pickedObject && pickedObject.id && pickedObject.id.mediaItemId) {
          if (onSelectItem) {
            onSelectItem(pickedObject.id.mediaItemId);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      setLoading(false);
      console.log('Cesium viewer initialized successfully');

    } catch (err) {
      console.error('Error initializing Cesium viewer:', err);
      setError(`Failed to initialize viewer: ${err.message}`);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
          viewerRef.current = null;
        } catch (err) {
          console.warn('Error destroying Cesium viewer:', err);
        }
      }
    };
  }, [onSelectItem]);

  // Add/update media markers
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    try {
      console.log('Updating media markers for', mediaItems.length, 'items');

      // Clear existing entities
      entitiesRef.current.forEach((entity, id) => {
        viewer.entities.remove(entity);
      });
      entitiesRef.current.clear();

      // Filter items with valid location data
      const itemsWithLocation = mediaItems.filter(item => 
        item.latitude !== null && 
        item.longitude !== null && 
        !isNaN(item.latitude) && 
        !isNaN(item.longitude)
      );

      console.log('Items with location:', itemsWithLocation.length);

      // Add markers for each media item
      itemsWithLocation.forEach(item => {
        const isSelected = selectedItemId === item.id;
        
        const entity = viewer.entities.add({
          position: Cartesian3.fromDegrees(item.longitude, item.latitude),
          billboard: {
            image: isSelected ? '/pin-selected.svg' : '/pin-default.svg',
            width: 32,
            height: 32,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            verticalOrigin: VerticalOrigin.BOTTOM,
            scaleByDistance: new NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5)
          },
          label: {
            text: item.title || `Media Item ${item.id}`,
            font: '12pt sans-serif',
            pixelOffset: new Cartesian2(0, -50),
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            style: LabelStyle.FILL_AND_OUTLINE,
            show: isSelected
          },
          mediaItemId: item.id
        });

        entitiesRef.current.set(item.id, entity);
      });

    } catch (err) {
      console.error('Error updating media markers:', err);
    }
  }, [mediaItems, selectedItemId]);

  // Focus on selected item
  useEffect(() => {
    const viewer = viewerRef.current;
    if (selectedItemId && viewer) {
      try {
        const selectedItem = mediaItems.find(item => item.id === selectedItemId);
        if (selectedItem && selectedItem.latitude && selectedItem.longitude) {
          // Fly to the selected location
          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(
              selectedItem.longitude, 
              selectedItem.latitude, 
              1000 // height in meters
            ),
            duration: 2.0 // animation duration in seconds
          });
        }
      } catch (err) {
        console.error('Error focusing on selected item:', err);
      }
    }
  }, [selectedItemId, mediaItems]);

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
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
            color: 'error.main',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            p: 2,
            borderRadius: 1
          }}
        >
          Error: {error}
        </Box>
      )}
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
          Cesium: {viewerRef.current ? 'Initialized' : 'Not initialized'} | 
          Items: {mediaItems.length} | 
          With location: {mediaItems.filter(item => 
            item.latitude !== null && item.longitude !== null && 
            !isNaN(item.latitude) && !isNaN(item.longitude)
          ).length}
        </Box>
      )}
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '100%'
        }}
      />
    </Box>
  );
};

export default GlobeComponent;
