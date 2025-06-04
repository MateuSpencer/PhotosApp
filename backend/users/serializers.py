from django.contrib.auth.models import User
from rest_framework import serializers
from users.models import Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'bio', 'profile_image', 
                 'default_map_view', 'date_created', 'date_modified']
        read_only_fields = ['id', 'date_created', 'date_modified']
