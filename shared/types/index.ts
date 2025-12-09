/**
 * Shared TypeScript types for the Narratives app.
 * Used by both web and mobile frontends.
 */

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
}

export interface Profile {
  id: number;
  user: User;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  profile_image: string | null;
  default_map_view: 'globe' | 'map';
  date_created: string;
  date_modified: string;
}

// Auth types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

// Narrative types
export interface Narrative {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  start_date: string | null;
  end_date: string | null;
  location_summary: string;
  media_count: number;
  owner: number;
  owner_username: string;
  date_created: string;
  date_modified: string;
}

export interface CreateNarrativeRequest {
  title: string;
  description?: string;
  cover_image?: File | null;
}

// Media types
export interface MediaItem {
  id: string;
  title: string;
  file: string;
  media_type: 'photo' | 'video';
  thumbnail_small: string | null;
  thumbnail_medium: string | null;
  thumbnail_large: string | null;
  capture_date: string | null;
  latitude: number | null;
  longitude: number | null;
  camera_make: string;
  camera_model: string;
  description: string;
  narrative: string | null;
  owner: number;
  owner_username: string;
  date_uploaded: string;
  date_modified: string;
}

export interface MediaDay {
  date: string;
  media_items: MediaItem[];
  count: number;
}

export interface BatchUploadResult {
  success: Array<{
    id: string;
    title: string;
    filename: string;
  }>;
  failed: Array<{
    filename: string;
    errors: string | Record<string, string[]>;
  }>;
  total: number;
}

// Note types
export interface Note {
  id: string;
  content: string;
  media_item: string | null;
  narrative: string | null;
  day_date: string | null;
  owner: number;
  owner_username: string;
  date_created: string;
  date_modified: string;
}

// Project types
export interface Project {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  narratives: string[];
  narratives_count: number;
  narratives_detail: Array<{
    id: string;
    title: string;
  }>;
  public_status: 'private' | 'unlisted' | 'public';
  owner: number;
  owner_username: string;
  date_created: string;
  date_modified: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  cover_image?: File | null;
  public_status?: 'private' | 'unlisted' | 'public';
}

// Location types
export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  address: string;
  date_created: string;
  date_modified: string;
}

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}
