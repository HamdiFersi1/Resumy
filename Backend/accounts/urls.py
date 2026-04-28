# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenBlacklistView,    
)

from accounts.views import ActivateAccount, AuthViewSet, HRTeamViewSet, DashboardViewSet, PasswordEditViewSet, PasswordViewSet

router = DefaultRouter()
# signup, login, logout
router.register(r'', AuthViewSet,    basename='authentication')
router.register(r'hr-team', HRTeamViewSet, basename='hr-team')  # HR listing
router.register(r"dashboarduser", DashboardViewSet, basename="dashboarduser")
router.register(r'password', PasswordViewSet, basename='password')
router.register(r'password-change', PasswordEditViewSet, basename='password-change')



urlpatterns = [
    # /accounts/           → AuthViewSet routes (signup/, login/, logout/)
    # /accounts/hr-team/   → HRTeamViewSet
    path('', include(router.urls)),

    # POST /accounts/refresh/   → rotate refresh & return new access (+ refresh if ROTATE_REFRESH_TOKENS=True)
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # POST /accounts/blacklist/ → blacklist (revoke) a refresh token
    path('blacklist/', TokenBlacklistView.as_view(),  name='token_blacklist'),

    # optional: browsable-API login/logout
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),


     path('activate/<slug:uidb64>/<slug:token>/',   # matches /account/activate/<uid>/<token>/
         ActivateAccount.as_view(),
         name='activate-account'),

]
