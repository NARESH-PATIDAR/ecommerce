from django.urls import path
from . import views

urlpatterns = [
    # Public endpoints
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),

    # Seller endpoints
    path('seller/manage/', views.SellerProductListCreateView.as_view(), name='seller-product-list-create'),
    path('seller/manage/<int:pk>/', views.SellerProductDetailView.as_view(), name='seller-product-detail'),
]
