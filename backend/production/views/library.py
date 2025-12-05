from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from ..models import MediaTag, MediaLibrary
from ..serializers import MediaTagSerializer, MediaLibrarySerializer, MediaLibraryListSerializer
from ..permissions import IsAdminUser


class MediaTagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing media tags.
    Read access for authenticated users, write access for admins only.
    """
    queryset = MediaTag.objects.all()
    serializer_class = MediaTagSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        """
        Allow authenticated users to read (list, retrieve),
        but only admins can write (create, update, delete).
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]


# Backward compatibility alias
ImageTagViewSet = MediaTagViewSet


class MediaLibraryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing media (images and videos) in the library.
    Read access for authenticated users, write access for admins only.
    
    Supports filtering by:
    - search: Search in name and description
    - tags: Filter by tag IDs (comma-separated)
    - language: Filter by language (en/fr/null)
    - media_type: Filter by media type (image/video)
    """
    queryset = MediaLibrary.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Allow authenticated users to read (list, retrieve, stats),
        but only admins can write (create, update, delete).
        """
        if self.action in ['list', 'retrieve', 'stats']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MediaLibraryListSerializer
        return MediaLibrarySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by media type
        media_type = self.request.query_params.get('media_type', None)
        if media_type:
            queryset = queryset.filter(media_type=media_type)
        
        # Filter by tags
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_ids = [int(tid) for tid in tags.split(',') if tid.strip().isdigit()]
            if tag_ids:
                queryset = queryset.filter(tags__id__in=tag_ids).distinct()
        
        # Filter by language
        language = self.request.query_params.get('language', None)
        if language is not None:
            if language.lower() == 'null' or language == '':
                queryset = queryset.filter(language__isnull=True)
            else:
                queryset = queryset.filter(language=language)
        
        return queryset.prefetch_related('tags')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about the media library"""
        queryset = self.get_queryset()
        total_media = queryset.count()
        media_with_tags = queryset.filter(tags__isnull=False).distinct().count()
        media_by_language = {
            'en': queryset.filter(language='en').count(),
            'fr': queryset.filter(language='fr').count(),
            'none': queryset.filter(language__isnull=True).count(),
        }
        media_by_type = {
            'image': queryset.filter(media_type='image').count(),
            'video': queryset.filter(media_type='video').count(),
        }
        
        return Response({
            'total_media': total_media,
            'media_with_tags': media_with_tags,
            'media_by_language': media_by_language,
            'media_by_type': media_by_type,
        })


# Backward compatibility alias
ImageLibraryViewSet = MediaLibraryViewSet
