from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Make email unique so we can use it for login
    email = models.EmailField(unique=True)
    # Add mobile number field
    mobile_number = models.CharField(max_length=15, unique=True, blank=True, null=True)

    def __str__(self):
        return self.username
