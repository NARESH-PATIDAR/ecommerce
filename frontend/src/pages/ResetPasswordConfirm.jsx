import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ResetPasswordConfirm = () => {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('black');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Resetting password...");
    setMsgColor("black");

    try {
      await api.post("users/password-reset-confirm/", { uid, token, new_password: password });
      setMsg("Password reset successful! Redirecting to login...");
      setMsgColor("green");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "Reset failed. The link may have expired.");
      setMsgColor("red");
    }
  };

  return (
    <div style={{ width: '300px', margin: '50px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>Set New Password</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="password" 
          placeholder="New Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" style={{ backgroundColor: 'blue', color: 'white' }}>Reset Password</button>
      </form>
      <div style={{ color: msgColor, marginTop: '10px' }}>{msg}</div>
    </div>
  );
};

export default ResetPasswordConfirm;
