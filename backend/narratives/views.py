from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from narratives.models import Narrative
from narratives.serializers import NarrativeSerializer
from media.models import MediaItem

class NarrativeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows narratives to be viewed or edited.
    """
    queryset = Narrative.objects.all()
    serializer_class = NarrativeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own narratives
        return Narrative.objects.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
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
