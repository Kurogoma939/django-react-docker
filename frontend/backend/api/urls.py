from django.urls import path
from .views import TaskList

urlpatterns = [
    path('task/', TaskList.as_view())
]