from rest_framework import permissions


class IsEditorOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow EDITOR or ADMIN users to create, update, or delete.
    All authenticated users can read (GET).
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to EDITOR or ADMIN
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['EDITOR', 'ADMIN']
        )
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to EDITOR or ADMIN
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['EDITOR', 'ADMIN']
        )


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow ADMIN users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )
    
    def has_object_permission(self, request, view, obj):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )
