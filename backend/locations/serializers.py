from rest_framework import serializers
from locations.models import Location

class LocationSerializer(serializers.ModelSerializer):
    media_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = ['id', 'name', 'latitude', 'longitude', 'country', 
                 'city', 'address', 'media_count', 'date_created', 'date_modified']
        read_only_fields = ['id', 'date_created', 'date_modified']
    
    def get_media_count(self, obj):
        return obj.media_items.count()
