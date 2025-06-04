import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '', // Empty baseURL since we're using proxy in development
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: (username, password) => {
    return api.post('/api/auth/login/', { username, password });
  },
  
  register: (username, email, password1, password2) => {
    return api.post('/api/auth/registration/', { 
      username, 
      email, 
      password1, 
      password2 
    });
  },
  
  logout: () => {
    return api.post('/api/auth/logout/');
  },
  
  getCurrentUser: () => {
    return api.get('/api/auth/user/');
  },
};

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
};

// Media API calls
export const mediaAPI = {
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
