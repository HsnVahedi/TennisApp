from django.conf import settings
from django.urls import include, path, re_path
from django.contrib import admin

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

from search import views as search_views

from .views import (
    DataAPIView, ProtectedDataAPIView,
    UserInfo, LoginView, after_social_login, BatchImageUploadApiView,
    CreateTrimView
) 
from home.views import ExportTrimView, TrimVideoView


urlpatterns = [
    path('admin/pages/<int:page_id>/extract_trim/', ExportTrimView.as_view(), name='trim_export'),
    path('admin/pages/<int:page_id>/trim_video/', TrimVideoView.as_view(), name='trim_video'),
    path("django-admin/", admin.site.urls),
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),
    path("search/", search_views.search, name="search"),
    path('auth/', include('social_django.urls', namespace='social')),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path('accounts/login/', LoginView.as_view(), name='login'),
    path('user-info/', UserInfo.as_view(), name='user_info'),
    path('data/', DataAPIView.as_view(), name='data_api'),
    path('protected-data/', ProtectedDataAPIView.as_view(), name='protected_data_api'),
    path('after_social_login/', after_social_login, name='after_social_login'),
    path('batch-image-upload/<int:trim_id>/<int:batch_id>', BatchImageUploadApiView.as_view(), name='batch_image_upload'),
    path('create-trim/', CreateTrimView.as_view(), name='create_trim'),
]


if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    # Serve static and media files from development server
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = urlpatterns + [
    # For anything not caught by a more specific rule above, hand over to
    # Wagtail's page serving mechanism. This should be the last pattern in
    # the list:
    path("", include(wagtail_urls)),
    # Alternatively, if you want Wagtail pages to be served from a subpath
    # of your site, rather than the site root:
    #    path("pages/", include(wagtail_urls)),
]
