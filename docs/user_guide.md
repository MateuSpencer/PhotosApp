# Narratives App - User Guide

## Overview

Narratives is an interactive storytelling application that helps you organize and relive your photos through a 3D globe visualization and timeline navigation. This guide will help you get started with the application.

## Accessing the Application

The application is currently deployed and can be accessed at the following URLs:

- **Frontend**: [https://3001-i9c0v8ew13i9li6cfo97w-4bf02c2b.manusvm.computer](https://3001-i9c0v8ew13i9li6cfo97w-4bf02c2b.manusvm.computer)
- **Backend API**: [https://8000-i9c0v8ew13i9li6cfo97w-4bf02c2b.manusvm.computer](https://8000-i9c0v8ew13i9li6cfo97w-4bf02c2b.manusvm.computer)

## Getting Started

1. Open the frontend URL in your browser
2. Use the following credentials to log in:
   - Username: any username
   - Password: any password
   (Note: In this prototype, authentication is simulated)

## Main Features

### Navigation

- **Explore**: View your photos on a 3D globe and navigate through time
- **Projects**: Manage your narratives (collections of photos)
- **People**: Future feature for facial recognition (not implemented in prototype)

### Explore View

The Explore view is the main feature of the application, allowing you to:

- Interact with the 3D globe by dragging to rotate and scrolling to zoom
- Click on photo markers on the globe to select them
- Use the timeline at the bottom to navigate chronologically through your photos
- Play/pause the timeline for automatic slideshow
- Navigate to previous/next photos using the timeline controls

### Projects Management

The Projects view allows you to:

- View a list of your narratives
- Create new narratives
- Click on a narrative to view its details
- Organize photos by days
- Enter presentation mode for full-screen viewing

### Presentation Mode

Presentation mode provides an immersive viewing experience:

- Full-screen display with the 3D globe in the background
- Large photo display in the foreground
- Timeline controls at the bottom
- Location and date information for each photo

## Technical Notes

This prototype demonstrates the core functionality of the Narratives app:

- Interactive 3D globe visualization using Three.js
- Chronological timeline navigation
- Synchronized interaction between globe and timeline
- Project management interface
- Presentation mode

The application uses:
- Django and PostgreSQL for the backend
- React for the frontend
- Three.js for 3D visualization

## Limitations in the Prototype

- Authentication is simulated (no actual backend validation)
- Media upload is not fully implemented
- Sample data is used instead of real database content
- External service integration (Google Photos, iCloud) is not implemented

## Next Steps

Future development would include:
- Complete media upload and metadata extraction
- User authentication and account management
- Integration with external services
- Advanced features like facial recognition
- Mobile responsiveness improvements
