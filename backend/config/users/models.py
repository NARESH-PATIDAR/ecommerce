from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'CUSTOMER', 'Customer'
        SELLER = 'SELLER', 'Seller'

    email = models.EmailField(unique=True)
    mobile_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.CUSTOMER)

    def __str__(self):
        return self.username

    @property
    def is_seller(self):
        return self.role == self.Role.SELLER

    @property
    def is_customer(self):
        return self.role == self.Role.CUSTOMER


class SellerProfile(models.Model):  
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    store_name = models.CharField(max_length=255, blank=True)
    store_description = models.TextField(blank=True)
    business_address = models.TextField(blank=True)
    gst_number = models.CharField(max_length=20, blank=True)
    is_approved = models.BooleanField(default=False)  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Store"


class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    shipping_address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
