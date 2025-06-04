from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    """
    Extended user profile for the Narratives app.
    Stores additional user information and preferences.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    
    # External service tokens (encrypted in production)
    google_photos_token = models.TextField(blank=True, null=True)
    icloud_token = models.TextField(blank=True, null=True)
    onedrive_token = models.TextField(blank=True, null=True)
    
    # User preferences
    default_map_view = models.CharField(
        max_length=20, 
        choices=[('globe', '3D Globe'), ('map', 'Flat Map')],
        default='globe'
    )
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
