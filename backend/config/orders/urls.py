from django.urls import path
from . import views

urlpatterns = [
    path('cart/', views.CartView.as_view(), name='cart-detail'),
    path('cart/add/', views.AddToCartView.as_view(), name='cart-add'),
    path('cart/item/<int:pk>/', views.UpdateCartItemView.as_view(), name='cart-item-update'),
    path('create-payment-intent/', views.CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('payment-success/', views.PaymentSuccessView.as_view(), name='payment-success'),
]

