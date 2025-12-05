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
    
    Supports filtering by:
    - boat, gamme_cabine, variante_gamme, cabine (boat hierarchy)
    - ligne, poste, ligne_sens (ligne hierarchy)
    """
    queryset = Sheet.objects.all()
    permission_classes = [IsEditorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['business_id', 'created_by']
    search_fields = ['name', 'business_id']
    ordering_fields = ['created_at', 'updated_at', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Optionally restricts the returned sheets by filtering against
        boat/ligne hierarchies via PosteVarianteDocumentation
        """
        queryset = super().get_queryset()
        
        # Get filter parameters
        boat_id = self.request.query_params.get('boat')
        gamme_cabine_id = self.request.query_params.get('gamme_cabine')
        variante_gamme_id = self.request.query_params.get('variante_gamme')
        cabine_id = self.request.query_params.get('cabine')
        ligne_id = self.request.query_params.get('ligne')
        poste_id = self.request.query_params.get('poste')
        ligne_sens = self.request.query_params.get('ligne_sens')
        
        # If any filters are provided, filter through PosteVarianteDocumentation
        if any([boat_id, gamme_cabine_id, variante_gamme_id, cabine_id, ligne_id, poste_id, ligne_sens]):
            from ..models import PosteVarianteDocumentation
            
            # Start with all documentation records
            docs = PosteVarianteDocumentation.objects.all()
            
            # Apply boat hierarchy filters
            if cabine_id:
                docs = docs.filter(varianteGamme__cabine__id=cabine_id)
            elif variante_gamme_id:
                docs = docs.filter(varianteGamme__id=variante_gamme_id)
            elif gamme_cabine_id:
                docs = docs.filter(varianteGamme__gamme__id=gamme_cabine_id)
            elif boat_id:
                docs = docs.filter(varianteGamme__gamme__boat__id=boat_id)
            
            # Apply ligne hierarchy filters
            if poste_id:
                docs = docs.filter(poste__id=poste_id)
            elif ligne_id:
                docs = docs.filter(poste__ligne__id=ligne_id)
            
            # Apply ligne_sens filter
            if ligne_sens:
                docs = docs.filter(ligne_sens=ligne_sens)
            
            # Get sheet IDs from filtered documentation
            sheet_ids = docs.values_list('sheet_id', flat=True).distinct()
            queryset = queryset.filter(id__in=sheet_ids)
        
        return queryset
    
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


# Filter entity viewsets
from ..models import Boat, GammeCabine, VarianteGamme, Cabine, Ligne, Poste, PosteVarianteDocumentation
from ..serializers import (
    BoatSerializer, GammeCabineSerializer, VarianteGammeSerializer,
    CabineSerializer, LigneSerializer, PosteSerializer
)


class BoatViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing boats (read-only)"""
    queryset = Boat.objects.all().order_by('name')
    serializer_class = BoatSerializer
    permission_classes = [IsEditorOrAdmin]


class GammeCabineViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing gamme cabines (read-only), filterable by boat"""
    queryset = GammeCabine.objects.all().order_by('internal_id')
    serializer_class = GammeCabineSerializer
    permission_classes = [IsEditorOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['boat']


class VarianteGammeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing variante gammes (read-only), filterable by gamme"""
    queryset = VarianteGamme.objects.all().order_by('internal_id')
    serializer_class = VarianteGammeSerializer
    permission_classes = [IsEditorOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['gamme']


class CabineViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing cabines (read-only), filterable by variante_gamme"""
    queryset = Cabine.objects.all().order_by('internal_id')
    serializer_class = CabineSerializer
    permission_classes = [IsEditorOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['variante_gamme']


class LigneViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing lignes (read-only)"""
    queryset = Ligne.objects.all().order_by('name')
    serializer_class = LigneSerializer
    permission_classes = [IsEditorOrAdmin]


class PosteViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing postes (read-only), filterable by ligne"""
    queryset = Poste.objects.all().order_by('internal_id')
    serializer_class = PosteSerializer
    permission_classes = [IsEditorOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ligne']
