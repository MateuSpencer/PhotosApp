import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { narrativesAPI, projectsAPI } from '../../services/api';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Fetch projects from API
        const response = await projectsAPI.getProjects();
        const projects = response.data;
        
        // Log projects with their UUIDs to help with debugging
        console.log('Projects fetched:', projects);
        
        setProjects(projects);
      } catch (err) {
        setError('Failed to fetch projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectTitle) {
      setError('Project title is required');
      return;
    }
    
    try {
      // Create project via API with only the required fields
      const response = await projectsAPI.createProject({
        title: newProjectTitle,
        description: newProjectDescription,
        public_status: 'private'  // Adding default value
      });
      
      const newProject = response.data;
      
      // Reset form and state
      setError('');  // Clear any previous errors
      setProjects([...projects, newProject]);
      setOpenDialog(false);
      setNewProjectTitle('');
      setNewProjectDescription('');
      
      // Navigate to the new project
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      console.error('Project creation error:', err);
      
      // Provide more detailed error message if available
      if (err.response && err.response.data) {
        // Handle validation errors from DRF
        if (typeof err.response.data === 'object') {
          const errorMessages = Object.entries(err.response.data)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          setError(`Failed to create project: ${errorMessages}`);
        } else {
          setError(`Failed to create project: ${err.response.data}`);
        }
      } else {
        setError('Failed to create project. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Your Projects
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Project
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%', // 16:9 aspect ratio
                  bgcolor: 'primary.light'
                }}
                image={project.cover_image || "/static/images/cards/contemplative-reptile.jpg"}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {project.title}
                </Typography>
                <Typography>
                  {project.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {project.narratives_count} narratives
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.public_status}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(project.date_created).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Projects;
