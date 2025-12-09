from django.db import models
from django.contrib.auth.models import User
import uuid

class Narrative(models.Model):
    """
    Represents a user's narrative project (e.g., "Norway 2023").
    Contains metadata about the narrative and references to media items.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='narrative_covers/', blank=True, null=True)
    
    # Owner - the user who created this narrative
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='narratives', null=True, blank=True)
    
    # Automatically calculated fields
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    location_summary = models.CharField(max_length=255, blank=True)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-date_created']
