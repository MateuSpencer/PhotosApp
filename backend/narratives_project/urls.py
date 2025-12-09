from django.urls import path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Welcome to the Narratives App API",
        "version": "1.0",
        "endpoints": {
            "admin": "/admin/",
            "api": "/api/",
            "auth": "/api/auth/"
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_root, name='api-root'),
    # API v1 endpoints
    path('api/v1/', include('api.urls')),
    path('api/v1/', include('users.urls')),
    # Legacy API endpoints (for backwards compatibility during transition)
    path('api/', include('api.urls')),
    path('api/', include('users.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
