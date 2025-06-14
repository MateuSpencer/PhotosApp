// Basic React component structure for the Narratives app
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout components
import Layout from './components/layout/Layout';

// Page components
import Dashboard from './components/pages/Dashboard';
import Explore from './components/pages/Explore';
import Projects from './components/pages/Projects';
import ProjectDetail from './components/pages/ProjectDetail';
import NarrativeDetail from './components/pages/NarrativeDetail';
import Presentation from './components/pages/Presentation';
import Debug from './components/pages/Debug';

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
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/explore" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="explore" element={<Explore />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="narratives/:id" element={<NarrativeDetail />} />
            <Route path="presentation/:id" element={<Presentation />} />
            <Route path="debug" element={<Debug />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
