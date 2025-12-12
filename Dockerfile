# Use an official Python runtime as a parent image with Node.js
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# NOTE: DEBUG, SECRET_KEY, ALLOWED_HOSTS, and DATABASE settings 
# should be provided by Railway environment variables at runtime

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

# Set up static files - copy frontend build to backend/static
RUN mkdir -p backend/static && \
    echo "Copying frontend build files..." && \
    cp -rv frontend/dist/* backend/static/ && \
    echo "Verifying copied files:" && \
    ls -la backend/static/

# Add mime types to /etc/mime.types
RUN echo "application/javascript    js mjs" >> /etc/mime.types && \
    echo "text/css                 css" >> /etc/mime.types

# Expose port
EXPOSE 80

# Set Python path to include backend
ENV PYTHONPATH=/app/backend

# Run migrations and start application
CMD ["sh", "-c", "cd backend && python manage.py migrate && gunicorn --bind 0.0.0.0:80 --workers 3 cda_interactive.wsgi:application"]
