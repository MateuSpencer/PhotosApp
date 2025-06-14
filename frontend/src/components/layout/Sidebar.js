import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { narrativesAPI } from '../../services/api';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
  Typography,
  Toolbar,
} from '@mui/material';
import {
  ExploreOutlined as ExploreIcon,
  CollectionsBookmarkOutlined as ProjectsIcon,
  PeopleOutlined as PeopleIcon,
  SettingsOutlined as SettingsIcon,
  HelpOutlineOutlined as HelpIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

function Sidebar() {
  const [open, setOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch projects from API
    const fetchProjects = async () => {
      try {
        const response = await narrativesAPI.getNarratives();
        const narratives = response.data;
        setProjects(narratives.map(narrative => ({
          id: narrative.id,
          title: narrative.title
        })));
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };

    fetchProjects();
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProjectsToggle = () => {
    setProjectsOpen(!projectsOpen);
  };

  const handlePeopleToggle = () => {
    setPeopleOpen(!peopleOpen);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 64,
          boxSizing: 'border-box',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar>
        {open && (
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Narratives
          </Typography>
        )}
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/explore'}
            onClick={() => navigate('/explore')}
          >
            <ListItemIcon>
              <ExploreIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Explore" />}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/projects'}
            onClick={() => {
              navigate('/projects');
              handleProjectsToggle();
            }}
          >
            <ListItemIcon>
              <ProjectsIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Projects" />}
          </ListItemButton>
        </ListItem>

        {open && (
          <Collapse in={projectsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {projects.map(project => (
                <ListItem key={project.id} disablePadding>
                  <ListItemButton
                    selected={location.pathname === `/projects/${project.id}`}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    sx={{ pl: 4 }}
                  >
                    <ListItemText primary={project.title} />
                  </ListItemButton>
                </ListItem>
              ))}
              <ListItem disablePadding>
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="New Project" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
        )}

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              navigate('/people');
              handlePeopleToggle();
            }}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            {open && <ListItemText primary="People" />}
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Settings" />}
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Help" />}
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar;
