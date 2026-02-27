# PhotosApp — User Guide

> Last updated: February 2026

## What is PhotosApp?

PhotosApp (originally "Narratives") is a photo storytelling app that lets you organize your photos into narratives, map your journeys on a globe, and group narratives into projects.

## Getting Started (Web)

1. Go to the deployed URL (or http://localhost:3000 for local dev)
2. Click **Create Account** and register with your email
3. You'll be taken to your **Dashboard**

## Features

### Dashboard
- View all your narratives and projects at a glance
- See cover images, descriptions, and media counts
- *(Coming soon: create/edit narratives and projects from the dashboard)*

### Narratives
A narrative is a collection of photos organized chronologically — think of it as a trip, a day, or any photo story.
- Each narrative has a title, description, date range, and cover image
- Photos are organized by day within a narrative
- You can add text notes to any day or photo

### Projects
A project groups multiple narratives together — for example, "2025 Travel" might contain narratives for each trip.
- Projects have a title, description, and public/private status
- A project can contain any number of narratives

### Media
- Photos carry EXIF metadata: capture date, GPS coordinates, camera info
- Thumbnails are generated automatically
- *(Coming soon: upload photos via the web interface)*

### Map View (Mobile)
- View your photos plotted on a map by GPS coordinates
- Tap markers to see photo details
- *(Web map view coming soon)*

## Mobile App

The mobile app is available via Expo and provides:
- Dashboard with narratives and projects
- Photo upload from camera roll
- Map view with photo markers
- Timeline view for narrative photos
- Settings for preferences

### Running the Mobile App
See [docs/mobile_dev_guide.md](mobile_dev_guide.md) for setup instructions.

## Current Limitations

- Web dashboard is read-only (no create/edit/upload yet)
- No password reset flow
- No social/OAuth login
- Mobile app requires the legacy Django backend (Supabase migration planned)
- Map view on web is a placeholder
