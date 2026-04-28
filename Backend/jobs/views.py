# src/applications/views.py

from django.utils import timezone
from django.db import models

from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend
from django_filters import FilterSet, CharFilter, BooleanFilter

from accounts.permissions import HRPostPermission
from .models import FavoriteJob, JobPosting
from .serializers import FavoriteJobSerializer, JobPostingSerializer


class JobPostingFilter(FilterSet):
    category = CharFilter(field_name="category", lookup_expr="istartswith")
    location = CharFilter(field_name="location", lookup_expr="istartswith")
    experience_level = CharFilter(field_name="experience_level", lookup_expr="istartswith")
    contract_type = CharFilter(field_name="contract_type", lookup_expr="iexact")
    open = BooleanFilter(method="filter_open", label="Only open jobs")

    def filter_open(self, qs, name, value):
        if value:
            today = timezone.now().date()
            qs = qs.filter(
                closed=False,
                application_start__lte=today
            ).filter(
                models.Q(application_deadline__isnull=True) |
                models.Q(application_deadline__gte=today)
            )
        return qs

    class Meta:
        model = JobPosting
        fields = ["category", "location", "experience_level", "contract_type", "open"]


class JobPostingViewSet(viewsets.ModelViewSet):
    """
    All CRUD for job postings is restricted to HR users.
    """
    queryset = JobPosting.objects.all().order_by("-created_at")
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated, HRPostPermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = JobPostingFilter
    search_fields = ["title", "company_name"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        HR users see everything; public users see only open and not manually closed jobs.
        """
        qs = super().get_queryset()
        user = self.request.user

        if not (user.is_authenticated and (user.is_staff or getattr(user, "role", None) == "hr")):
            today = timezone.now().date()
            qs = qs.filter(
                closed=False,
                application_start__lte=today
            ).filter(
                models.Q(application_deadline__isnull=True) |
                models.Q(application_deadline__gte=today)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="close")
    def close_job(self, request, pk=None):
        job = self.get_object()
        if job.closed:
            return Response({"detail": "Job is already closed."}, status=status.HTTP_400_BAD_REQUEST)
        job.closed = True
        job.save(update_fields=["closed"])
        return Response({"detail": "Job marked as closed."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="reopen")
    def reopen_job(self, request, pk=None):
        job = self.get_object()
        if not job.closed:
            return Response({"detail": "Job is already open."}, status=status.HTTP_400_BAD_REQUEST)
        job.closed = False
        job.save(update_fields=["closed"])
        return Response({"detail": "Job reopened."}, status=status.HTTP_200_OK)


class FavoriteJobViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FavoriteJob.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
