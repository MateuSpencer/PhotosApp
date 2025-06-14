from django.db import models
import uuid

class Project(models.Model):
    """
    Represents a collection of narratives organized as a single project.
    A project can contain multiple narratives and serves as the top-level
    organizational unit for the user's content.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='project_covers/', blank=True, null=True)
    
    # A project can include multiple narratives
    narratives = models.ManyToManyField('narratives.Narrative', related_name='projects', blank=True)
    
    # Project status
    PUBLIC_CHOICES = [
        ('private', 'Private'),
        ('unlisted', 'Unlisted'),
        ('public', 'Public'),
    ]
    public_status = models.CharField(max_length=10, choices=PUBLIC_CHOICES, default='private')
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-date_modified']
