from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.sheets import SheetViewSet, SheetPageViewSet, InteractiveElementViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'sheets', SheetViewSet, basename='sheet')
router.register(r'pages', SheetPageViewSet, basename='sheetpage')
router.register(r'elements', InteractiveElementViewSet, basename='interactiveelement')

urlpatterns = router.urls
