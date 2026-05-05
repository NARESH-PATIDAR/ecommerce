import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <Link style={{color: 'white', textDecoration: 'none'}} to="/">E-Commerce</Link>
            </div>
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                {user ? (
                    <>
                        {user.role === 'SELLER' && (
                            <li><Link to="/seller-dashboard">Seller Dashboard</Link></li>
                        )}
                        <li><Link to="/cart">Cart</Link></li>
                        <li><Link to="/profile">Profile ({user.username})</Link></li>
                        <li><button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Logout</button></li>
                    </>
                ) : (
                    <li><Link to="/auth">Login / Register</Link></li>
                )}
            </ul>
        </nav>
    );
}
