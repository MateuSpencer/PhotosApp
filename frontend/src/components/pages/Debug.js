import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { narrativesAPI, projectsAPI } from '../../services/api';

function Debug() {
  const [projects, setProjects] = useState([]);
  const [narratives, setNarratives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects and narratives
        const projectsResponse = await projectsAPI.getProjects();
        const narrativesResponse = await narrativesAPI.getNarratives();
        
        setProjects(projectsResponse.data);
        setNarratives(narrativesResponse.data);
        
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Debug Information</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Projects</Typography>
        {projects.length === 0 ? (
          <Typography color="text.secondary">No projects found</Typography>
        ) : (
          projects.map(project => (
            <Box key={project.id} sx={{ mb: 2 }}>
              <Typography variant="h6">{project.title}</Typography>
              <Typography variant="body2" color="text.secondary">ID: {project.id}</Typography>
              <Typography variant="body2">{project.description}</Typography>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))
        )}
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Narratives</Typography>
        {narratives.length === 0 ? (
          <Typography color="text.secondary">No narratives found</Typography>
        ) : (
          narratives.map(narrative => (
            <Box key={narrative.id} sx={{ mb: 2 }}>
              <Typography variant="h6">{narrative.title}</Typography>
              <Typography variant="body2" color="text.secondary">ID: {narrative.id}</Typography>
              <Typography variant="body2">{narrative.description}</Typography>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))
        )}
      </Paper>
    </Container>
  );
}

export default Debug;
