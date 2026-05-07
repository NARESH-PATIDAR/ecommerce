import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('black');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setMsg("Logging in...");
    setMsgColor("black");

    try {
      const response = await api.post("users/login/", {
        username,
        password
      });

      localStorage.setItem("myToken", response.data.access);
      localStorage.setItem("userRole", response.data.user.role);
      setMsg("Success! Redirecting...");
      setMsgColor("green");
      
      setTimeout(() => {
        navigate("/home");
        window.location.reload(); // To update Navbar
      }, 1000);
    } catch (err) {
      console.error(err);
      setMsg("Wrong username or password.");
      setMsgColor("red");
    }
  };

  const containerStyle = {
    width: '300px',
    margin: '0 auto',
    padding: '20px',
  };

  return (
    <div style={containerStyle}>
      <h2>Welcome to Shop</h2>
      <p>Please login to continue</p>
      
      <input 
        type="text" 
        placeholder="Enter Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Enter Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button 
        onClick={handleLogin} 
        style={{ backgroundColor: 'blue', color: 'white' }}
      >
        Login
      </button>
      
      <div style={{ marginTop: '15px', fontSize: '14px' }}>
        <Link to="/forgot-password">Forgot Password?</Link> | 
        <Link to="/register">Register New Account</Link>
      </div>
      
      <div style={{ color: msgColor, marginTop: '10px' }}>{msg}</div>
    </div>
  );
};

export default Login;
