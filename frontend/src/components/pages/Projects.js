import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { narrativesAPI } from '../../services/api';
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
  const [narratives, setNarratives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newNarrativeTitle, setNewNarrativeTitle] = useState('');
  const [newNarrativeDescription, setNewNarrativeDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNarratives = async () => {
      try {
        setLoading(true);
        
        // Fetch narratives from API
        const response = await narrativesAPI.getNarratives();
        const narratives = response.data;
        
        setNarratives(narratives);
      } catch (err) {
        setError('Failed to fetch narratives');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNarratives();
  }, []);

  const handleCreateNarrative = async () => {
    if (!newNarrativeTitle) return;
    
    try {
      // Create narrative via API
      const response = await narrativesAPI.createNarrative({
        title: newNarrativeTitle,
        description: newNarrativeDescription
      });
      
      const newNarrative = response.data;
      
      setNarratives([...narratives, newNarrative]);
      setOpenDialog(false);
      setNewNarrativeTitle('');
      setNewNarrativeDescription('');
      
      // Navigate to the new narrative
      navigate(`/projects/${newNarrative.id}`);
    } catch (err) {
      setError('Failed to create narrative');
      console.error(err);
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
          Your Narratives
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Narrative
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Grid container spacing={3}>
        {narratives.map((narrative) => (
          <Grid item xs={12} sm={6} md={4} key={narrative.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/projects/${narrative.id}`)}
            >
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%', // 16:9 aspect ratio
                  bgcolor: 'primary.light'
                }}
                image="/static/images/cards/contemplative-reptile.jpg"
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
                    {narrative.start_date && narrative.end_date 
                      ? `${new Date(narrative.start_date).toLocaleDateString()} - ${new Date(narrative.end_date).toLocaleDateString()}`
                      : 'No dates set'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {narrative.location_summary || 'No locations'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {narrative.media_count} media items
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Create Narrative Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Narrative</DialogTitle>
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

export default Projects;
