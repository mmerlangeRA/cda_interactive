"""
Custom views for serving media files during development/debugging.
"""
import os
from django.http import FileResponse, Http404, HttpResponse
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import mimetypes


@api_view(['GET'])
@permission_classes([AllowAny])
def serve_media_debug(request, path):
    """
    Serve media files without authentication for debugging purposes.
    IMPORTANT: Only use this in development! Remove or restrict in production.
    """
    if not settings.DEBUG:
        raise Http404("This view is only available in DEBUG mode")
    
    # Construct the full file path
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    
    # Security check: ensure the path is within MEDIA_ROOT
    file_path = os.path.abspath(file_path)
    media_root = os.path.abspath(settings.MEDIA_ROOT)
    
    if not file_path.startswith(media_root):
        raise Http404("Invalid file path")
    
    # Check if file exists
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        raise Http404("File not found")
    
    # Determine content type
    content_type, _ = mimetypes.guess_type(file_path)
    
    # Open and serve the file
    try:
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)
        # Add CORS headers for debugging
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = '*'
        return response
    except Exception as e:
        raise Http404(f"Error serving file: {str(e)}")
