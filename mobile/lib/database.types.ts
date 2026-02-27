/**
 * Auto-generated Supabase database types for the PhotosApp.
 * These types mirror the database schema defined in supabase/migrations/.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          first_name: string;
          last_name: string;
          bio: string;
          profile_image_url: string | null;
          default_map_view: 'globe' | 'map';
          date_created: string;
          date_modified: string;
        };
        Insert: {
          id: string;
          username: string;
          email?: string | null;
          first_name?: string;
          last_name?: string;
          bio?: string;
          profile_image_url?: string | null;
          default_map_view?: 'globe' | 'map';
          date_created?: string;
          date_modified?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string | null;
          first_name?: string;
          last_name?: string;
          bio?: string;
          profile_image_url?: string | null;
          default_map_view?: 'globe' | 'map';
          date_created?: string;
          date_modified?: string;
        };
        Relationships: [];
      };
      narratives: {
        Row: {
          id: string;
          title: string;
          description: string;
          cover_image_url: string | null;
          owner_id: string;
          start_date: string | null;
          end_date: string | null;
          location_summary: string;
          date_created: string;
          date_modified: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          cover_image_url?: string | null;
          owner_id: string;
          start_date?: string | null;
          end_date?: string | null;
          location_summary?: string;
          date_created?: string;
          date_modified?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          cover_image_url?: string | null;
          owner_id?: string;
          start_date?: string | null;
          end_date?: string | null;
          location_summary?: string;
          date_created?: string;
          date_modified?: string;
        };
        Relationships: [
          {
            foreignKeyName: "narratives_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      media_items: {
        Row: {
          id: string;
          title: string;
          file_url: string;
          media_type: 'photo' | 'video';
          thumbnail_small_url: string | null;
          thumbnail_medium_url: string | null;
          thumbnail_large_url: string | null;
          capture_date: string | null;
          latitude: number | null;
          longitude: number | null;
          camera_make: string;
          camera_model: string;
          description: string;
          narrative_id: string | null;
          owner_id: string;
          date_uploaded: string;
          date_modified: string;
        };
        Insert: {
          id?: string;
          title?: string;
          file_url: string;
          media_type?: 'photo' | 'video';
          thumbnail_small_url?: string | null;
          thumbnail_medium_url?: string | null;
          thumbnail_large_url?: string | null;
          capture_date?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          camera_make?: string;
          camera_model?: string;
          description?: string;
          narrative_id?: string | null;
          owner_id: string;
          date_uploaded?: string;
          date_modified?: string;
        };
        Update: {
          id?: string;
          title?: string;
          file_url?: string;
          media_type?: 'photo' | 'video';
          thumbnail_small_url?: string | null;
          thumbnail_medium_url?: string | null;
          thumbnail_large_url?: string | null;
          capture_date?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          camera_make?: string;
          camera_model?: string;
          description?: string;
          narrative_id?: string | null;
          owner_id?: string;
          date_uploaded?: string;
          date_modified?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_items_narrative_id_fkey";
            columns: ["narrative_id"];
            isOneToOne: false;
            referencedRelation: "narratives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_items_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notes: {
        Row: {
          id: string;
          content: string;
          media_item_id: string | null;
          narrative_id: string | null;
          day_date: string | null;
          owner_id: string;
          date_created: string;
          date_modified: string;
        };
        Insert: {
          id?: string;
          content: string;
          media_item_id?: string | null;
          narrative_id?: string | null;
          day_date?: string | null;
          owner_id: string;
          date_created?: string;
          date_modified?: string;
        };
        Update: {
          id?: string;
          content?: string;
          media_item_id?: string | null;
          narrative_id?: string | null;
          day_date?: string | null;
          owner_id?: string;
          date_created?: string;
          date_modified?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_media_item_id_fkey";
            columns: ["media_item_id"];
            isOneToOne: false;
            referencedRelation: "media_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_narrative_id_fkey";
            columns: ["narrative_id"];
            isOneToOne: false;
            referencedRelation: "narratives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      locations: {
        Row: {
          id: number;
          name: string;
          latitude: number;
          longitude: number;
          country: string;
          city: string;
          address: string;
          date_created: string;
          date_modified: string;
        };
        Insert: {
          id?: never;
          name: string;
          latitude: number;
          longitude: number;
          country?: string;
          city?: string;
          address?: string;
          date_created?: string;
          date_modified?: string;
        };
        Update: {
          id?: never;
          name?: string;
          latitude?: number;
          longitude?: number;
          country?: string;
          city?: string;
          address?: string;
          date_created?: string;
          date_modified?: string;
        };
        Relationships: [];
      };
      location_media: {
        Row: {
          location_id: number;
          media_item_id: string;
        };
        Insert: {
          location_id: number;
          media_item_id: string;
        };
        Update: {
          location_id?: number;
          media_item_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "location_media_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "location_media_media_item_id_fkey";
            columns: ["media_item_id"];
            isOneToOne: false;
            referencedRelation: "media_items";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          cover_image_url: string | null;
          owner_id: string;
          public_status: 'private' | 'unlisted' | 'public';
          date_created: string;
          date_modified: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          cover_image_url?: string | null;
          owner_id: string;
          public_status?: 'private' | 'unlisted' | 'public';
          date_created?: string;
          date_modified?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          cover_image_url?: string | null;
          owner_id?: string;
          public_status?: 'private' | 'unlisted' | 'public';
          date_created?: string;
          date_modified?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      project_narratives: {
        Row: {
          project_id: string;
          narrative_id: string;
        };
        Insert: {
          project_id: string;
          narrative_id: string;
        };
        Update: {
          project_id?: string;
          narrative_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_narratives_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_narratives_narrative_id_fkey";
            columns: ["narrative_id"];
            isOneToOne: false;
            referencedRelation: "narratives";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
