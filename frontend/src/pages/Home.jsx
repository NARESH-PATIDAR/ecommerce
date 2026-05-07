import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem("myToken");
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get("products/");
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setMsg("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    if (!token) {
      alert("Please login to add items to your cart.");
      navigate("/");
      return;
    }

    try {
      await api.post("orders/cart/add/", { product_id: productId, quantity: 1 });
      
      setMsg("Added to cart!");
      setTimeout(() => { setMsg(""); }, 3000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to add to cart");
    }
  };

  const gridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
  };

  const cardStyle = {
    width: '250px',
    padding: '15px',
    textAlign: 'left',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  };

  const imageContainerStyle = {
    width: '100%',
    height: '150px',
    backgroundColor: '#eee',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div>
      <h2>Latest Products</h2>
      <div style={{ color: 'green', marginBottom: '10px' }}>{msg}</div>

      <div style={gridStyle}>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available right now.</p>
        ) : (
          products.map(p => (
            <div key={p.id} style={cardStyle}>
              <div style={imageContainerStyle}>
                {p.image ? (
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  "No Image"
                )}
              </div>
              <h3>{p.title}</h3>
              <p>Category: {p.category_name}</p>
              <p><b>${p.price}</b></p>
              <p>Stock: {p.stock}</p>
              <p>Sold by: {p.seller_store || p.seller_name}</p>
              
              <div>
                <Link to={`/product/${p.id}`} style={{ color: 'blue', textDecoration: 'underline', marginRight: '10px' }}>
                  View Details
                </Link>
                <button 
                  onClick={() => addToCart(p.id)} 
                  disabled={p.stock === 0}
                  style={{ backgroundColor: 'green', color: 'white' }}
                >
                  {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
