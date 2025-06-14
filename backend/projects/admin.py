from django.contrib import admin
from projects.models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'public_status', 'date_created', 'date_modified')
    list_filter = ('public_status', 'date_created')
    search_fields = ('title', 'description')
    filter_horizontal = ('narratives',)
