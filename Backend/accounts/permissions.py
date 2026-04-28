# accounts/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS


class RoleMethodPermission(BasePermission):
    """
    Restrict only the HTTP methods in `restricted_methods`
    to users whose role is in `allowed_roles` (or staff).
    Any method *not* in `restricted_methods` is open to everyone.
    """
    allowed_roles: list[str] = []
    restricted_methods: list[str] = []

    def has_permission(self, request, view):
        # If this request.method isn’t in restricted_methods, allow it
        if request.method not in self.restricted_methods:
            return True

        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (
                user.is_staff
                or getattr(user, 'role', None) in self.allowed_roles
            )
        )


class HRGetPermission(RoleMethodPermission):
    allowed_roles = ['hr']
    restricted_methods = list(SAFE_METHODS)  

class HRPostPermission(RoleMethodPermission):
    allowed_roles = ['hr']
    restricted_methods = ['POST']


class HRGetPostPermission(RoleMethodPermission):
    allowed_roles = ['hr']
    restricted_methods = ['GET', 'POST']


class IsSuperUser(BasePermission):
    """
    Allows access only to Django superusers.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )
