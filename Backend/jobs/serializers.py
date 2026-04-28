from rest_framework import serializers
from .models import JobPosting


class JobPostingSerializer(serializers.ModelSerializer):
    is_open = serializers.ReadOnlyField()

    class Meta:
        model = JobPosting
        fields = [
            "id",
            "title",
            "company_name",
            "job_description",
            "required_skills",
            "required_experience",
            "required_education",
            "category",
            "location",
            "experience_level",
            "contract_type",
            "application_start",
            "application_deadline",
            "created_at",
            "created_by",
            "is_open",
            "closed",           # ✅ Added field

        ]
        
        read_only_fields = ["created_at", "is_open", "created_by"]

from .models import FavoriteJob

class FavoriteJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteJob
        fields = ["id", "job", "added_at"]  # user is excluded (auto set)
        read_only_fields = ["id", "added_at"]