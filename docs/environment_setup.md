# Development Environment Setup

## Backend Setup (Django/PostgreSQL)

1. Created Python virtual environment:
```bash
python3 -m venv backend/venv
```

2. Installed backend dependencies:
```bash
pip install django djangorestframework django-cors-headers psycopg2-binary pillow exifread
```

3. Created Django project and apps:
```bash
django-admin startproject narratives_project .
python manage.py startapp users
python manage.py startapp narratives
python manage.py startapp media
python manage.py startapp locations
python manage.py startapp api
```

## Frontend Setup (React)

1. Created React application:
```bash
npx create-react-app frontend
```

2. Installed frontend dependencies:
```bash
npm install axios three react-router-dom @mui/material @mui/icons-material @emotion/react @emotion/styled
```

## Running the Application

### Backend
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm start
```

## Next Steps
- Configure Django settings
- Set up PostgreSQL database
- Implement backend models and API endpoints
- Develop frontend components
- Integrate 3D globe and timeline
