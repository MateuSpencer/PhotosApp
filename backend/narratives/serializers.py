from rest_framework import serializers
from narratives.models import Narrative

class NarrativeSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    media_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Narrative
        fields = ['id', 'title', 'description', 'owner', 'owner_username', 
                 'cover_image', 'start_date', 'end_date', 'location_summary', 
                 'media_count', 'date_created', 'date_modified']
        read_only_fields = ['id', 'owner_username', 'start_date', 'end_date', 
                           'location_summary', 'media_count', 'date_created', 'date_modified']
    
    def get_media_count(self, obj):
        return obj.media_items.count()
    
    def create(self, validated_data):
        # Set the owner to the current user
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
