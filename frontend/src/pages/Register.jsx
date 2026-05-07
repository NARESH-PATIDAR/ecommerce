import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'BUYER'
  });
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('black');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("Registering...");
    setMsgColor("black");

    try {
      const response = await api.post("users/register/", formData);

      setMsg("Registration Successful! Please login.");
      setMsgColor("green");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "Registration failed. Check details.");
      setMsgColor("red");
    }
  };

  return (
    <div style={{ width: '300px', margin: '0 auto', padding: '20px' }}>
      <h2>Create Account</h2>
      <form onSubmit={handleRegister}>
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <select 
          name="role" 
          onChange={handleChange} 
          style={{ display: 'block', margin: '10px auto', width: '268px', padding: '8px' }}
        >
          <option value="BUYER">I want to Buy</option>
          <option value="SELLER">I want to Sell</option>
        </select>
        <button type="submit" style={{ backgroundColor: 'green', color: 'white' }}>Register</button>
      </form>
      <div style={{ marginTop: '15px', fontSize: '14px' }}>
        Already have an account? <Link to="/">Login here</Link>
      </div>
      <div style={{ color: msgColor, marginTop: '10px' }}>{msg}</div>
    </div>
  );
};

export default Register;
