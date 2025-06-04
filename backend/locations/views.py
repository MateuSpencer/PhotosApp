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
    serializer_class = None  # Will be imported below to avoid circular imports
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        from locations.serializers import LocationSerializer
        return LocationSerializer
    
    def get_queryset(self):
        # Filter locations based on user's media items
        user_media_items = MediaItem.objects.filter(owner=self.request.user)
        return Location.objects.filter(media_items__in=user_media_items).distinct()
    
    @action(detail=True, methods=['get'])
    def media(self, request, pk=None):
        """
        Returns all media items for a specific location.
        """
        location = self.get_object()
        media_items = location.media_items.filter(owner=request.user)
        from media.serializers import MediaItemSerializer
        serializer = MediaItemSerializer(media_items, many=True, context={'request': request})
        return Response(serializer.data)
