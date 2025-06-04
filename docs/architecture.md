# Narratives App Architecture

## Overview

Narratives is a web application that helps users organize and relive their photos through interactive storytelling. The application uses a Django/PostgreSQL backend and a React frontend. The core features include a 3D globe visualization, timeline navigation, image uploads with metadata extraction, and user authentication.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │◄────┤  Django API     │◄────┤  PostgreSQL     │
│                 │     │                 │     │  Database       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲                       ▲
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  3D Globe       │     │  Media Storage  │     │  External APIs  │
│  Visualization  │     │  (File System/  │     │  (Google Photos,│
│                 │     │   Cloud Storage)│     │   iCloud, etc.) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Backend Architecture (Django)

### Django Apps Structure

1. **users**: Handles user authentication, registration, and profile management
2. **narratives**: Manages narrative projects and their metadata
3. **media**: Handles media uploads, storage, and metadata extraction
4. **locations**: Manages geolocation data and mapping functionality
5. **api**: Provides RESTful API endpoints for frontend communication

### Data Models

#### User Model (extends Django's built-in User)
- Profile information
- Preferences
- Authentication tokens for external services

#### Narrative Model
- Title
- Description
- Created date
- Modified date
- Owner (Foreign Key to User)
- Cover image

#### Media Model
- File path/URL
- Media type (photo/video)
- Upload date
- Capture date (from EXIF)
- Latitude (from EXIF)
- Longitude (from EXIF)
- Narrative (Foreign Key to Narrative)
- Owner (Foreign Key to User)
- Notes/Caption
- Missing metadata flag

#### Note Model
- Content
- Created date
- Modified date
- Associated media (Foreign Key to Media, optional)
- Associated day (Date, optional)
- Associated narrative (Foreign Key to Narrative)

### API Endpoints

#### Authentication
- `/api/auth/register/` - User registration
- `/api/auth/login/` - User login
- `/api/auth/logout/` - User logout
- `/api/auth/profile/` - User profile management

#### Narratives
- `/api/narratives/` - List and create narratives
- `/api/narratives/<id>/` - Retrieve, update, delete narrative
- `/api/narratives/<id>/media/` - List media in narrative
- `/api/narratives/<id>/notes/` - List notes in narrative

#### Media
- `/api/media/` - List and upload media
- `/api/media/<id>/` - Retrieve, update, delete media
- `/api/media/<id>/metadata/` - Update media metadata
- `/api/media/batch-upload/` - Upload multiple media files

#### External Services
- `/api/services/google-photos/auth/` - Authenticate with Google Photos
- `/api/services/icloud/auth/` - Authenticate with iCloud
- `/api/services/onedrive/auth/` - Authenticate with OneDrive
- `/api/services/<service>/import/` - Import media from external service

## Frontend Architecture (React)

### Component Structure

#### Core Components
- `App` - Main application component
- `AuthProvider` - Authentication context provider
- `Router` - Application routing
- `Layout` - Main layout with sidebar and content area

#### Page Components
- `LoginPage` - User login
- `RegisterPage` - User registration
- `DashboardPage` - User dashboard
- `ExplorePage` - Globe and timeline view
- `ProjectsPage` - List of user's narratives
- `NarrativeDetailPage` - Single narrative view
- `PresentationPage` - Full-screen presentation mode

#### Feature Components
- `Globe` - 3D globe visualization
- `Timeline` - Interactive timeline
- `MediaUploader` - Media upload interface
- `MediaGrid` - Grid view of media
- `Sidebar` - Navigation sidebar
- `NoteEditor` - Interface for adding/editing notes
- `MetadataEditor` - Interface for editing media metadata

### State Management
- React Context API for global state
- Redux for complex state management (optional)
- React Query for API data fetching and caching

### Data Flow

1. User authenticates through the login page
2. Application fetches user's narratives and displays them
3. User selects or creates a narrative
4. Application loads narrative data, including media and notes
5. User interacts with the globe and timeline to explore media
6. User can upload new media, which is processed by the backend
7. User can add notes to media, days, or the entire narrative
8. User can enter presentation mode to view the narrative as a slideshow

## Integration Points

### 3D Globe Visualization
- Using Three.js for 3D rendering
- Globe component receives media data with coordinates
- Media thumbnails are displayed at their respective locations
- Globe animates between locations during timeline navigation

### Timeline Component
- Custom React component for timeline visualization
- Displays media chronologically
- Allows scrubbing through time
- Syncs with globe view

### Media Upload and Processing
- Frontend uploads media files to Django backend
- Backend extracts EXIF metadata (timestamp, GPS coordinates)
- Backend stores media files and metadata
- Frontend displays media in globe and timeline views

### External Service Integration
- OAuth authentication with external services
- API calls to fetch media from external services
- Processing and importing external media into the application

## Security Considerations

1. User authentication using Django's built-in authentication system
2. JWT tokens for API authentication
3. CSRF protection for form submissions
4. Secure storage of external service credentials
5. Media access control based on ownership
6. Input validation and sanitization

## Scalability Considerations

1. Media storage optimization
   - Thumbnail generation
   - Progressive loading
   - Potential CDN integration for media delivery

2. Database optimization
   - Indexing for frequently queried fields
   - Pagination for large datasets
   - Caching for frequently accessed data

3. API performance
   - Endpoint optimization
   - Rate limiting
   - Batch operations for multiple media files

## Future Extensibility

1. Support for additional external services
2. Advanced media processing (facial recognition, object detection)
3. Social features (sharing, collaboration)
4. Mobile app integration
5. Offline support
