from rest_framework.permissions import BasePermission


class IsSeller(BasePermission):
    message = "Only sellers can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_seller


class IsCustomer(BasePermission):
    message = "Only customers can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_customer


class IsSellerOrAdmin(BasePermission):
    message = "Only sellers or admins can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_seller or request.user.is_superuser
        )


class IsApprovedSeller(BasePermission):
    message = "Your seller account must be approved by an admin before you can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_seller
            and hasattr(request.user, 'seller_profile')
            and request.user.seller_profile.is_approved
        )
