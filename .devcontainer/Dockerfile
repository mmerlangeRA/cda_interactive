FROM python:3.11-slim

# Avoid warnings by switching to noninteractive
ENV DEBIAN_FRONTEND=noninteractive

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies including Node.js, PostgreSQL client, and GDAL for PostGIS
RUN apt-get update && apt-get install -y \
    gcc \
    git \
    curl \
    libpq-dev \
    sudo \
    vim \
    gdal-bin \
    libgdal-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user with sudo access
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set up Python development tools
RUN pip install --upgrade pip \
    && pip install pylint autopep8 black flake8 mypy

# Install global Node.js packages
RUN npm install -g npm@latest

# Create workspace directory and set permissions
WORKDIR /workspace
RUN chown -R $USERNAME:$USERNAME /workspace

# Switch to non-root user
USER $USERNAME

# Set up Python path
ENV PYTHONPATH=/workspace/backend

# Switch back to dialog for any ad-hoc use of apt-get
ENV DEBIAN_FRONTEND=dialog

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r ./requirements.txt
