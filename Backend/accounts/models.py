# accounts/models.py
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import (
    AbstractBaseUser, PermissionsMixin, BaseUserManager
)

from resumes.models import UploadedResume
from jobs.models    import JobPosting

from job_matcher import settings


class CustomUserManager(BaseUserManager):
    
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(
            username=username,
            email=email,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username, email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email= models.EmailField(unique=True)
    username= models.CharField(max_length=150, unique=True)
    date_joined= models.DateTimeField(default=timezone.now)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name  = models.CharField(max_length=30, blank=True, null=True)

    resume= models.ForeignKey(
        UploadedResume,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='owner'
    )

    jobs_posted = models.ManyToManyField(
        JobPosting,
        blank=True,
        related_name='posters'
    )
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('hr',   'HR Agent'),
    ]
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='user'
    )
    
        
    # Django admin flags
    is_active= models.BooleanField(default=True)
    is_staff= models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.username

    def get_full_name(self) -> str:
        """
        Return first_name + last_name, or fall back to username.
        """
        full = f"{self.first_name or ''} {self.last_name or ''}".strip()
        return full or self.username
    
    def get_short_name(self) -> str:
        """Return the short name for the user."""
        return self.first_name or self.username

# add company shit 


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To: {self.user.email} | {self.message}"
