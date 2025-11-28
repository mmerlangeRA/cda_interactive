from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.references import ReferenceValueViewSet

router = DefaultRouter()
router.register(r'references', ReferenceValueViewSet, basename='reference')

urlpatterns = [
    path('', include(router.urls)),
]
