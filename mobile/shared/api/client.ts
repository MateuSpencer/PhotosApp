/**
 * Shared API client for the Narratives app.
 * Works with both React (web) and React Native (mobile).
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  User,
  Profile,
  AuthTokens,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Narrative,
  CreateNarrativeRequest,
  MediaItem,
  MediaDay,
  BatchUploadResult,
  Note,
  Project,
  CreateProjectRequest,
  Location,
} from '../types';

// Token storage interface - implemented differently for web vs mobile
export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(tokens: AuthTokens): Promise<void>;
  clearTokens(): Promise<void>;
}

// Default configuration
const DEFAULT_CONFIG = {
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
};

class ApiClient {
  private client: AxiosInstance;
  private tokenStorage: TokenStorage | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(config?: AxiosRequestConfig) {
    this.client = axios.create({
      ...DEFAULT_CONFIG,
      ...config,
    });

    this.setupInterceptors();
  }

  /**
   * Set the token storage implementation (different for web vs mobile)
   */
  setTokenStorage(storage: TokenStorage) {
    this.tokenStorage = storage;
  }

  /**
   * Update the base URL (useful for different environments)
   */
  setBaseURL(url: string) {
    this.client.defaults.baseURL = url;
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (this.tokenStorage) {
          const token = await this.tokenStorage.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.refreshSubscribers.forEach((callback) => callback(newToken));
            this.refreshSubscribers = [];
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.refreshSubscribers = [];
            if (this.tokenStorage) {
              await this.tokenStorage.clearTokens();
            }
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.tokenStorage) {
      throw new Error('Token storage not configured');
    }

    const refreshToken = await this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<AuthTokens>(
      `${this.client.defaults.baseURL}/auth/token/refresh/`,
      { refresh: refreshToken }
    );

    await this.tokenStorage.setTokens(response.data);
    return response.data.access;
  }

  // ==================== Auth Endpoints ====================

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login/', {
      username,
      password,
    });
    if (this.tokenStorage) {
      await this.tokenStorage.setTokens({
        access: response.data.access,
        refresh: response.data.refresh,
      });
    }
    return response.data;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.client.post<RegisterResponse>('/auth/register/', data);
    if (this.tokenStorage && response.data.tokens) {
      await this.tokenStorage.setTokens(response.data.tokens);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      if (this.tokenStorage) {
        const refreshToken = await this.tokenStorage.getRefreshToken();
        if (refreshToken) {
          await this.client.post('/auth/logout/', { refresh: refreshToken });
        }
      }
    } finally {
      if (this.tokenStorage) {
        await this.tokenStorage.clearTokens();
      }
    }
  }

  async getProfile(): Promise<Profile> {
    const response = await this.client.get<Profile>('/auth/profile/');
    return response.data;
  }

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const response = await this.client.patch<Profile>('/auth/profile/', data);
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string, newPasswordConfirm: string): Promise<void> {
    await this.client.put('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
  }

  // ==================== Narrative Endpoints ====================

  async getNarratives(): Promise<Narrative[]> {
    const response = await this.client.get<Narrative[]>('/narratives/');
    return response.data;
  }

  async getNarrative(id: string): Promise<Narrative> {
    const response = await this.client.get<Narrative>(`/narratives/${id}/`);
    return response.data;
  }

  async createNarrative(data: CreateNarrativeRequest): Promise<Narrative> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.cover_image) formData.append('cover_image', data.cover_image);

    const response = await this.client.post<Narrative>('/narratives/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateNarrative(id: string, data: Partial<CreateNarrativeRequest>): Promise<Narrative> {
    const response = await this.client.patch<Narrative>(`/narratives/${id}/`, data);
    return response.data;
  }

  async deleteNarrative(id: string): Promise<void> {
    await this.client.delete(`/narratives/${id}/`);
  }

  async getNarrativeMedia(id: string): Promise<MediaItem[]> {
    const response = await this.client.get<MediaItem[]>(`/narratives/${id}/media/`);
    return response.data;
  }

  async getNarrativeNotes(id: string): Promise<Note[]> {
    const response = await this.client.get<Note[]>(`/narratives/${id}/notes/`);
    return response.data;
  }

  async getNarrativeDays(id: string): Promise<MediaDay[]> {
    const response = await this.client.get<MediaDay[]>(`/narratives/${id}/days/`);
    return response.data;
  }

  // ==================== Media Endpoints ====================

  async getMediaItems(narrativeId?: string): Promise<MediaItem[]> {
    const params = narrativeId ? { narrative: narrativeId } : {};
    const response = await this.client.get<MediaItem[]>('/media/', { params });
    return response.data;
  }

  async getMediaItem(id: string): Promise<MediaItem> {
    const response = await this.client.get<MediaItem>(`/media/${id}/`);
    return response.data;
  }

  async uploadMedia(file: File | Blob, narrativeId?: string, title?: string): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (narrativeId) formData.append('narrative', narrativeId);
    if (title) formData.append('title', title);

    const response = await this.client.post<MediaItem>('/media/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async batchUploadMedia(files: File[] | Blob[], narrativeId?: string): Promise<BatchUploadResult> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (narrativeId) formData.append('narrative', narrativeId);

    const response = await this.client.post<BatchUploadResult>('/media/batch-upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateMediaMetadata(id: string, data: Partial<MediaItem>): Promise<MediaItem> {
    const response = await this.client.patch<MediaItem>(`/media/${id}/metadata/`, data);
    return response.data;
  }

  async deleteMedia(id: string): Promise<void> {
    await this.client.delete(`/media/${id}/`);
  }

  // ==================== Note Endpoints ====================

  async getNotes(narrativeId?: string, mediaItemId?: string): Promise<Note[]> {
    const params: Record<string, string> = {};
    if (narrativeId) params.narrative = narrativeId;
    if (mediaItemId) params.media_item = mediaItemId;

    const response = await this.client.get<Note[]>('/notes/', { params });
    return response.data;
  }

  async createNote(data: Partial<Note>): Promise<Note> {
    const response = await this.client.post<Note>('/notes/', data);
    return response.data;
  }

  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    const response = await this.client.patch<Note>(`/notes/${id}/`, data);
    return response.data;
  }

  async deleteNote(id: string): Promise<void> {
    await this.client.delete(`/notes/${id}/`);
  }

  // ==================== Project Endpoints ====================

  async getProjects(): Promise<Project[]> {
    const response = await this.client.get<Project[]>('/projects/');
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.client.get<Project>(`/projects/${id}/`);
    return response.data;
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.cover_image) formData.append('cover_image', data.cover_image);
    if (data.public_status) formData.append('public_status', data.public_status);

    const response = await this.client.post<Project>('/projects/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateProject(id: string, data: Partial<CreateProjectRequest>): Promise<Project> {
    const response = await this.client.patch<Project>(`/projects/${id}/`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await this.client.delete(`/projects/${id}/`);
  }

  async getProjectNarratives(id: string): Promise<Narrative[]> {
    const response = await this.client.get<Narrative[]>(`/projects/${id}/narratives/`);
    return response.data;
  }

  async addNarrativeToProject(projectId: string, narrativeId: string): Promise<void> {
    await this.client.post(`/projects/${projectId}/add_narrative/`, {
      narrative_id: narrativeId,
    });
  }

  async removeNarrativeFromProject(projectId: string, narrativeId: string): Promise<void> {
    await this.client.post(`/projects/${projectId}/remove_narrative/`, {
      narrative_id: narrativeId,
    });
  }

  // ==================== Location Endpoints ====================

  async getLocations(): Promise<Location[]> {
    const response = await this.client.get<Location[]>('/locations/');
    return response.data;
  }

  async getLocation(id: number): Promise<Location> {
    const response = await this.client.get<Location>(`/locations/${id}/`);
    return response.data;
  }

  async createLocation(data: Partial<Location>): Promise<Location> {
    const response = await this.client.post<Location>('/locations/', data);
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient();
export default ApiClient;
