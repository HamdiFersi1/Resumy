from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .tokens import email_confirmation_token

import json
from applications.models import JobApplication, Interview
from accounts.models import Notification
from jobs.models import JobPosting

User = get_user_model()


# ─────────────── Signup Serializer ───────────────────────

# ─────────────── Signup Serializer (with activation) ───────────────────────
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

class SignupSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default="user")

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "password",
            "password2",
            "is_active",     # read-only; will be False until activation
        ]
        read_only_fields = ["is_active"]

    # ---------------- password confirmation + strength -------------------
    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        validate_password(attrs["password"])
        return attrs

    # ---------------- create user & send activation link -----------------
    def create(self, validated_data):
        validated_data.pop("password2", None)

        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        user.role = validated_data.get("role", "user")
        user.is_active = False                # <-- user must confirm e-mail
        user.save()

        # 1) build activation link
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_confirmation_token.make_token(user)
        
        base = settings.FRONTEND_BASE_URL.rstrip("/")
        activation_link = f"{base}/activate/{uid}/{token}/"

        # 2) e-mail it to the user
        send_mail(
            subject="Activate your account",
            message=(
                f"Hello {user.first_name},\n\n"
                f"Welcome! Please click the link below to activate your account:\n"
                f"{activation_link}\n\n"
                f"If you didn’t request this, just ignore this e-mail.\n\n"
                f"Thanks,\nThe Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return user



# ─────────────── Login Serializer ───────────────────────

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_active:
            raise serializers.ValidationError("Account not activated. Check your email.")
        data['user'] = user
        return data


# ─────────────── HR Creation by Admin ───────────────────────

class HRCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password2 = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'role', 'password', 'password2')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'read_only': True},
        }

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')
        if password2 and password != password2:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        validate_password(password)
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        user.role = 'hr'
        user.is_active = True
        user.save()
        return user


# ─────────────── HR List Serializer ───────────────────────

class HRUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name')
        read_only_fields = fields



# ─────────────── Nested Summaries ───────────────────────

class ApplicationSummarySerializer(serializers.ModelSerializer):
    applicant = serializers.SerializerMethodField(read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    decided_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = JobApplication
        fields = ("id", "applicant", "job_title", "status", "decided_at")

    def get_applicant(self, obj):
        full = f"{obj.applicant.first_name} {obj.applicant.last_name}".strip()
        return full or obj.applicant.get_username()


class InterviewSummarySerializer(serializers.ModelSerializer):
    applicant = serializers.SerializerMethodField(read_only=True)
    application_id = serializers.IntegerField(source="application.id", read_only=True)
    job_title = serializers.CharField(source="application.job.title", read_only=True)

    class Meta:
        model = Interview
        fields = ("id", "applicant", "application_id", "job_title", "scheduled_at")

    def get_applicant(self, obj):
        user = obj.application.applicant
        full = f"{user.first_name} {user.last_name}".strip()
        return full or user.get_username()


# ─────────────── HR Detail with Activity ───────────────────────

class JobPostingSummarySerializer(serializers.ModelSerializer):
    application_count = serializers.SerializerMethodField()
    popularity = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = (
            "id", "title", "location", "contract_type",
            "application_deadline", "created_at",
            "application_count", "popularity"
        )

    def get_application_count(self, job):
        return JobApplication.objects.filter(job=job).count()

    def get_popularity(self, job):
        total = JobApplication.objects.count()
        job_apps = JobApplication.objects.filter(job=job).count()
        return round((job_apps / total) * 100, 2) if total > 0 else 0.0


class HRUserDetailSerializer(serializers.ModelSerializer):
    accepted_applications = serializers.SerializerMethodField()
    declined_applications = serializers.SerializerMethodField()
    interviews = serializers.SerializerMethodField()
    job_postings = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "email", "username", "first_name", "last_name",
            "accepted_applications", "declined_applications",
            "interviews", "job_postings",
        )
        read_only_fields = fields

    def get_accepted_applications(self, hr_user):
        qs = JobApplication.objects.filter(
            handled_by=hr_user, status="accepted"
        ).order_by("-decided_at")
        return ApplicationSummarySerializer(qs, many=True).data

    def get_declined_applications(self, hr_user):
        qs = JobApplication.objects.filter(
            handled_by=hr_user, status="declined"
        ).order_by("-decided_at")
        return ApplicationSummarySerializer(qs, many=True).data

    def get_interviews(self, hr_user):
        qs = Interview.objects.filter(
            application__handled_by=hr_user
        ).order_by("-scheduled_at")
        return InterviewSummarySerializer(qs, many=True).data

    def get_job_postings(self, hr_user):
        qs = JobPosting.objects.filter(created_by=hr_user).order_by("-created_at")
        return JobPostingSummarySerializer(qs, many=True).data


# ─────────────── Notifications & Profile ───────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "is_read", "created_at"]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "resume")
        read_only_fields = ("id", "email")




User = get_user_model()

class PasswordChangeSerializer(serializers.Serializer):
    old_password      = serializers.CharField(write_only=True)
    new_password      = serializers.CharField(write_only=True, min_length=8)
    confirm_password  = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        user = self.context["request"].user

        # 1) old password correct?
        if not user.check_password(attrs["old_password"]):
            raise serializers.ValidationError({"old_password": "Wrong password."})

        # 2) new & confirm match
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        # 3) strength check
        validate_password(attrs["new_password"], user=user)
        return attrs