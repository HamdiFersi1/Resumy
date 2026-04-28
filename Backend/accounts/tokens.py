from django.contrib.auth.tokens import PasswordResetTokenGenerator


class EmailConfirmationTokenGenerator(PasswordResetTokenGenerator):
    """
    Uses the same logic as PasswordResetTokenGenerator but for email activation.
    """
    pass


email_confirmation_token = EmailConfirmationTokenGenerator()
