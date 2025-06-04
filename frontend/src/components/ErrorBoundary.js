import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper 
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            bgcolor: 'grey.100',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong with the globe component
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The globe is temporarily unavailable. Please try refreshing the page.
          </Typography>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
