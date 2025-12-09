from django.contrib import admin
from media.models import MediaItem, Note

@admin.register(MediaItem)
class MediaItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'media_type', 'capture_date', 'narrative', 'date_uploaded']
    list_filter = ['media_type', 'capture_date', 'date_uploaded']
    search_fields = ['title', 'description']
    readonly_fields = ['id', 'date_uploaded', 'date_modified']

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['content_preview', 'media_item', 'narrative', 'day_date', 'date_created']
    list_filter = ['date_created', 'day_date']
    search_fields = ['content']
    readonly_fields = ['id', 'date_created', 'date_modified']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
