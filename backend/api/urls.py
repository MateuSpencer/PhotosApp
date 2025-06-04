from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, ProfileViewSet
from narratives.views import NarrativeViewSet
from media.views import MediaItemViewSet, NoteViewSet
from locations.views import LocationViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', ProfileViewSet)
router.register(r'narratives', NarrativeViewSet)
router.register(r'media', MediaItemViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'locations', LocationViewSet)

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    # Authentication is handled by dj_rest_auth in the main urls.py
]
