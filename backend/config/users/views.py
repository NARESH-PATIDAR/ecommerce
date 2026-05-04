from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    SellerProfileSerializer, CustomerProfileSerializer,
)
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

User = get_user_model()

class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User created successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token or token already blacklisted."}, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user_data = UserSerializer(request.user).data
        if request.user.is_seller and hasattr(request.user, 'seller_profile'):
            user_data['profile'] = SellerProfileSerializer(request.user.seller_profile).data
        elif request.user.is_customer and hasattr(request.user, 'customer_profile'):
            user_data['profile'] = CustomerProfileSerializer(request.user.customer_profile).data

        return Response(user_data)

    def put(self, request):
        if request.user.is_seller and hasattr(request.user, 'seller_profile'):
            serializer = SellerProfileSerializer(
                request.user.seller_profile, data=request.data, partial=True
            )
        elif request.user.is_customer and hasattr(request.user, 'customer_profile'):
            serializer = CustomerProfileSerializer(
                request.user.customer_profile, data=request.data, partial=True
            )
        else:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class PasswordResetRequestView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)
            
            # Use localhost:5173 for local testing with Vite
            reset_url = f"http://localhost:5173/reset-password/{uidb64}/{token}/"
            
            send_mail(
                subject='Password Reset Request',
                message=f'Click the link to reset your password: {reset_url}',
                from_email='noreply@ecommerce.com',
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                user = None

            if user is not None and PasswordResetTokenGenerator().check_token(user, token):
                user.set_password(serializer.validated_data['password'])
                user.save()
                return Response({"message": "Password has been reset with the new password."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
