#!/bin/bash
set -e

echo "${0}: running migrations."
python3 manage.py migrate

echo "${0}: collecting static files."
python3 manage.py collectstatic --no-input

echo "${0}: starting Celery."
/home/django/.local/bin/celery -A artoftennis worker -l info