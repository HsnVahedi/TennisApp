from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Determine if the environment is production
# IS_PROD = os.getenv('IS_PROD', 'False').lower() in ('true', '1', 't')

# Set the default Django settings module for the 'celery' program.
settings_module = 'artoftennis.settings.production' if os.getenv('IS_PROD') else 'artoftennis.settings.dev'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

app = Celery('artoftennis')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
