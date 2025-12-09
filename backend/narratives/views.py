from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from narratives.models import Narrative
from narratives.serializers import NarrativeSerializer
from media.models import MediaItem


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions only for owner
        return obj.owner == request.user


class NarrativeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows narratives to be viewed or edited.
    """
    queryset = Narrative.objects.all()
    serializer_class = NarrativeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        # Return only narratives owned by the current user
        if self.request.user.is_authenticated:
            return Narrative.objects.filter(owner=self.request.user)
        return Narrative.objects.none()
    
    def perform_create(self, serializer):
        # Set the owner to the current user
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def media(self, request, pk=None):
        """
        Returns all media items for a specific narrative.
        """
        narrative = self.get_object()
        media_items = MediaItem.objects.filter(narrative=narrative)
        from media.serializers import MediaItemSerializer
        serializer = MediaItemSerializer(media_items, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """
        Returns all notes for a specific narrative.
        """
        narrative = self.get_object()
        notes = narrative.notes.all()
        from media.serializers import NoteSerializer
        serializer = NoteSerializer(notes, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def days(self, request, pk=None):
        """
        Returns media items grouped by day for a specific narrative.
        """
        from datetime import datetime
        from collections import defaultdict
        
        narrative = self.get_object()
        media_items = MediaItem.objects.filter(narrative=narrative).order_by('capture_date', 'date_uploaded')
        
        # Group media items by day
        days_data = defaultdict(list)
        
        for media_item in media_items:
            # Use capture_date if available, otherwise use upload date
            date = media_item.capture_date or media_item.date_uploaded
            if date:
                day_key = date.date().isoformat()
                from media.serializers import MediaItemSerializer
                media_data = MediaItemSerializer(media_item, context={'request': request}).data
                days_data[day_key].append(media_data)
        
        # Convert to list format expected by frontend
        result = []
        for day, items in sorted(days_data.items()):
            result.append({
                'date': day,
                'media_items': items,
                'count': len(items)
            })
        
        return Response(result)
