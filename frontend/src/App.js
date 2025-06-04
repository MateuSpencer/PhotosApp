// Basic React component structure for the Narratives app
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PrivateRoute from './components/auth/PrivateRoute';

// Layout components
import Layout from './components/layout/Layout';

// Page components
import Dashboard from './components/pages/Dashboard';
import Explore from './components/pages/Explore';
import Projects from './components/pages/Projects';
import NarrativeDetail from './components/pages/NarrativeDetail';
import Presentation from './components/pages/Presentation';

// Context providers
import { AuthProvider } from './contexts/AuthContext';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/explore" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="explore" element={<Explore />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<NarrativeDetail />} />
              <Route path="presentation/:id" element={<Presentation />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
