import os
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.files.base import ContentFile
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from media.models import MediaItem, Note
from media.serializers import MediaItemSerializer, NoteSerializer, BatchUploadSerializer
from media.utils import get_exif_data, generate_thumbnails, get_media_type


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class MediaItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows media items to be viewed or edited.
    """
    queryset = MediaItem.objects.all()
    serializer_class = MediaItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        # Return only media items owned by the current user
        if not self.request.user.is_authenticated:
            return MediaItem.objects.none()
            
        queryset = MediaItem.objects.filter(owner=self.request.user)
        
        # Filter by narrative if provided
        narrative_id = self.request.query_params.get('narrative', None)
        if narrative_id:
            queryset = queryset.filter(narrative=narrative_id)
            
        return queryset
    
    def perform_create(self, serializer):
        """Create media item with EXIF extraction and thumbnail generation."""
        file_obj = self.request.FILES.get('file')
        extra_data = {'owner': self.request.user}
        
        if file_obj:
            # Determine media type
            extra_data['media_type'] = get_media_type(file_obj.name)
            
            # Extract EXIF data for photos
            if extra_data['media_type'] == 'photo':
                exif_data = get_exif_data(file_obj)
                if exif_data.get('capture_date'):
                    extra_data['capture_date'] = exif_data['capture_date']
                if exif_data.get('latitude'):
                    extra_data['latitude'] = exif_data['latitude']
                if exif_data.get('longitude'):
                    extra_data['longitude'] = exif_data['longitude']
                if exif_data.get('camera_make'):
                    extra_data['camera_make'] = exif_data['camera_make']
                if exif_data.get('camera_model'):
                    extra_data['camera_model'] = exif_data['camera_model']
        
        instance = serializer.save(**extra_data)
        
        # Generate thumbnails after save (when we have the file path)
        if instance.media_type == 'photo' and instance.file:
            self._generate_thumbnails(instance)
    
    def _generate_thumbnails(self, instance):
        """Generate thumbnails for a media item."""
        try:
            file_path = instance.file.path
            thumb_dir = os.path.join(settings.MEDIA_ROOT, 'thumbnails', 
                                    str(instance.id)[:2], str(instance.id))
            os.makedirs(thumb_dir, exist_ok=True)
            
            thumbnails = generate_thumbnails(file_path, thumb_dir, str(instance.id))
            
            # Save thumbnail paths to the model
            for size, path in thumbnails.items():
                if os.path.exists(path):
                    relative_path = os.path.relpath(path, settings.MEDIA_ROOT)
                    if size == 'small':
                        instance.thumbnail_small = relative_path
                    elif size == 'medium':
                        instance.thumbnail_medium = relative_path
                    elif size == 'large':
                        instance.thumbnail_large = relative_path
            
            instance.save()
        except Exception as e:
            print(f"Error generating thumbnails for {instance.id}: {e}")
    
    @action(detail=False, methods=['post'], url_path='batch-upload')
    def batch_upload(self, request):
        """
        Upload multiple media files at once.
        POST /api/media/batch-upload/
        """
        files = request.FILES.getlist('files')
        narrative_id = request.data.get('narrative')
        
        if not files:
            return Response(
                {'error': 'No files provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = {
            'success': [],
            'failed': [],
            'total': len(files),
        }
        
        for file_obj in files:
            try:
                # Create media item data
                data = {
                    'file': file_obj,
                    'title': os.path.splitext(file_obj.name)[0],
                }
                if narrative_id:
                    data['narrative'] = narrative_id
                
                serializer = MediaItemSerializer(data=data, context={'request': request})
                if serializer.is_valid():
                    # Extract EXIF and set owner
                    extra_data = {
                        'owner': request.user,
                        'media_type': get_media_type(file_obj.name),
                    }
                    
                    if extra_data['media_type'] == 'photo':
                        file_obj.seek(0)
                        exif_data = get_exif_data(file_obj)
                        file_obj.seek(0)
                        
                        if exif_data.get('capture_date'):
                            extra_data['capture_date'] = exif_data['capture_date']
                        if exif_data.get('latitude'):
                            extra_data['latitude'] = exif_data['latitude']
                        if exif_data.get('longitude'):
                            extra_data['longitude'] = exif_data['longitude']
                        if exif_data.get('camera_make'):
                            extra_data['camera_make'] = exif_data['camera_make']
                        if exif_data.get('camera_model'):
                            extra_data['camera_model'] = exif_data['camera_model']
                    
                    instance = serializer.save(**extra_data)
                    
                    # Generate thumbnails
                    if instance.media_type == 'photo':
                        self._generate_thumbnails(instance)
                    
                    results['success'].append({
                        'id': str(instance.id),
                        'title': instance.title,
                        'filename': file_obj.name,
                    })
                else:
                    results['failed'].append({
                        'filename': file_obj.name,
                        'errors': serializer.errors,
                    })
            except Exception as e:
                results['failed'].append({
                    'filename': file_obj.name,
                    'errors': str(e),
                })
        
        return Response(results, status=status.HTTP_201_CREATED if results['success'] else status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], url_path='metadata')
    def update_metadata(self, request, pk=None):
        """
        Update metadata for a specific media item.
        PATCH /api/media/<id>/metadata/
        """
        instance = self.get_object()
        
        allowed_fields = ['title', 'description', 'capture_date', 'latitude', 'longitude', 'narrative']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = self.get_serializer(instance, data=update_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)


class NoteViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows notes to be viewed or edited.
    """
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        # Return only notes owned by the current user
        if not self.request.user.is_authenticated:
            return Note.objects.none()
            
        queryset = Note.objects.filter(owner=self.request.user)
        
        # Filter by narrative if provided
        narrative_id = self.request.query_params.get('narrative', None)
        if narrative_id:
            queryset = queryset.filter(narrative=narrative_id)
            
        # Filter by media item if provided
        media_item_id = self.request.query_params.get('media_item', None)
        if media_item_id:
            queryset = queryset.filter(media_item=media_item_id)
            
        return queryset
    
    def perform_create(self, serializer):
        # Set the owner to the current user
        serializer.save(owner=self.request.user)
