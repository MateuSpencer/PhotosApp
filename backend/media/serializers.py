from rest_framework import serializers
from media.models import MediaItem, Note


class MediaItemSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = MediaItem
        fields = [
            'id', 'title', 'file', 'media_type', 
            'thumbnail_small', 'thumbnail_medium', 'thumbnail_large',
            'capture_date', 'latitude', 'longitude', 
            'camera_make', 'camera_model',
            'description', 'narrative', 'owner', 'owner_username',
            'date_uploaded', 'date_modified'
        ]
        read_only_fields = [
            'id', 'owner', 'owner_username', 
            'thumbnail_small', 'thumbnail_medium', 'thumbnail_large',
            'camera_make', 'camera_model',
            'date_uploaded', 'date_modified'
        ]


class NoteSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = Note
        fields = ['id', 'content', 'media_item', 'narrative', 'day_date', 
                 'owner', 'owner_username', 'date_created', 'date_modified']
        read_only_fields = ['id', 'owner', 'owner_username', 'date_created', 'date_modified']


class BatchUploadSerializer(serializers.Serializer):
    """Serializer for batch file upload."""
    files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True
    )
    narrative = serializers.UUIDField(required=False)
