from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from users.views import index

# Swagger/OpenAPI schema configuration
schema_view = get_schema_view(
    openapi.Info(
        title="CDA Interactive API",
        default_version='v1',
        description="API documentation for CDA Interactive platform",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@cdainteractive.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Swagger/OpenAPI documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Authentication API endpoints
    path('api/auth/', include('users.urls.auth')),
    
    # Production API endpoints
    path('api/', include('production.urls.sheets')),
]

# Serve media files in development (must be before catch-all route)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all route: serve index.html for all other routes (for React Router)
# This MUST be last so it doesn't intercept other routes
urlpatterns += [
    re_path(r'^.*$', index, name='index'),
]
