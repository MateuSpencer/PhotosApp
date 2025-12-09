from rest_framework import serializers
from projects.models import Project

class ProjectSerializer(serializers.ModelSerializer):
    narratives_count = serializers.SerializerMethodField()
    narratives_detail = serializers.SerializerMethodField(read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'cover_image', 'narratives', 
                 'narratives_count', 'narratives_detail', 'public_status', 
                 'owner', 'owner_username', 'date_created', 'date_modified']
        read_only_fields = ['id', 'narratives_count', 'narratives_detail', 
                           'owner', 'owner_username', 'date_created', 'date_modified']
        extra_kwargs = {
            'title': {'required': True},
            'description': {'required': False},
            'cover_image': {'required': False},
            'narratives': {'required': False},
            'public_status': {'required': False},
        }
    
    def get_narratives_count(self, obj):
        return obj.narratives.count()
    
    def get_narratives_detail(self, obj):
        # Only return basic narrative details to avoid circular serialization
        return [{'id': n.id, 'title': n.title} for n in obj.narratives.all()]
    
    def create(self, validated_data):
        # Extract narratives to add after creation
        narratives_data = validated_data.pop('narratives', None)
        
        # Create the project
        project = Project.objects.create(**validated_data)
        
        # Add narratives if provided
        if narratives_data:
            project.narratives.set(narratives_data)
            
        return project
