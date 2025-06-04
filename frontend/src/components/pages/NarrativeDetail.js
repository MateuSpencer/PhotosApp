import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Divider,
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
    // In a real app, this would fetch from the API
    const fetchNarrativeDetails = async () => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockNarrative = {
          id: parseInt(id),
          title: id === '1' ? 'Norway 2023' : id === '2' ? 'Japan Trip' : 'Family Reunion',
          description: id === '1' 
            ? 'A journey through the fjords and mountains of Norway.' 
            : id === '2' 
              ? 'Exploring the temples and gardens of Kyoto and Tokyo.'
              : 'Annual family gathering at Lake Michigan.',
          start_date: id === '1' ? '2023-05-15' : id === '2' ? '2022-11-03' : '2023-07-04',
          end_date: id === '1' ? '2023-05-21' : id === '2' ? '2022-11-15' : '2023-07-08',
          location_summary: id === '1' 
            ? 'Bergen, Oslo, Tromsø' 
            : id === '2' 
              ? 'Tokyo, Kyoto, Osaka'
              : 'Chicago, Lake Michigan',
          media_count: id === '1' ? 56 : id === '2' ? 124 : 87
        };
        
        // Generate mock days
        const mockDays = [];
        if (mockNarrative.start_date && mockNarrative.end_date) {
          const start = new Date(mockNarrative.start_date);
          const end = new Date(mockNarrative.end_date);
          const locations = mockNarrative.location_summary.split(', ');
          
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayIndex = Math.floor((d - start) / (1000 * 60 * 60 * 24));
            const location = locations[dayIndex % locations.length];
            const photoCount = Math.floor(Math.random() * 20) + 5;
            const videoCount = Math.floor(Math.random() * 3);
            
            mockDays.push({
              date: new Date(d).toISOString().split('T')[0],
              location,
              photo_count: photoCount,
              video_count: videoCount
            });
          }
        }
        
        // Generate mock media
        const mockMedia = [];
        for (let i = 1; i <= 20; i++) {
          mockMedia.push({
            id: i,
            title: `Media ${i}`,
            media_type: i % 5 === 0 ? 'video' : 'photo',
            capture_date: mockNarrative.start_date
          });
        }
        
        setNarrative(mockNarrative);
        setDays(mockDays);
        setMedia(mockMedia);
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
