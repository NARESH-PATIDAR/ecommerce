import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem("myToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`products/${id}/`);
        setProduct(response.data);
      } catch (err) {
        console.error(err);
        setMsg("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!token) {
      alert("Please login to add items to your cart.");
      navigate("/");
      return;
    }

    try {
      await api.post("orders/cart/add/", { product_id: id, quantity: 1 });
      alert("Added to cart!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to add to cart");
    }
  };

  if (loading) return <p>Loading product details...</p>;
  if (!product) return <p>{msg}</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', textAlign: 'left', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>&larr; Back</button>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, backgroundColor: '#eee', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {product.image ? (
            <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            "No Image"
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h2>{product.title}</h2>
          <p><b>Price: ${product.price}</b></p>
          <p>Category: {product.category_name}</p>
          <p>Stock: {product.stock}</p>
          <p>Seller: {product.seller_store || product.seller_name}</p>
          <p style={{ marginTop: '20px' }}>{product.description}</p>
          <button 
            onClick={addToCart} 
            disabled={product.stock === 0}
            style={{ backgroundColor: 'green', color: 'white', marginTop: '20px', padding: '10px 20px' }}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
