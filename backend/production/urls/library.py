from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.library import ImageTagViewSet, ImageLibraryViewSet

router = DefaultRouter()
router.register(r'tags', ImageTagViewSet, basename='imagetag')
router.register(r'images', ImageLibraryViewSet, basename='imagelibrary')

urlpatterns = [
    path('', include(router.urls)),
]
