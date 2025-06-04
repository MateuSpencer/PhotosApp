# Running Narratives App Locally

This guide explains how to run the Narratives app with the backend in Docker and the frontend running locally.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Setup Instructions

### 1. Start the Backend (Django) in Docker

1. Navigate to the project root directory (where the `docker-compose.yml` file is located).

2. Start the backend services (PostgreSQL and Django):

```bash
docker-compose up -d
```

This command will:
- Start the PostgreSQL database
- Start the Django backend server
- The backend API will be available at http://localhost:8000/api/

### 2. Run the Frontend (React) Locally

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Authentication

The application uses Django Allauth for authentication. The following endpoints are available:

- Register: http://localhost:8000/api/auth/registration/
- Login: http://localhost:8000/api/auth/login/
- Logout: http://localhost:8000/api/auth/logout/
- User details: http://localhost:8000/api/auth/user/

## Development Workflow

- The frontend proxy is configured to forward API requests to the backend
- Make changes to the frontend code and they will be automatically reflected
- Backend changes require restarting the Docker container:
  ```bash
  docker-compose restart backend
  ```

## Troubleshooting

### Backend Issues

If you encounter issues with the backend:

1. Check the Docker logs:
```bash
docker-compose logs backend
```

2. Ensure the database migrations have run:
```bash
docker-compose exec backend python manage.py migrate
```

### Frontend Issues

If you encounter issues with the frontend:

1. Check that the proxy is correctly set up in `package.json`
2. Ensure the backend is running and accessible at http://localhost:8000
3. Clear your browser cache and local storage

## Stopping the Application

To stop all services:

```bash
docker-compose down
```

To stop only the backend while continuing frontend development:

```bash
docker-compose stop
```
