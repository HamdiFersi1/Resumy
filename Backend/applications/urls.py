from rest_framework import routers
from applications.views import (
    FeedbackViewSet,
    JobApplicationViewSet,
    ApplicationViewSet,
    ApplicationStatsViewSet,
    ApplicationAnalyticsViewSet,
    JobApplicationDetailViewSet,
    InterviewViewSet,  
    DecisionViewSet,
    FilteredApplicationViewSet,
    PublicApplicationViewSet,
    ReportViewSet,
    PopularityReportViewSet,
    UserInterviewViewSet,
)
from django.urls import path, include

router = routers.DefaultRouter()

router.register(r"JobApplication", JobApplicationViewSet,
                basename="applications")
router.register(r"ApplicationViewSet", ApplicationViewSet,
                basename="ApplicationViewSet")
router.register(r"stats", ApplicationStatsViewSet,
                basename="applicationStats")
router.register(r"analytics", ApplicationAnalyticsViewSet,
                basename="applicationAnalytics")
router.register(r"detail", JobApplicationDetailViewSet,
                basename="JobApplicationDetailViewSet")
# Register the InterviewViewSet with the router
router.register(r"interviews", InterviewViewSet,
                basename="interviews")
router.register(r"decisions", DecisionViewSet, basename="decisions")
router.register(r"decisionsleaderboard", FilteredApplicationViewSet,basename="filtered_decisions")
router.register(r"reports", ReportViewSet, basename="reports")
router.register(r"jobreports", PopularityReportViewSet, basename="job_reports")

# user notif
router.register(r'user-interviews', UserInterviewViewSet,
                basename='user-interviews')
router.register(r"public-applications", PublicApplicationViewSet,
                basename="public-applications")

# MLops 
router.register(r"feedback", FeedbackViewSet, basename="feedback")


urlpatterns = [
    path("", include(router.urls)),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
]
