from rest_framework import generics, permissions
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from users.permissions import IsSeller, IsApprovedSeller

# --- Public Views ---

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    # Future enhancement: Add SearchFilter and DjangoFilterBackend here

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

# --- Seller Views ---

class SellerProductListCreateView(generics.ListCreateAPIView):
    """
    List all products for the logged-in seller, or create a new product.
    Requires the user to be an approved seller.
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeller, IsApprovedSeller]

    def get_queryset(self):
        # Only return products belonging to the logged-in seller
        return Product.objects.filter(seller=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Automatically set the seller to the logged-in user
        serializer.save(seller=self.request.user)

class SellerProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific product owned by the logged-in seller.
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeller, IsApprovedSeller]

    def get_queryset(self):
        # Ensure the seller can only access their own products
        return Product.objects.filter(seller=self.request.user)
