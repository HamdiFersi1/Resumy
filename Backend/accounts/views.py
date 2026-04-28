from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from accounts.models import Notification
from job_matcher import settings 
from .permissions import IsSuperUser
from .serializers import (
    HRUserDetailSerializer, HRUserSerializer, PasswordChangeSerializer, User,
    SignupSerializer, LoginSerializer, HRCreateSerializer,
    ProfileSerializer, NotificationSerializer
)
from applications.models import JobApplication
from jobs.models import JobPosting
from django.db.models.fields.files import FieldFile

from rest_framework.views import APIView
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.shortcuts import get_object_or_404
from .tokens import email_confirmation_token

from django.utils.crypto import get_random_string
from django.core.mail import send_mail


# Local helper function
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='signup')
    def signup(self, request):
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=400)

        user = serializer.save()
        tokens = get_tokens_for_user(user)

        return Response({
            'refresh': tokens['refresh'],
            'access': tokens['access'],
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            }
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response({
            'refresh': tokens['refresh'],
            'access': tokens['access'],
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            }
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='logout')
    def logout(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({"detail": "Refresh token required."}, status=400)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({"detail": "Invalid or expired token."}, status=400)
        return Response(status=status.HTTP_205_RESET_CONTENT)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='create-hr')
    def create_hr(self, request):
        generated_password = get_random_string(length=12)
        request_data = request.data.copy()
        request_data['password'] = generated_password
        request_data['password2'] = generated_password

        serializer = HRCreateSerializer(data=request_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = serializer.save()

        send_mail(
            subject="Welcome to the Platform - HR Account Created",
            message=f"""
                Hello {user.first_name},

                Your HR account has been successfully created.

                Here are your login credentials:
                Email: {user.email}
                Password: {generated_password}

                Please log in and change your password immediately from your account settings.

                Regards,
                Admin Team
                """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        tokens = get_tokens_for_user(user)

        return Response({
            'refresh': tokens['refresh'],
            'access': tokens['access'],
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            }
        }, status=status.HTTP_201_CREATED)


class HRTeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(role="hr")
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return HRUserDetailSerializer
        return HRUserSerializer


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        profile_fields = [user.first_name, user.last_name, user.resume]
        completeness = int(sum(1 for f in profile_fields if f) / len(profile_fields) * 100)

        apps = JobApplication.objects.filter(applicant=user).select_related("job", "parsed_resume__uploaded_resume")
        applications_sent = apps.count()
        interviews_scheduled = apps.filter(status="interview_scheduled").count()

        seen, used_resumes = set(), []
        for app in apps:
            pr = app.parsed_resume
            if pr.id in seen:
                continue
            seen.add(pr.id)
            filename = getattr(pr, "original_filename", None) or str(pr.uploaded_resume)
            file_field = None
            for f in pr.uploaded_resume._meta.get_fields():
                val = getattr(pr.uploaded_resume, f.name, None)
                if isinstance(val, FieldFile) and getattr(val, "url", None):
                    file_field = val
                    break
            url = request.build_absolute_uri(file_field.url) if file_field else None
            used_resumes.append({
                "parsed_resume_id": pr.id,
                "filename": filename,
                "url": url,
                "applied_at": app.applied_at.isoformat(),
            })

        applied_jobs = [
            {
                "application_id": app.id,
                "job_id": app.job.id,
                "title": app.job.title,
                "company": app.job.company_name,
                "location": app.job.location,
                "applied_at": app.applied_at.isoformat(),
            }
            for app in apps
        ]

        applied_ids = [j["job_id"] for j in applied_jobs]
        rec_qs = JobPosting.objects.exclude(id__in=applied_ids).order_by("-created_at")[:5]
        recommended_jobs = [
            {
                "id": j.id,
                "title": j.title,
                "company": j.company_name,
                "location": j.location,
            }
            for j in rec_qs
        ]

        return Response({
            "profile_completeness": completeness,
            "applications_sent": applications_sent,
            "interviews_scheduled": interviews_scheduled,
            "used_resumes": used_resumes,
            "applied_jobs": applied_jobs,
            "recommended_jobs": recommended_jobs,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get", "patch"], url_path="profile")
    def profile(self, request):
        user = request.user
        if request.method == "GET":
            serializer = ProfileSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = ProfileSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="notifications")
    def notifications(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by("-created_at")[:5]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ActivateAccount(APIView):
    permission_classes = []

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_object_or_404(User, pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid activation link."}, status=status.HTTP_400_BAD_REQUEST)

        if email_confirmation_token.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"detail": "Account activated."}, status=status.HTTP_200_OK)

        return Response({"detail": "Activation link expired or invalid."}, status=status.HTTP_400_BAD_REQUEST)



User = get_user_model()

class PasswordViewSet(viewsets.GenericViewSet):
    def list(self, request):
        return Response({"detail": "Password endpoint root."})
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='forgot-password')
    def forgot_password(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No user found with this email."}, status=status.HTTP_404_NOT_FOUND)

        # Generate a secure random password
        new_password = get_random_string(length=12)
        user.set_password(new_password)
        user.save()

        # Send email with new password
        send_mail(
            subject="🔐 Your Password Has Been Reset",
             message=f"""
            Hello {user.first_name},

            Your password has been reset.

            Login Credentials:
            Email: {user.email}
            New Password: {new_password}

            Please log in and change your password immediately after logging in.

            Best regards,
            The Admin Team
            """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response({"message": "A new password has been sent to your email."}, status=status.HTTP_200_OK)
    


class PasswordEditViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"], url_path="change-password")
    def change_password(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        # set & save
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()

        return Response(
            {"message": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )