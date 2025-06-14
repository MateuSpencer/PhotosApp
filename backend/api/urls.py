from django.urls import path, include
from rest_framework.routers import DefaultRouter
from narratives.views import NarrativeViewSet
from media.views import MediaItemViewSet, NoteViewSet
from locations.views import LocationViewSet
from projects.views import ProjectViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'narratives', NarrativeViewSet)
router.register(r'media', MediaItemViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'projects', ProjectViewSet)

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]
