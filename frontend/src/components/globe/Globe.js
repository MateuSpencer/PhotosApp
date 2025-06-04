import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Box, CircularProgress } from '@mui/material';

const Globe = ({ mediaItems = [], onSelectItem, selectedItemId }) => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const markersRef = useRef({});
  const globeRef = useRef(null);

  // Initialize the 3D scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45, // Field of view
      mountRef.current.clientWidth / mountRef.current.clientHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 1);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Create Earth globe
    const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      specular: 0x112233,
      shininess: 30
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);
    globeRef.current = earthMesh;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (mountRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    setLoading(false);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  // Add markers for media items
  useEffect(() => {
    if (!sceneRef.current || !globeRef.current || mediaItems.length === 0) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      sceneRef.current.remove(marker);
    });
    markersRef.current = {};

    // Add new markers
    mediaItems.forEach(item => {
      if (item.latitude && item.longitude) {
        // Convert lat/long to 3D coordinates
        const phi = (90 - item.latitude) * (Math.PI / 180);
        const theta = (item.longitude + 180) * (Math.PI / 180);
        
        const x = -(2.1 * Math.sin(phi) * Math.cos(theta));
        const y = 2.1 * Math.cos(phi);
        const z = 2.1 * Math.sin(phi) * Math.sin(theta);

        // Create marker
        const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
          color: selectedItemId === item.id ? 0xff0000 : 0xffff00 
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(x, y, z);
        marker.userData = { itemId: item.id };
        
        sceneRef.current.add(marker);
        markersRef.current[item.id] = marker;
      }
    });
  }, [mediaItems, selectedItemId]);

  // Handle marker click
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      // Calculate mouse position in normalized device coordinates
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, cameraRef.current);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(Object.values(markersRef.current));
      
      if (intersects.length > 0) {
        const selectedMarker = intersects[0].object;
        const itemId = selectedMarker.userData.itemId;
        if (onSelectItem && itemId) {
          onSelectItem(itemId);
        }
      }
    };

    rendererRef.current.domElement.addEventListener('click', handleClick);

    return () => {
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener('click', handleClick);
      }
    };
  }, [onSelectItem]);

  // Focus on selected item
  useEffect(() => {
    if (selectedItemId && markersRef.current[selectedItemId] && controlsRef.current) {
      const marker = markersRef.current[selectedItemId];
      
      // Update marker color
      Object.values(markersRef.current).forEach(m => {
        m.material.color.set(0xffff00);
      });
      marker.material.color.set(0xff0000);
      
      // Animate camera to focus on the marker
      const targetPosition = new THREE.Vector3().copy(marker.position);
      targetPosition.normalize().multiplyScalar(5);
      
      // Simple animation
      const startPosition = new THREE.Vector3().copy(cameraRef.current.position);
      const duration = 1000; // ms
      const startTime = Date.now();
      
      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease function
        const ease = t => t<.5 ? 2*t*t : -1+(4-2*t)*t;
        const t = ease(progress);
        
        cameraRef.current.position.lerpVectors(startPosition, targetPosition, t);
        controlsRef.current.update();
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      };
      
      animateCamera();
    }
  }, [selectedItemId]);

  return (
    <Box 
      ref={mountRef} 
      sx={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    >
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)' 
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default Globe;
