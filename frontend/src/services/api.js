import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '', // Empty baseURL since we're using proxy in development
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Narratives API calls
export const narrativesAPI = {
  getNarratives: () => {
    return api.get('/api/narratives/');
  },
  
  getNarrative: (id) => {
    return api.get(`/api/narratives/${id}/`);
  },
  
  createNarrative: (data) => {
    return api.post('/api/narratives/', data);
  },
  
  updateNarrative: (id, data) => {
    return api.put(`/api/narratives/${id}/`, data);
  },
  
  deleteNarrative: (id) => {
    return api.delete(`/api/narratives/${id}/`);
  },
  
  getNarrativeDays: (id) => {
    return api.get(`/api/narratives/${id}/days/`);
  },
};

// Projects API calls
export const projectsAPI = {
  getProjects: () => {
    return api.get('/api/projects/');
  },
  
  getProject: (id) => {
    return api.get(`/api/projects/${id}/`);
  },
  
  createProject: (data) => {
    return api.post('/api/projects/', data);
  },
  
  updateProject: (id, data) => {
    return api.put(`/api/projects/${id}/`, data);
  },
  
  deleteProject: (id) => {
    return api.delete(`/api/projects/${id}/`);
  },
  
  addNarrative: (projectId, narrativeId) => {
    return api.post(`/api/projects/${projectId}/add_narrative/`, { narrative_id: narrativeId });
  },
  
  removeNarrative: (projectId, narrativeId) => {
    return api.post(`/api/projects/${projectId}/remove_narrative/`, { narrative_id: narrativeId });
  },
  
  getNarratives: (projectId) => {
    return api.get(`/api/projects/${projectId}/narratives/`);
  },
};

// Media API calls
export const mediaAPI = {
  getAllMediaItems: () => {
    return api.get('/api/media/');
  },
  
  getMediaItems: (narrativeId) => {
    return api.get(`/api/media/?narrative=${narrativeId}`);
  },
  
  uploadMedia: (formData) => {
    return api.post('/api/media/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteMedia: (id) => {
    return api.delete(`/api/media/${id}/`);
  },
};

export default api;
