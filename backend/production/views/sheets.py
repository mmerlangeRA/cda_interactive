from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..models import Sheet, SheetPage, InteractiveElement
from ..serializers import (
    SheetSerializer,
    SheetListSerializer,
    SheetPageSerializer,
    SheetPageListSerializer,
    InteractiveElementSerializer,
    InteractiveElementListSerializer
)
from ..permissions import IsEditorOrAdmin


class SheetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Sheet CRUD operations.
    
    Only EDITOR and ADMIN users can create, update, or delete.
    All authenticated users can read.
    """
    queryset = Sheet.objects.all()
    permission_classes = [IsEditorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['business_id', 'language', 'created_by']
    search_fields = ['name', 'business_id']
    ordering_fields = ['created_at', 'updated_at', 'name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SheetListSerializer
        return SheetSerializer
    
    @swagger_auto_schema(
        operation_description="List all sheets with optional filtering",
        responses={
            200: SheetListSerializer(many=True),
        },
        tags=['Sheets']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Retrieve a specific sheet with all its pages",
        responses={
            200: SheetSerializer(),
            404: "Sheet not found"
        },
        tags=['Sheets']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new sheet (EDITOR/ADMIN only)",
        request_body=SheetSerializer,
        responses={
            201: SheetSerializer(),
            400: "Invalid data",
            403: "Permission denied - requires EDITOR or ADMIN role"
        },
        tags=['Sheets']
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Update a sheet (EDITOR/ADMIN only)",
        request_body=SheetSerializer,
        responses={
            200: SheetSerializer(),
            400: "Invalid data",
            403: "Permission denied - requires EDITOR or ADMIN role",
            404: "Sheet not found"
        },
        tags=['Sheets']
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Partially update a sheet (EDITOR/ADMIN only)",
        request_body=SheetSerializer,
        responses={
            200: SheetSerializer(),
            400: "Invalid data",
            403: "Permission denied - requires EDITOR or ADMIN role",
            404: "Sheet not found"
        },
        tags=['Sheets']
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Delete a sheet (EDITOR/ADMIN only)",
        responses={
            204: "Sheet deleted successfully",
            403: "Permission denied - requires EDITOR or ADMIN role",
            404: "Sheet not found"
        },
        tags=['Sheets']
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    @swagger_auto_schema(
        method='get',
        operation_description="Get all translations of a sheet by business_id",
        responses={
            200: SheetListSerializer(many=True)
        },
        tags=['Sheets']
    )
    @action(detail=False, methods=['get'])
    def by_business_id(self, request):
        """Get all translations of a sheet by business_id"""
        business_id = request.query_params.get('business_id')
        if not business_id:
            return Response({'error': 'business_id parameter is required'}, status=400)
        
        sheets = self.queryset.filter(business_id=business_id)
        serializer = SheetListSerializer(sheets, many=True)
        return Response(serializer.data)


class SheetPageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SheetPage CRUD operations.
    
    Only EDITOR and ADMIN users can create, update, or delete.
    All authenticated users can read.
    """
    queryset = SheetPage.objects.all()
    permission_classes = [IsEditorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sheet', 'number', 'created_by']
    search_fields = []  # Description is now JSON, can't be searched easily
    ordering_fields = ['created_at', 'updated_at', 'number']
    ordering = ['sheet', 'number']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SheetPageListSerializer
        return SheetPageSerializer
    
    @swagger_auto_schema(
        operation_description="List all sheet pages with optional filtering",
        responses={
            200: SheetPageListSerializer(many=True),
        },
        tags=['Sheet Pages']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Retrieve a specific sheet page with all its elements",
        responses={
            200: SheetPageSerializer(),
            404: "Sheet page not found"
        },
        tags=['Sheet Pages']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new sheet page (EDITOR/ADMIN only)",
        request_body=SheetPageSerializer,
        responses={
            201: SheetPageSerializer(),
            400: "Invalid data",
            403: "Permission denied - requires EDITOR or ADMIN role"
        },
        tags=['Sheet Pages']
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Update a sheet page (EDITOR/ADMIN only)",
        request_body=SheetPageSerializer,
        responses={
            200: SheetPageSerializer(),
            400: "Invalid data",
            403: "Permission denied - requires EDITOR or ADMIN role",
            404: "Sheet page not found"
        },
        tags=['Sheet Pages']
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Partially update a sheet page (EDITOR/ADMIN only)",
        request_body=SheetPageSerializer,
        responses={
            200: SheetPageSerializer(),
            400: "Invalid data",
            403: "Permission denied - requires EDITOR or ADMIN role",
            404: "Sheet page not found"
        },
        tags=['Sheet Pages']
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Delete a sheet page (EDITOR/ADMIN only). If renumber=true, subsequent pages will be renumbered.",
        manual_parameters=[
            openapi.Parameter(
                'renumber',
                openapi.IN_QUERY,
                description="Whether to renumber subsequent pages after deletion (default: true)",
                type=openapi.TYPE_BOOLEAN,
                default=True
            )
        ],
        responses={
            204: "Sheet page deleted successfully",
            403: "Permission denied - requires EDITOR or ADMIN role",
            404: "Sheet page not found"
        },
        tags=['Sheet Pages']
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        renumber = request.query_params.get('renumber', 'true').lower() == 'true'
        
        if renumber:
            deleted_number = instance.number
            sheet_id = instance.sheet_id
            
            # Delete the page
            self.perform_destroy(instance)
            
            # Renumber subsequent pages
            pages_to_update = SheetPage.objects.filter(
                sheet_id=sheet_id,
                number__gt=deleted_number
            )
            for page in pages_to_update:
                page.number -= 1
                page.save()
        else:
            self.perform_destroy(instance)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    


class InteractiveElementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for InteractiveElement CRUD operations.
    
    Only EDITOR and ADMIN users can create, update, or delete.
    All authenticated users can read.
    """
    queryset = InteractiveElement.objects.all()
    permission_classes = [IsEditorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['page', 'business_id', 'type', 'created_by']
    search_fields = ['business_id', 'type']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['page', 'id']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InteractiveElementListSerializer
        return InteractiveElementSerializer
    
    @swagger_auto_schema(
        operation_description="List all interactive elements with optional filtering",
        responses={
            200: InteractiveElementListSerializer(many=True),
        },
        tags=['Interactive Elements']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Retrieve a specific interactive element",
        responses={
            200: InteractiveElementSerializer(),
            404: "Interactive element not found"
        },
        tags=['Interactive Elements']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new interactive element (EDITOR/ADMIN only)",
        request_body=InteractiveElementSerializer,
        responses={
            201: InteractiveElementSerializer(),
            400: "Invalid data",
            403: "Permission denied - requires EDITOR or ADMIN role"
        },
        tags=['Interactive Elements']
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Update an interactive element (EDITOR/ADMIN only)",
        request_body=InteractiveElementSerializer,
        responses={
            200: InteractiveElementSerializer(),
            400: "Invalid data",
            403: "Permission denied - requires EDITOR or ADMIN role",
            404: "Interactive element not found"
        },
        tags=['Interactive Elements']
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Partially update an interactive element (EDITOR/ADMIN only)",
        request_body=InteractiveElementSerializer,
        responses={
            200: InteractiveElementSerializer(),
            400: "Invalid data",
            403: "Permission denied - requires EDITOR or ADMIN role",
            404: "Interactive element not found"
        },
        tags=['Interactive Elements']
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Delete an interactive element (EDITOR/ADMIN only)",
        responses={
            204: "Interactive element deleted successfully",
            403: "Permission denied - requires EDITOR or ADMIN role",
            404: "Interactive element not found"
        },
        tags=['Interactive Elements']
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    @swagger_auto_schema(
        method='get',
        operation_description="Get all translations of an element by business_id",
        responses={
            200: InteractiveElementListSerializer(many=True)
        },
        tags=['Interactive Elements']
    )
    @action(detail=False, methods=['get'])
    def by_business_id(self, request):
        """Get all translations of an element by business_id"""
        business_id = request.query_params.get('business_id')
        if not business_id:
            return Response({'error': 'business_id parameter is required'}, status=400)
        
        elements = self.queryset.filter(business_id=business_id)
        serializer = InteractiveElementListSerializer(elements, many=True)
        return Response(serializer.data)
