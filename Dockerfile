# Use an official Python runtime as a parent image with Node.js
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_DEBUG=True
ENV DJANGO_SECRET_KEY=temp-secret-key-for-build

# Set work directory
WORKDIR /app

# Install system dependencies including Node.js and PostgreSQL client
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    libpq-dev \
    sudo \
    vim \
    gdal-bin \
    libgdal-dev \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend package files
COPY frontend/package*.json frontend/
WORKDIR /app/frontend

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY frontend/ .

# Build frontend
RUN npm run build && \
    echo "Vite build output:" && \
    ls -la dist/assets/

# Return to app directory
WORKDIR /app

# Copy rest of the project
COPY . .

# Set up static files
RUN mkdir -p backend/users/static/frontend/assets && \
    echo "Copying frontend build files..." && \
    cp -rv frontend/dist/assets/* backend/users/static/frontend/assets/ && \
    echo "Verifying copied files:" && \
    ls -la backend/users/static/frontend/assets/

# Collect static files
RUN cd backend && \
    DJANGO_SETTINGS_MODULE=cda_interactive.settings python manage.py collectstatic --noinput --verbosity 2 && \

    # Add mime types to /etc/mime.types
    RUN echo "application/javascript    js mjs" >> /etc/mime.types && \
    echo "text/css                 css" >> /etc/mime.types

# Expose port
EXPOSE 80

# Set Python path to include backend
ENV PYTHONPATH=/app/backend

# Run migrations and start application
CMD ["sh", "-c", "cd backend && python manage.py migrate && printenv && gunicorn --bind 0.0.0.0:80 --workers 3 video_networks.wsgi:application"]