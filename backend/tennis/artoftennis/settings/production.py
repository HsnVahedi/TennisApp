from .base import *

DEBUG = True

APPLICATION_URL = os.environ["CONTAINER_APP_NAME"] + "." + os.environ["CONTAINER_APP_ENV_DNS_SUFFIX"]

ALLOWED_HOSTS = [
    APPLICATION_URL,
]

# CORS_ALLOWED_ORIGINS = [
#     "https://tennis-web-cb2im4wz-front.politeglacier-8f26ec6c.eastus.azurecontainerapps.io",
# ]
# TODO: It's not save to allow all origins. Need to change it to the actual frontend URL.
CORS_ALLOW_ALL_ORIGINS = True


CSRF_TRUSTED_ORIGINS = [
    "https://" + APPLICATION_URL,
]

SECRET_KEY = os.environ["SECRET_KEY"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv('DATABASE_NAME'),
        "USER": os.getenv('DATABASE_USER'),
        "PASSWORD": os.getenv('DATABASE_PASSWORD'),
        "HOST": os.getenv('DATABASE_HOST'),
        "PORT": os.getenv('DATABASE_PORT', '5432'),
        "OPTIONS": {
            "sslmode": "require",
        },
    }
}


AZURE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
AZURE_ACCOUNT_KEY = os.environ.get('AZURE_STORAGE_ACCOUNT_KEY')
AZURE_STATIC_CONTAINER = os.environ.get('AZURE_STATIC_CONTAINER_NAME')
AZURE_MEDIA_CONTAINER = os.environ.get('AZURE_MEDIA_CONTAINER_NAME')

print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
print('AZURE_STATIC_CONTAINER:', AZURE_STATIC_CONTAINER)
print('AZURE_MEDIA_CONTAINER:', AZURE_MEDIA_CONTAINER)
print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.azure_storage.AzureStorage",
        "OPTIONS": {
            "account_name": AZURE_ACCOUNT_NAME,
            "account_key": AZURE_ACCOUNT_KEY,
            "azure_container": AZURE_MEDIA_CONTAINER,
        },
    },
    "staticfiles": {
        "BACKEND": "storages.backends.azure_storage.AzureStorage",
        "OPTIONS": {
            "account_name": AZURE_ACCOUNT_NAME,
            "account_key": AZURE_ACCOUNT_KEY,
            "azure_container": AZURE_STATIC_CONTAINER,
        },
    },
}

# Static files (CSS, JavaScript, images)
# STATICFILES_STORAGE = 'storages.backends.azure_storage.AzureStorage'
AZURE_LOCATION = AZURE_STATIC_CONTAINER
STATIC_URL = f'https://{AZURE_ACCOUNT_NAME}.blob.core.windows.net/{AZURE_LOCATION}/'

# Media files
# DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
MEDIA_LOCATION = AZURE_MEDIA_CONTAINER
MEDIA_URL = f'https://{AZURE_ACCOUNT_NAME}.blob.core.windows.net/{MEDIA_LOCATION}/'
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# Media root is not needed because media files will be stored in Azure Blob Storage.


##########################
######### Celery #########
##########################

REDIS_HOST = os.environ.get('REDIS_HOST') 
REDIS_PORT = os.environ.get('REDIS_PORT') 
REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD')

# CELERY_BROKER_URL = f'rediss://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0?ssl_cert_reqs=required'
CELERY_BROKER_URL = f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0'
CELERY_RESULT_BACKEND = CELERY_BROKER_URL

CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True


# Optional: If using django-celery-beat
# INSTALLED_APPS += ['django_celery_beat']

# Enable SSL if required by your Redis instance
# CELERY_BROKER_USE_SSL = {
#     'ssl_cert_reqs': 'required',
#     'ssl_ca_certs': '/etc/ssl/certs/ca-certificates.crt',  # adjust to your system
# }

##########################
######### Celery #########
##########################


try:
    from .local import *
except ImportError:
    pass
