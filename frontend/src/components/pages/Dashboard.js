import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function Dashboard() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Welcome to Narratives
        </Typography>
        <Typography variant="body1">
          This is your dashboard where you can see an overview of your narratives and recent activity.
          Use the sidebar navigation to explore your media on the globe, manage your projects, or create new narratives.
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>
          Quick Links
        </Typography>
        <Typography variant="body1" paragraph>
          • Go to <strong>Explore</strong> to view your media on the interactive 3D globe
        </Typography>
        <Typography variant="body1" paragraph>
          • Visit <strong>Projects</strong> to manage your narratives
        </Typography>
        <Typography variant="body1" paragraph>
          • Create a new narrative to start organizing your memories
        </Typography>
      </Box>
    </Container>
  );
}

export default Dashboard;
