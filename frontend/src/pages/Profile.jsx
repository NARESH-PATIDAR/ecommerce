import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("myToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        api.get("users/profile/"),
        api.get("orders/my-orders/")
      ]);

      setProfile(profileRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Error loading profile.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
        <h2>My Profile</h2>
        <p><b>Username:</b> {profile.username}</p>
        <p><b>Email:</b> {profile.email}</p>
        <p><b>Phone:</b> {profile.phone}</p>
        <p><b>Role:</b> {profile.role}</p>
        {profile.role === 'SELLER' && (
          <>
            <p><b>Store Name:</b> {profile.store_name}</p>
            <p><b>Store Description:</b> {profile.store_description}</p>
            <p><b>Status:</b> {profile.is_approved ? "Approved" : "Pending Approval"}</p>
          </>
        )}
      </div>

      <div style={{ flex: 2, backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
        <h2>Order History</h2>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <p><b>Order #{order.id}</b> | Status: {order.status} | Total: ${order.total_price}</p>
              <p>Address: {order.address}</p>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {order.items.map(item => (
                  <span key={item.id}>{item.product_title} (x{item.quantity}) </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
