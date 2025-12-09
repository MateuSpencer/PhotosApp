from django.db import models
from django.contrib.auth.models import User
import uuid

class MediaItem(models.Model):
    """
    Represents a media file (photo or video) uploaded by a user.
    Contains file metadata, location data, and association with narratives.
    """
    MEDIA_TYPE_CHOICES = [
        ('photo', 'Photo'),
        ('video', 'Video'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to='media/%Y/%m/%d/')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='photo')
    
    # Thumbnails (auto-generated)
    thumbnail_small = models.ImageField(upload_to='thumbnails/%Y/%m/%d/', blank=True, null=True)
    thumbnail_medium = models.ImageField(upload_to='thumbnails/%Y/%m/%d/', blank=True, null=True)
    thumbnail_large = models.ImageField(upload_to='thumbnails/%Y/%m/%d/', blank=True, null=True)
    
    # Metadata from EXIF
    capture_date = models.DateTimeField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    camera_make = models.CharField(max_length=100, blank=True)
    camera_model = models.CharField(max_length=100, blank=True)
    
    # User content
    description = models.TextField(blank=True)
    
    # Relationships
    narrative = models.ForeignKey('narratives.Narrative', on_delete=models.CASCADE, related_name='media_items', null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='media_items', null=True, blank=True)
    
    # System fields
    date_uploaded = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title or f"Media {self.id}"
    
    class Meta:
        ordering = ['-capture_date', '-date_uploaded']


class Note(models.Model):
    """
    Represents a user note that can be associated with media items,
    days, or entire narratives.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.TextField()
    
    # Optional associations
    media_item = models.ForeignKey(MediaItem, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    narrative = models.ForeignKey('narratives.Narrative', on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    day_date = models.DateField(null=True, blank=True)  # For day-specific notes
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    
    # System fields
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Note: {self.content[:50]}..."
    
    class Meta:
        ordering = ['-date_created']
