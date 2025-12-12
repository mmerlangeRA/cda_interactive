# Development Container for Django React Project

This directory contains configuration files for setting up a consistent development environment using VS Code's Remote - Containers extension.

## Prerequisites

1. [Docker](https://www.docker.com/products/docker-desktop) installed on your machine
2. [Visual Studio Code](https://code.visualstudio.com/) installed on your machine
3. [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) installed in VS Code

## Getting Started

1. Open this project in VS Code
2. When prompted, click "Reopen in Container" or run the "Remote-Containers: Reopen in Container" command from the Command Palette (F1)
3. VS Code will build the container and set up the development environment (this may take a few minutes the first time)

## Development Environment

The development container includes:

- Python 3.11 with Django and other dependencies
- Node.js 18.x for frontend development
- PostgreSQL 15 database
- Development tools (git, pylint, autopep8, etc.)
- VS Code extensions for Python, TypeScript, and Django development

## Running the Application

### Backend (Django)

From the terminal inside the container:

```bash
cd backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

- **Swagger UI**: [](http://localhost:8000/swagger/)<http://localhost:8000/swagger/>

- **ReDoc**: [](http://localhost:8000/redoc/)<http://localhost:8000/redoc/>

superadmin

```
root/ cdainter!
```

### Frontend (React)

From another terminal inside the container:

```bash
cd frontend
sudo npm run build:dev
```

## Database

The PostgreSQL database is available with .env.dev

You can connect to it using tools like pgAdmin or the command line:

```bash
psql -h db -U postgres
```

## Environment Variables

The development environment automatically loads all environment variables from the `.env_python` file using the `env_file` directive in the `docker-compose.yml` file. This means any variables defined in `.env_python` will be available in the container.

Additional environment variables or overrides can be specified in the `environment` section of the `docker-compose.yml` file.

If you need to add or modify environment variables, you can:

1. Add them to the `.env_python` file (preferred for most variables)
2. Edit the `environment` section in the `docker-compose.yml` file (for container-specific variables or overrides)
3. Rebuild the container using the "Remote-Containers: Rebuild Container" command

## Customization

- Additional VS Code extensions can be added in the `devcontainer.json` file
- Additional system packages can be installed in the `Dockerfile`
- Database configuration can be modified in the `docker-compose.yml` file
