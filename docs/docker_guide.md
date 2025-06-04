# Running Narratives App with Docker

This guide explains how to run the Narratives app locally using Docker and Docker Compose.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

1. Clone the repository or download the source code to your local machine.

2. Navigate to the project root directory (where the `docker-compose.yml` file is located).

3. Build and start the containers:

```bash
docker-compose up --build
```

This command will:
- Build the Docker images for the backend and frontend
- Start the PostgreSQL database
- Start the Django backend server
- Start the React frontend server

4. Wait for all services to start. You should see logs from all three services in your terminal.

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api

## Services

The Docker setup includes three services:

1. **PostgreSQL Database (db)**
   - Port: 5432
   - Database name: narratives_db
   - Username: narratives_user
   - Password: narratives_password

2. **Django Backend (backend)**
   - Port: 8000
   - API endpoints available at http://localhost:8000/api

3. **React Frontend (frontend)**
   - Port: 3000
   - Web interface available at http://localhost:3000

## Development Workflow

### Viewing Logs

To view logs from all services:

```bash
docker-compose logs -f
```

To view logs from a specific service:

```bash
docker-compose logs -f [service_name]
```

Replace `[service_name]` with `db`, `backend`, or `frontend`.

### Stopping the Application

To stop all services:

```bash
docker-compose down
```

To stop all services and remove volumes (this will delete the database data):

```bash
docker-compose down -v
```

### Restarting Services

To restart a specific service:

```bash
docker-compose restart [service_name]
```

## Troubleshooting

### Database Connection Issues

If the backend cannot connect to the database, try:

```bash
docker-compose down
docker-compose up --build
```

### Frontend Not Connecting to Backend

Make sure the backend is running and accessible. You can check by visiting http://localhost:8000/api in your browser.

### Port Conflicts

If you have port conflicts (services already running on ports 3000, 8000, or 5432), you can modify the port mappings in the `docker-compose.yml` file.

## Production Deployment

This Docker setup is intended for local development. For production deployment:

1. Use proper secret management (don't hardcode secrets in docker-compose.yml)
2. Configure proper database backups
3. Set up HTTPS with a reverse proxy like Nginx
4. Consider using Docker Swarm or Kubernetes for orchestration
