from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Task
from .serializers import TaskSerializer

class TaskList(generics.ListAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer