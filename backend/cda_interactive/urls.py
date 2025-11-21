from django.contrib import admin
from django.urls import path, re_path
from users.views import (
    index,
    get_csrf_token,
    login_view,
    logout_view,
    check_auth,
    refresh_token
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication API endpoints
    path('api/auth/csrf/', get_csrf_token, name='csrf-token'),
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/logout/', logout_view, name='logout'),
    path('api/auth/check/', check_auth, name='check-auth'),
    path('api/auth/refresh/', refresh_token, name='refresh-token'),
    
    # Catch-all route: serve index.html for all other routes (for React Router)
    re_path(r'^.*$', index, name='index'),
]
