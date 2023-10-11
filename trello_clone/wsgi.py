"""
WSGI config for trello_clone project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trello_clone.settings')
os.environ.setdefault('PYTHON_VERSION', '2.7.15')

application = get_wsgi_application()
