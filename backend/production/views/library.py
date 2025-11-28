from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from ..models import ImageTag, ImageLibrary
from ..serializers import ImageTagSerializer, ImageLibrarySerializer, ImageLibraryListSerializer
from ..permissions import IsAdminUser


class ImageTagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing image tags.
    Admin-only access.
    """
    queryset = ImageTag.objects.all()
    serializer_class = ImageTagSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ImageLibraryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing images in the library.
    Admin-only access.
    
    Supports filtering by:
    - search: Search in name and description
    - tags: Filter by tag IDs (comma-separated)
    - language: Filter by language (en/fr/null)
    """
    queryset = ImageLibrary.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ImageLibraryListSerializer
        return ImageLibrarySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
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
        """Get statistics about the image library"""
        total_images = self.get_queryset().count()
        images_with_tags = self.get_queryset().filter(tags__isnull=False).distinct().count()
        images_by_language = {
            'en': self.get_queryset().filter(language='en').count(),
            'fr': self.get_queryset().filter(language='fr').count(),
            'none': self.get_queryset().filter(language__isnull=True).count(),
        }
        
        return Response({
            'total_images': total_images,
            'images_with_tags': images_with_tags,
            'images_by_language': images_by_language,
        })
