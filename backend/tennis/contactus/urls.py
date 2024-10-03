from django.urls import path
from contactus.views import ContactFormAPIView

urlpatterns = [
    path('contactus-form/', ContactFormAPIView.as_view(), name='contact_form'),
]