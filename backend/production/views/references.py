from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from ..models import ReferenceValue, ReferenceHistory
from ..serializers import (
    ReferenceValueSerializer,
    ReferenceValueListSerializer,
    ReferenceHistorySerializer
)
from ..permissions import IsAdminUser


class ReferenceValueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing reference values.
    Read access for authenticated users, write access for admins only.
    """
    
    def get_permissions(self):
        """
        Allow authenticated users to read (list, retrieve, history, types),
        but only admins can write (create, update, delete).
        """
        if self.action in ['list', 'retrieve', 'history', 'types']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ReferenceValueListSerializer
        return ReferenceValueSerializer
    
    def get_queryset(self):
        queryset = ReferenceValue.objects.all().prefetch_related('fields', 'fields__value_image')
        
        # Filter by type if provided
        ref_type = self.request.query_params.get('type', None)
        if ref_type:
            queryset = queryset.filter(type=ref_type)
        
        # Search in field values
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(fields__value_string__icontains=search) |
                Q(type__icontains=search)
            ).distinct()
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get version history for a reference"""
        reference = self.get_object()
        history = ReferenceHistory.objects.filter(reference=reference)
        serializer = ReferenceHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get list of available reference types from the database"""
        types = ReferenceValue.objects.values_list('type', flat=True).distinct()
        return Response(list(types))
