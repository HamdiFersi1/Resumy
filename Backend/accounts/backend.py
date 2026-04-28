# accounts/backend.py

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

UserModel = get_user_model()    


class EmailAuthBackend(ModelBackend):
    """
    Authenticate with e-mail (CustomUser.email) instead of username.
    """

    def authenticate(self, request, email=None, password=None, **kwargs):
        if email is None or password is None:
            return None
        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            return None
        return user if user.check_password(password) else None
