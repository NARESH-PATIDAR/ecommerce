from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import SellerProfile, CustomerProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'mobile_number', 'first_name', 'last_name', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.CUSTOMER)

    class Meta:
        model = User
        fields = ['username', 'email', 'mobile_number', 'password', 'first_name', 'last_name', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', User.Role.CUSTOMER)
        
        # Handle empty mobile number for unique constraint
        mobile_number = validated_data.get('mobile_number', '')
        if not mobile_number:
            validated_data['mobile_number'] = None
            
        user = User.objects.create_user(**validated_data, role=role)
        if role == User.Role.SELLER:
            SellerProfile.objects.create(user=user)
        else:
            CustomerProfile.objects.create(user=user)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds user details (including role) to the login response."""
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user details to the response
        data['user'] = UserSerializer(self.user).data
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("There is no user associated with this e-mail address.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs


class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ['store_name', 'store_description', 'business_address', 'gst_number', 'is_approved']
        read_only_fields = ['is_approved']


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ['shipping_address', 'city', 'state', 'pincode']
