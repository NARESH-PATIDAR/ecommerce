from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, SellerProfile, CustomerProfile


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_superuser')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'mobile_number')

    # Add role and mobile_number to the existing fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ('Role & Contact', {'fields': ('role', 'mobile_number')}),
    )


class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'store_name', 'is_approved', 'created_at')
    list_filter = ('is_approved',)
    list_editable = ('is_approved',)
    search_fields = ('user__username', 'store_name', 'gst_number')


class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'city', 'state', 'pincode', 'created_at')
    search_fields = ('user__username', 'city', 'state')


admin.site.register(User, CustomUserAdmin)
admin.site.register(SellerProfile, SellerProfileAdmin)
admin.site.register(CustomerProfile, CustomerProfileAdmin)
