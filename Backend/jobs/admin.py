from django.contrib import admin
from .models import JobPosting
# Register your models here.

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'location', 'created_at', 'created_by']
    
    readonly_fields = ['created_by']