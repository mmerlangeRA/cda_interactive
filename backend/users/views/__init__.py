# Views package for users app
from django.shortcuts import render


def index(request):
    """Render the main index.html template."""
    return render(request, 'index.html')
