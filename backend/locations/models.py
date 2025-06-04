from django.db import models
from django.contrib.auth.models import User
from media.models import MediaItem

class Location(models.Model):
    """
    Represents a geographic location associated with media items.
    Used for organizing and displaying media on the globe.
    """
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    # Optional fields
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    
    # Many-to-many relationship with media items
    media_items = models.ManyToManyField(MediaItem, related_name='locations')
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']
