import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
    const [currentSection, setCurrentSection] = useState('login');
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const { login, tokens } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Form States
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regRole, setRegRole] = useState('CUSTOMER');
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regMobile, setRegMobile] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetUid, setResetUid] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const showMessage = (text, type = 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    useEffect(() => {
        if (tokens) {
            navigate('/');
        }
        
        // Handle password reset URL parameters
        if (location.pathname.startsWith('/reset-password/')) {
            const parts = location.pathname.split('/');
            if (parts.length >= 4) {
                setResetUid(parts[2]);
                setResetToken(parts[3]);
                setCurrentSection('reset_password');
            }
        }
    }, [tokens, location, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/users/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loginUsername, password: loginPassword })
            });
            const data = await response.json();
            
            if (response.ok) {
                login({ access: data.access, refresh: data.refresh }, data.user);
                navigate('/');
            } else {
                showMessage(data.detail || 'Login Failed');
            }
        } catch (err) {
            showMessage('Server Error');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/users/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: regRole, username: regUsername, email: regEmail,
                    mobile_number: regMobile, password: regPassword
                })
            });
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Registration Successful! Please login.', 'success');
                setCurrentSection('login');
            } else {
                showMessage(JSON.stringify(data));
            }
        } catch (err) {
            showMessage('Server Error');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/users/password-reset/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Password reset email sent!', 'success');
                setForgotEmail('');
            } else {
                showMessage(data.error || data.email?.[0] || 'Failed to send reset email');
            }
        } catch (err) {
            showMessage('Server Error');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return showMessage('Passwords do not match');
        
        try {
            const response = await fetch(`/api/users/password-reset-confirm/${resetUid}/${resetToken}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword, confirm_password: confirmPassword })
            });
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Password reset successful! You can now login.', 'success');
                navigate('/auth');
                setCurrentSection('login');
            } else {
                showMessage(data.error || data.password?.[0] || 'Invalid reset link');
            }
        } catch (err) {
            showMessage('Server Error');
        }
    };

    return (
        <div className="container">
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {currentSection === 'login' && (
                <section className="form-section">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <input type="text" placeholder="Username, Email or Mobile" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required />
                        <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                        <button type="submit">Login</button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '15px' }}><a href="#" onClick={(e) => { e.preventDefault(); setCurrentSection('forgot_password'); }}>Forgot Password?</a></p>
                    <p style={{ textAlign: 'center' }}>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setCurrentSection('register'); }}>Register here</a></p>
                </section>
            )}

            {currentSection === 'register' && (
                <section className="form-section">
                    <h2>Register</h2>
                    <form onSubmit={handleRegister}>
                        <select value={regRole} onChange={e => setRegRole(e.target.value)} required>
                            <option value="CUSTOMER">Customer</option>
                            <option value="SELLER">Seller</option>
                        </select>
                        <input type="text" placeholder="Username" value={regUsername} onChange={e => setRegUsername(e.target.value)} required />
                        <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                        <input type="text" placeholder="Mobile Number" value={regMobile} onChange={e => setRegMobile(e.target.value)} />
                        <input type="password" placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                        <button type="submit">Register</button>
                    </form>
                    <p style={{ textAlign: 'center' }}>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setCurrentSection('login'); }}>Login here</a></p>
                </section>
            )}

            {currentSection === 'forgot_password' && (
                <section className="form-section">
                    <h2>Forgot Password</h2>
                    <form onSubmit={handleForgotPassword}>
                        <input type="email" placeholder="Your Email Address" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                        <button type="submit">Send Reset Link</button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '15px' }}><a href="#" onClick={(e) => { e.preventDefault(); setCurrentSection('login'); }}>Back to Login</a></p>
                </section>
            )}

            {currentSection === 'reset_password' && (
                <section className="form-section">
                    <h2>Create New Password</h2>
                    <form onSubmit={handleResetPassword}>
                        <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        <button type="submit">Reset Password</button>
                    </form>
                </section>
            )}
        </div>
    );
}
