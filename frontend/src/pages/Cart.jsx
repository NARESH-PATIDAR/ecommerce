import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("myToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      const response = await api.get("orders/cart/");
      setCartItems(response.data.items);
      setTotal(response.data.cart_total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`orders/cart/remove/${itemId}/`);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading cart...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <h2>Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <div style={{ textAlign: 'left' }}>
                <h4>{item.product_details.title}</h4>
                <p>Qty: {item.quantity} | Unit Price: ${item.product_details.price} | Subtotal: ${item.item_total}</p>
              </div>
              <button onClick={() => removeItem(item.id)} style={{ color: 'red', background: 'none' }}>Remove</button>
            </div>
          ))}
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <h3>Total: ${total}</h3>
            <button 
              onClick={() => navigate("/checkout")} 
              style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', marginTop: '10px' }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
