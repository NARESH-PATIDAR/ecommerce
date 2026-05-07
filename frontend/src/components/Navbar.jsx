import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("myToken");
  const role = localStorage.getItem("userRole");

  const logoutUser = () => {
    localStorage.removeItem("myToken");
    localStorage.removeItem("userRole");
    navigate("/");
    // Force a re-render or handle state properly in a real app, 
    // but for "simple as possible", this is okay if we use window.location or state.
    window.location.reload(); 
  };

  const navStyle = {
    backgroundColor: '#333',
    padding: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    color: 'white'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    margin: '0 10px'
  };

  const logoutStyle = {
    color: 'red',
    textDecoration: 'none',
    margin: '0 10px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontSize: '16px'
  };

  return (
    <div style={navStyle}>
      {token ? (
        <>
          <Link to="/home" style={linkStyle}>Home</Link> |
          {role === "SELLER" ? (
            <Link to="/seller-dashboard" style={linkStyle}>Seller Dashboard</Link>
          ) : (
            <Link to="/cart" style={linkStyle}>Cart</Link>
          )}
          | <Link to="/profile" style={linkStyle}>Profile</Link> |
          <button onClick={logoutUser} style={logoutStyle}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/" style={linkStyle}>Login</Link> |
          <Link to="/register" style={linkStyle}>Register</Link>
        </>
      )}
    </div>
  );
};

export default Navbar;
