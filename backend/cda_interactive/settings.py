import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env.dev (only if file exists - for local development)
env_file = BASE_DIR / '../.env.dev'
if env_file.exists():
    print("loading .env.dev")
    load_dotenv(env_file)
else:
    print("no local .env.dev, moving on...")

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

SECRET_KEY = os.getenv('SECRET_KEY', '')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set!")
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')
RAILWAY_STATIC_URL = os.getenv('RAILWAY_STATIC_URL')
print("RAILWAY_STATIC_URL",RAILWAY_STATIC_URL)
if RAILWAY_STATIC_URL:
    ALLOWED_HOSTS.append(RAILWAY_STATIC_URL)


print(ALLOWED_HOSTS)
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_yasg',
    'django_filters',
    'users',
    'production',
    'whitenoise.runserver_nostatic',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cda_interactive.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cda_interactive.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.config(conn_max_age=600, ssl_require=True)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DATABASE_NAME'),
            'USER': os.getenv('DATABASE_USER'),
            'PASSWORD': os.getenv('DATABASE_PASSWORD'),
            'HOST': os.getenv('DATABASE_HOST'),
            'PORT': os.getenv('DATABASE_PORT'),
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'users.User'


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images from frontend build)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/static/'
# STATIC_ROOT: where whitenoise serves static files from (already contains frontend build from Docker)
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
# STATICFILES_DIRS: source directories to collect from (empty since we copy directly to STATIC_ROOT in Docker)
STATICFILES_DIRS = []


# Media files (user uploaded content - separate from static files!)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Simple JWT settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://192.168.1.23:8000"
]

# For debugging: Allow all origins to access media files
# WARNING: Remove this in production!
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = False  # Keep False for security, but media-debug endpoint has its own CORS headers
    
CORS_ALLOW_CREDENTIALS = True

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://192.168.1.23:8000"
]
if RAILWAY_STATIC_URL:
    CSRF_TRUSTED_ORIGINS.append(RAILWAY_STATIC_URL)


CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_SAMESITE = 'Lax'
