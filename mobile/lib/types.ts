/**
 * Convenience type aliases derived from the Supabase database types.
 * Import these instead of reaching into Database['public']['Tables'] everywhere.
 */
import type { Database } from './database.types';

// Row types (what you get back from a SELECT)
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Narrative = Database['public']['Tables']['narratives']['Row'];
export type MediaItem = Database['public']['Tables']['media_items']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type Location = Database['public']['Tables']['locations']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectNarrative = Database['public']['Tables']['project_narratives']['Row'];
export type LocationMedia = Database['public']['Tables']['location_media']['Row'];

// Insert types (what you pass to an INSERT)
export type NarrativeInsert = Database['public']['Tables']['narratives']['Insert'];
export type MediaItemInsert = Database['public']['Tables']['media_items']['Insert'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];

// Update types (what you pass to an UPDATE)
export type NarrativeUpdate = Database['public']['Tables']['narratives']['Update'];
export type MediaItemUpdate = Database['public']['Tables']['media_items']['Update'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

// Joined / enriched types for UI use
export type NarrativeWithCounts = Narrative & {
  media_count?: number;
};

export type ProjectWithCounts = Project & {
  narratives_count?: number;
};

export type MediaDay = {
  date: string;
  media_items: MediaItem[];
  count: number;
};
