from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        READER = 'READER', 'Reader'
        EDITOR = 'EDITOR', 'Editor'
        ADMIN = 'ADMIN', 'Admin'

    base_role = Role.READER

    role = models.CharField(max_length=50, choices=Role.choices, default=base_role)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.role = self.base_role
        return super().save(*args, **kwargs)
