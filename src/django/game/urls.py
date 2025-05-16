from django.urls import path,include
from .views import *

app_name = 'user'
urlpatterns = [
    path('game/', PlayView.as_view(), name='play'),
]