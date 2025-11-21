from django.urls import path
from ..views.auth import (
    get_csrf_token,
    login_view,
    logout_view,
    check_auth,
    refresh_token
)

urlpatterns = [
    path('csrf/', get_csrf_token, name='csrf-token'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('check/', check_auth, name='check-auth'),
    path('refresh/', refresh_token, name='refresh-token'),
]
