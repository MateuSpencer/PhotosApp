from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from locations.models import Location
from media.models import MediaItem

class LocationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    queryset = Location.objects.all()
    
    def get_serializer_class(self):
        from locations.serializers import LocationSerializer
        return LocationSerializer
    
    def get_queryset(self):
        # Return all locations since we're removing user authentication
        return Location.objects.all()
    
    @action(detail=True, methods=['get'])
    def media(self, request, pk=None):
        """
        Returns all media items for a specific location.
        """
        location = self.get_object()
        media_items = location.media_items.all()
        from media.serializers import MediaItemSerializer
        serializer = MediaItemSerializer(media_items, many=True, context={'request': request})
        return Response(serializer.data)
