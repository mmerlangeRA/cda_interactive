from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.sheets import (
    SheetViewSet, SheetPageViewSet, InteractiveElementViewSet,
    BoatViewSet, GammeCabineViewSet, VarianteGammeViewSet,
    CabineViewSet, LigneViewSet, PosteViewSet
)

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'sheets', SheetViewSet, basename='sheet')
router.register(r'pages', SheetPageViewSet, basename='sheetpage')
router.register(r'elements', InteractiveElementViewSet, basename='interactiveelement')

# Filter entity endpoints
router.register(r'boats', BoatViewSet, basename='boat')
router.register(r'gamme-cabines', GammeCabineViewSet, basename='gammecabine')
router.register(r'variante-gammes', VarianteGammeViewSet, basename='variantegamme')
router.register(r'cabines', CabineViewSet, basename='cabine')
router.register(r'lignes', LigneViewSet, basename='ligne')
router.register(r'postes', PosteViewSet, basename='poste')

urlpatterns = router.urls
