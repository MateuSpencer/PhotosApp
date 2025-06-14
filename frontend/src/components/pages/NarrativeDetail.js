import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { narrativesAPI, mediaAPI } from '../../services/api';
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
  Paper
} from '@mui/material';
import {
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';

function NarrativeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [narrative, setNarrative] = useState(null);
  const [days, setDays] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchNarrativeDetails = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error('No narrative ID provided');
        }
        
        // Log the ID we're trying to fetch
        console.log('Fetching narrative with ID:', id);
        
        // Fetch narrative details from API
        const narrativeResponse = await narrativesAPI.getNarrative(id);
        const narrative = narrativeResponse.data;
        
        // Fetch days for this narrative
        const daysResponse = await narrativesAPI.getNarrativeDays(id);
        const days = daysResponse.data;
        
        // Fetch media for this narrative
        const mediaResponse = await mediaAPI.getMediaItems(id);
        const media = mediaResponse.data;
        
        setNarrative(narrative);
        setDays(days);
        setMedia(media);
      } catch (err) {
        setError('Failed to fetch narrative details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNarrativeDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePresentationMode = () => {
    navigate(`/presentation/${id}`);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!narrative) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">
          {error || 'Narrative not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          {narrative.title}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<SettingsIcon />}
            sx={{ mr: 1 }}
          >
            Settings
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PlayIcon />}
            sx={{ mr: 1 }}
            onClick={handlePresentationMode}
          >
            Present
          </Button>
          <Button 
            variant="contained" 
            startIcon={<UploadIcon />}
          >
            Upload
          </Button>
        </Box>
      </Box>
      
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        {narrative.start_date && narrative.end_date 
          ? `${new Date(narrative.start_date).toLocaleDateString()} - ${new Date(narrative.end_date).toLocaleDateString()}`
          : 'No dates set'} | {narrative.location_summary || 'No locations'}
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Days" />
            <Tab label="Media" />
            <Tab label="Map" />
          </Tabs>
        </Box>
        
        {/* Days Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 2, overflowX: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 2, pb: 1 }}>
              {days.map((day) => (
                <Card key={day.date} sx={{ minWidth: 200, maxWidth: 200 }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 100,
                      bgcolor: 'primary.light'
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6">
                      {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Typography>
                    <Typography variant="body2">
                      {day.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {day.photo_count} photos, {day.video_count} videos
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
        
        {/* Media Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {media.map((item) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
                  <Card>
                    <CardMedia
                      component="div"
                      sx={{
                        pt: '100%',
                        bgcolor: item.media_type === 'video' ? 'secondary.light' : 'primary.light',
                        position: 'relative'
                      }}
                    >
                      {item.media_type === 'video' && (
                        <PlayIcon 
                          sx={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontSize: 40
                          }} 
                        />
                      )}
                    </CardMedia>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Map Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>
              Map view will be integrated in the next phase
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default NarrativeDetail;
