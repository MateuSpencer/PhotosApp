from rest_framework import serializers
from narratives.models import Narrative

class NarrativeSerializer(serializers.ModelSerializer):
    media_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Narrative
        fields = ['id', 'title', 'description', 'cover_image', 'start_date', 
                 'end_date', 'location_summary', 'media_count', 'date_created', 'date_modified']
        read_only_fields = ['id', 'start_date', 'end_date', 'location_summary', 
                           'media_count', 'date_created', 'date_modified']
    
    def get_media_count(self, obj):
        return obj.media_items.count()
