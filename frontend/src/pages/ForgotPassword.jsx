import React, { useState } from 'react';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('black');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Sending reset link...");
    setMsgColor("black");

    try {
      await api.post("users/password-reset/", { email });
      setMsg("Reset link sent! Please check your email.");
      setMsgColor("green");
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "Email not found.");
      setMsgColor("red");
    }
  };

  return (
    <div style={{ width: '300px', margin: '50px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>Forgot Password</h2>
      <p>Enter your email to receive a reset link.</p>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Enter Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit" style={{ backgroundColor: 'blue', color: 'white' }}>Send Link</button>
      </form>
      <div style={{ color: msgColor, marginTop: '10px' }}>{msg}</div>
    </div>
  );
};

export default ForgotPassword;
