from django.shortcuts import get_object_or_404
from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from projects.models import Project
from projects.serializers import ProjectSerializer
from narratives.models import Narrative
from narratives.serializers import NarrativeSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows projects to be viewed or edited.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
    def get_queryset(self):
        # Return all projects since we're removing user authentication
        return Project.objects.all()
    
    def perform_create(self, serializer):
        # Create without user ownership since we're removing authentication
        serializer.save()
    
    @action(detail=True, methods=['get'])
    def narratives(self, request, pk=None):
        """
        Returns all narratives for a specific project.
        """
        project = self.get_object()
        narratives = project.narratives.all()
        serializer = NarrativeSerializer(narratives, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_narrative(self, request, pk=None):
        """
        Add a narrative to the project.
        """
        project = self.get_object()
        narrative_id = request.data.get('narrative_id')
        
        if not narrative_id:
            return Response(
                {"error": "Narrative ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            narrative = Narrative.objects.get(id=narrative_id)
            
            # Since we removed authentication, any narrative can be added
            project.narratives.add(narrative)
            return Response(
                {"success": f"Narrative '{narrative.title}' added to project"}, 
                status=status.HTTP_200_OK
            )
            
        except Narrative.DoesNotExist:
            return Response(
                {"error": "Narrative not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_narrative(self, request, pk=None):
        """
        Remove a narrative from the project.
        """
        project = self.get_object()
        narrative_id = request.data.get('narrative_id')
        
        if not narrative_id:
            return Response(
                {"error": "Narrative ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            narrative = Narrative.objects.get(id=narrative_id)
            
            if narrative in project.narratives.all():
                project.narratives.remove(narrative)
                return Response(
                    {"success": f"Narrative '{narrative.title}' removed from project"}, 
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Narrative not in project"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Narrative.DoesNotExist:
            return Response(
                {"error": "Narrative not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
