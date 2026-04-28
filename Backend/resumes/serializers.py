from rest_framework import serializers
from .models import UploadedResume, ParsedResume, ScoredResume
from django.urls import path, include
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets


class UploadedResumeSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = UploadedResume
        fields = ['id', 'file', 'uploaded_at', 'uploaded_by']

class ParsedResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParsedResume
        fields = '__all__'

class ScoredResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoredResume
        fields = '__all__'



