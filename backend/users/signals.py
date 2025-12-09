from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile


@receiver(post_save, sender=User)
def create_user_profile_and_token(sender, instance, created, **kwargs):
    """
    Create user profile when a new user is created.
    """
    if created:
        # Create user profile (get_or_create to avoid duplicates)
        Profile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Save user profile when user is saved.
    """
    # Ensure profile exists (in case signals fired out of order)
    if not hasattr(instance, 'profile'):
        Profile.objects.get_or_create(user=instance)
    else:
        instance.profile.save()
