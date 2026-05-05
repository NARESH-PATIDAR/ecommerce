from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from products.models import Product
from .serializers import CartSerializer, CartItemSerializer

class CartView(generics.RetrieveAPIView):
    """Get the current user's cart. Creates one if it doesn't exist."""
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart

class AddToCartView(views.APIView):
    """Add a product to the cart or increment its quantity."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity_to_add = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({"error": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)
        
        # Enforce Stock Limitations
        if product.stock < 1:
            return Response({"error": "This product is out of stock."}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        
        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': 0} # Start at 0 if creating, so we can just add below
        )

        new_quantity = cart_item.quantity + quantity_to_add

        # Strictly enforce stock limit
        if new_quantity > product.stock:
            return Response({
                "error": f"Cannot add {quantity_to_add} more. Only {product.stock} total items available in stock. You already have {cart_item.quantity} in your cart."
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = new_quantity
        cart_item.save()

        # Return updated cart
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

class UpdateCartItemView(generics.RetrieveUpdateDestroyAPIView):
    """Update or remove a specific cart item."""
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check stock limits when updating quantity
        new_quantity = request.data.get('quantity')
        if new_quantity is not None:
            new_quantity = int(new_quantity)
            if new_quantity > instance.product.stock:
                return Response({
                    "error": f"Cannot update quantity to {new_quantity}. Only {instance.product.stock} items available."
                }, status=status.HTTP_400_BAD_REQUEST)
                
            if new_quantity <= 0:
                # If they set quantity to 0, just delete it
                instance.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Return the whole cart so frontend can update totals easily
        cart = Cart.objects.get(user=request.user)
        return Response(CartSerializer(cart).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        # Return the whole cart so frontend can update totals easily
        cart = Cart.objects.get(user=request.user)
        return Response(CartSerializer(cart).data)
