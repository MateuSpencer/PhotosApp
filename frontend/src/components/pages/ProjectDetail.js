import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, narrativesAPI } from '../../services/api';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Add as AddIcon
} from '@mui/icons-material';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [narratives, setNarratives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [newNarrativeTitle, setNewNarrativeTitle] = useState('');
  const [newNarrativeDescription, setNewNarrativeDescription] = useState('');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error('No project ID provided');
        }
        
        // Log the ID we're trying to fetch
        console.log('Fetching project with ID:', id);
        
        // Fetch project details from API
        const projectResponse = await projectsAPI.getProject(id);
        const project = projectResponse.data;
        
        // Fetch the project's narratives
        const narrativesResponse = await projectsAPI.getNarratives(id);
        const narratives = narrativesResponse.data;
        
        setProject(project);
        setNarratives(narratives);
      } catch (err) {
        setError('Failed to fetch project details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateNarrative = async () => {
    if (!newNarrativeTitle) {
      setError('Narrative title is required');
      return;
    }
    
    try {
      const response = await narrativesAPI.createNarrative({
        title: newNarrativeTitle,
        description: newNarrativeDescription
      });
      
      const newNarrative = response.data;
      
      // Add the new narrative to the project
      await projectsAPI.addNarrative(project.id, newNarrative.id);
      
      // Update the narratives list
      setNarratives([...narratives, newNarrative]);
      
      // Reset form
      setOpenDialog(false);
      setNewNarrativeTitle('');
      setNewNarrativeDescription('');
      
    } catch (err) {
      console.error('Failed to create narrative:', err);
      if (err.response && err.response.data) {
        const errorMessages = typeof err.response.data === 'object' 
          ? Object.entries(err.response.data)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('; ')
          : err.response.data;
        setError(`Failed to create narrative: ${errorMessages}`);
      } else {
        setError('Failed to create narrative. Please try again.');
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

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, backgroundColor: '#fff3f3' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/projects')} 
            sx={{ mt: 2 }}
          >
            Back to Projects
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography>Project not found</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/projects')} 
            sx={{ mt: 2 }}
          >
            Back to Projects
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {project.title}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<SettingsIcon />}
          onClick={() => navigate(`/projects/${id}/settings`)}
        >
          Project Settings
        </Button>
      </Box>
      
      {project.description && (
        <Typography variant="body1" sx={{ mb: 3 }}>
          {project.description}
        </Typography>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Narratives" />
          <Tab label="Timeline" />
          <Tab label="Map" />
        </Tabs>
      </Box>
      
      {tabValue === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Narratives</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add Narrative
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {narratives.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    No narratives in this project yet. Add your first narrative to get started.
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              narratives.map(narrative => (
                <Grid item xs={12} sm={6} md={4} key={narrative.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/narratives/${narrative.id}`)}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        pt: '56.25%', // 16:9 aspect ratio
                        bgcolor: 'primary.light'
                      }}
                      image={narrative.cover_image || "/static/images/cards/contemplative-reptile.jpg"}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {narrative.title}
                      </Typography>
                      <Typography>
                        {narrative.description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {narrative.media_count} media items
                        </Typography>
                        {narrative.location_summary && (
                          <Typography variant="body2" color="text.secondary">
                            {narrative.location_summary}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Created: {new Date(narrative.date_created).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </>
      )}
      
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Timeline</Typography>
          <Typography>Project timeline feature coming soon.</Typography>
        </Paper>
      )}
      
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Map</Typography>
          <Typography>Project map feature coming soon.</Typography>
        </Paper>
      )}
      
      {/* Create Narrative Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Narrative</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newNarrativeTitle}
            onChange={(e) => setNewNarrativeTitle(e.target.value)}
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
            value={newNarrativeDescription}
            onChange={(e) => setNewNarrativeDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateNarrative} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProjectDetail;
