from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-0ch*ij0_yqdydhmnk=zy(=!g$$io&2+fig581^bkn12pv#zfv$"

# SECURITY WARNING: define the correct hosts in production!
ALLOWED_HOSTS = ["*"]



ALLOWED_HOSTS = ["*"]

# Remove CSRF Middleware in dev environment
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    # "django.middleware.csrf.CsrfViewMiddleware",  # Comment or remove CSRF middleware in dev
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "wagtail.contrib.redirects.middleware.RedirectMiddleware",
]

# CORS and CSRF settings
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins in dev
CSRF_TRUSTED_ORIGINS = ['http://localhost:3000']  # Allow your frontend origin

# Disable CSRF cookies in development (optional but safe in dev)
CSRF_COOKIE_SECURE = False

# CORS_ALLOW_ALL_ORIGINS = True
# CSRF_TRUSTED_ORIGINS = ['http://localhost:3000']  # Include other domains if needed

# # Completely disable CSRF (use with caution)
# CSRF_COOKIE_SECURE = False

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv('DATABASE_NAME'),
        "USER": os.getenv('DATABASE_USER'),
        "PASSWORD": os.getenv('DATABASE_PASSWORD'),
        "HOST": os.getenv('DATABASE_HOST'),
        "PORT": os.getenv('DATABASE_PORT', '5432'),
        # "OPTIONS": {
        #     "sslmode": "require",
        # },
    }
}

# Default storage settings, with the staticfiles storage updated.
# See https://docs.djangoproject.com/en/4.2/ref/settings/#std-setting-STORAGES
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    # ManifestStaticFilesStorage is recommended in production, to prevent
    # outdated JavaScript / CSS assets being served from cache
    # (e.g. after a Wagtail upgrade).
    # See https://docs.djangoproject.com/en/4.2/ref/contrib/staticfiles/#manifeststaticfilesstorage
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.ManifestStaticFilesStorage",
    },
}


##########################
######### Celery #########
##########################

CELERY_BROKER_URL = 'redis://redis:6379/0'
CELERY_RESULT_BACKEND = 'redis://redis:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'


##########################
######### Celery #########
##########################

MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = "/media/"


try:
    from .local import *
except ImportError:
    pass
