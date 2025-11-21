from django.middleware.csrf import get_token
from django.contrib.auth import login, logout
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from ..serializers import LoginSerializer, UserSerializer


@swagger_auto_schema(
    method='get',
    operation_description="Get CSRF token for form submissions",
    responses={
        200: openapi.Response(
            description="CSRF token retrieved successfully",
            examples={
                'application/json': {
                    'csrfToken': 'your-csrf-token-here'
                }
            }
        )
    },
    tags=['Authentication']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Get CSRF token."""
    csrf_token = get_token(request)
    return Response({'csrfToken': csrf_token})


@swagger_auto_schema(
    method='post',
    operation_description="Authenticate user and return JWT tokens along with user data",
    request_body=LoginSerializer,
    responses={
        200: openapi.Response(
            description="Login successful",
            examples={
                'application/json': {
                    'message': 'Login successful',
                    'user': {
                        'id': 1,
                        'username': 'john_doe',
                        'email': 'john@example.com',
                        'first_name': 'John',
                        'last_name': 'Doe'
                    },
                    'access': 'eyJ0eXAiOiJKV1QiLCJhbGc...',
                    'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGc...',
                    'csrfToken': 'csrf-token-here'
                }
            }
        ),
        400: openapi.Response(
            description="Invalid credentials",
            examples={
                'application/json': {
                    'non_field_errors': ['Invalid username or password']
                }
            }
        )
    },
    tags=['Authentication']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login user and return JWT tokens."""
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Create session
        login(request, user)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Get new CSRF token for the authenticated session
        csrf_token = get_token(request)
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'csrfToken': csrf_token
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    operation_description="Logout the currently authenticated user and invalidate session",
    responses={
        200: openapi.Response(
            description="Logout successful",
            examples={
                'application/json': {
                    'message': 'Logout successful'
                }
            }
        ),
        401: openapi.Response(
            description="Unauthorized - User not authenticated"
        )
    },
    tags=['Authentication']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user."""
    logout(request)
    return Response({'message': 'Logout successful'})


@swagger_auto_schema(
    method='get',
    operation_description="Check if the current user is authenticated and return user details",
    responses={
        200: openapi.Response(
            description="User is authenticated",
            examples={
                'application/json': {
                    'isAuthenticated': True,
                    'user': {
                        'id': 1,
                        'username': 'john_doe',
                        'email': 'john@example.com',
                        'first_name': 'John',
                        'last_name': 'Doe'
                    }
                }
            }
        ),
        401: openapi.Response(
            description="Unauthorized - User not authenticated"
        )
    },
    tags=['Authentication']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    """Check if user is authenticated."""
    return Response({
        'isAuthenticated': True,
        'user': UserSerializer(request.user).data
    })


@swagger_auto_schema(
    method='post',
    operation_description="Refresh JWT access token using a valid refresh token",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['refresh'],
        properties={
            'refresh': openapi.Schema(
                type=openapi.TYPE_STRING,
                description='Valid JWT refresh token'
            )
        }
    ),
    responses={
        200: openapi.Response(
            description="Access token refreshed successfully",
            examples={
                'application/json': {
                    'access': 'eyJ0eXAiOiJKV1QiLCJhbGc...'
                }
            }
        ),
        400: openapi.Response(
            description="Refresh token not provided",
            examples={
                'application/json': {
                    'error': 'Refresh token is required'
                }
            }
        ),
        401: openapi.Response(
            description="Invalid or expired refresh token",
            examples={
                'application/json': {
                    'error': 'Invalid refresh token'
                }
            }
        )
    },
    tags=['Authentication']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh JWT access token."""
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response(
            {'error': 'Refresh token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            'access': str(refresh.access_token),
        })
    except Exception as e:
        return Response(
            {'error': 'Invalid refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )
