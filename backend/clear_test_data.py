#!/usr/bin/env python
import os
import django

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "narratives_project.settings")
django.setup()

# Import models
from narratives.models import Narrative
from projects.models import Project
from media.models import MediaItem, Note

# Clear test data
def clear_test_data():
    print("Clearing test data...")
    
    # Delete all objects with "Test" in their titles
    test_narratives = Narrative.objects.filter(title__icontains="Test")
    test_projects = Project.objects.filter(title__icontains="Test")
    
    print(f"Found {test_narratives.count()} test narratives")
    print(f"Found {test_projects.count()} test projects")
    
    # Delete test data
    test_narratives.delete()
    test_projects.delete()
    
    print("Test data cleared successfully!")
    
    # Print remaining objects
    print("\n--- Remaining Objects ---")
    print(f"Narratives: {Narrative.objects.count()}")
    print(f"Projects: {Project.objects.count()}")
    print(f"Media Items: {MediaItem.objects.count()}")

if __name__ == "__main__":
    clear_test_data()
