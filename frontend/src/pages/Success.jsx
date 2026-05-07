import React from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();
  return (
    <div style={{ marginTop: '50px' }}>
      <h2 style={{ color: 'green' }}>Payment Successful!</h2>
      <p>Thank you for your purchase. Your order has been placed.</p>
      <button 
        onClick={() => navigate("/home")} 
        style={{ backgroundColor: 'blue', color: 'white', marginTop: '20px' }}
      >
        Go to Home
      </button>
    </div>
  );
};

export default Success;
