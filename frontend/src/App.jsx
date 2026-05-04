import { useState, useEffect } from 'react'

function App() {
  const [currentSection, setCurrentSection] = useState('login') // login, register, profile, forgot_password, reset_password
  const [message, setMessage] = useState({ text: '', type: '' })
  
  // Auth State
  const [tokens, setTokens] = useState(() => JSON.parse(localStorage.getItem('tokens')))
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')))

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register Form State
  const [regRole, setRegRole] = useState('CUSTOMER')
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regMobile, setRegMobile] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('')

  // Reset Password State
  const [resetUid, setResetUid] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Full Profile Data State
  const [fullProfile, setFullProfile] = useState(null)

  // Show a message for 5 seconds
  const showMessage = (text, type = 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 5000)
  }

  // Check URL or load profile on startup
  useEffect(() => {
    // Check if URL is for resetting password
    const path = window.location.pathname
    if (path.startsWith('/reset-password/')) {
      const parts = path.split('/')
      if (parts.length >= 4) {
        setResetUid(parts[2])
        setResetToken(parts[3])
        setCurrentSection('reset_password')
        return
      }
    }

    // Normal startup
    if (tokens) {
      loadProfile()
    } else {
      setCurrentSection('login')
    }
  }, [tokens])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      })
      const data = await response.json()
      
      if (response.ok) {
        const newTokens = { access: data.access, refresh: data.refresh }
        localStorage.setItem('tokens', JSON.stringify(newTokens))
        localStorage.setItem('user', JSON.stringify(data.user))
        setTokens(newTokens)
        setUser(data.user)
        showMessage('Login Successful!', 'success')
      } else {
        showMessage(data.detail || 'Login Failed')
      }
    } catch (err) {
      showMessage('Server Error')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: regRole,
          username: regUsername,
          email: regEmail,
          mobile_number: regMobile,
          password: regPassword
        })
      })
      const data = await response.json()
      
      if (response.ok) {
        showMessage('Registration Successful! Please login.', 'success')
        setCurrentSection('login')
      } else {
        showMessage(JSON.stringify(data))
      }
    } catch (err) {
      showMessage('Server Error')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/users/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      })
      const data = await response.json()
      
      if (response.ok) {
        showMessage('Password reset email sent! Check your backend terminal.', 'success')
        setForgotEmail('')
      } else {
        showMessage(data.error || data.email?.[0] || 'Failed to send reset email')
      }
    } catch (err) {
      showMessage('Server Error')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return showMessage('Passwords do not match')
    }
    
    try {
      const response = await fetch(`/api/users/password-reset-confirm/${resetUid}/${resetToken}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, confirm_password: confirmPassword })
      })
      const data = await response.json()
      
      if (response.ok) {
        showMessage('Password reset successful! You can now login.', 'success')
        window.history.pushState({}, '', '/') // Clean URL
        setCurrentSection('login')
      } else {
        showMessage(data.error || data.password?.[0] || 'Reset link is invalid or has expired')
      }
    } catch (err) {
      showMessage('Server Error')
    }
  }

  const loadProfile = async () => {
    if (!tokens) return
    try {
      const response = await fetch('/api/users/profile/', {
        headers: { 'Authorization': `Bearer ${tokens.access}` }
      })
      if (response.ok) {
        const data = await response.json()
        setFullProfile(data)
        setCurrentSection('profile')
      } else {
        handleLogout() // Token expired
      }
    } catch (err) {
      showMessage('Error loading profile')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('tokens')
    localStorage.removeItem('user')
    setTokens(null)
    setUser(null)
    setFullProfile(null)
    showMessage('Logged out', 'success')
    setCurrentSection('login')
  }

  return (
    <>
      <nav className="navbar">
        <div className="logo">ShopVerse</div>
        <ul className="nav-links">
          {tokens && user ? (
            <>
              <li><button onClick={() => setCurrentSection('profile')}>Profile ({user.username})</button></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><button onClick={() => { window.history.pushState({}, '', '/'); setCurrentSection('login') }}>Login</button></li>
              <li><button onClick={() => { window.history.pushState({}, '', '/'); setCurrentSection('register') }}>Register</button></li>
            </>
          )}
        </ul>
      </nav>

      <main className="container">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {currentSection === 'login' && !tokens && (
          <section className="form-section">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username, Email or Mobile"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentSection('forgot_password') }}>
                Forgot Password?
              </a>
            </p>
            <p style={{ textAlign: 'center' }}>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentSection('register') }}>
                Register here
              </a>
            </p>
          </section>
        )}

        {currentSection === 'forgot_password' && !tokens && (
          <section className="form-section">
            <h2>Forgot Password</h2>
            <p style={{ textAlign: 'center', marginBottom: '15px' }}>Enter your email to receive a reset link.</p>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Your Email Address"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
              />
              <button type="submit">Send Reset Link</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentSection('login') }}>
                Back to Login
              </a>
            </p>
          </section>
        )}

        {currentSection === 'reset_password' && !tokens && (
          <section className="form-section">
            <h2>Create New Password</h2>
            <form onSubmit={handleResetPassword}>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit">Reset Password</button>
            </form>
          </section>
        )}

        {currentSection === 'register' && !tokens && (
          <section className="form-section">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <select value={regRole} onChange={e => setRegRole(e.target.value)} required>
                <option value="CUSTOMER">Customer</option>
                <option value="SELLER">Seller</option>
              </select>
              <input
                type="text"
                placeholder="Username"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={regMobile}
                onChange={e => setRegMobile(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
              />
              <button type="submit">Register</button>
            </form>
            <p style={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentSection('login') }}>
                Login here
              </a>
            </p>
          </section>
        )}

        {currentSection === 'profile' && fullProfile && (
          <section className="profile-section">
            <h2>User Profile</h2>
            <div>
              <div className="profile-item"><strong>Username:</strong> {fullProfile.username}</div>
              <div className="profile-item"><strong>Email:</strong> {fullProfile.email}</div>
              <div className="profile-item"><strong>Role:</strong> {fullProfile.role}</div>
            </div>
            
            {fullProfile.role === 'SELLER' && (
              <div style={{ marginTop: '20px' }}>
                <h3>Seller Details</h3>
                <div className="profile-item">
                  <strong>Store:</strong> {fullProfile.profile?.store_name || 'Not set'}
                </div>
                <div className="profile-item">
                  <strong>Status:</strong> {fullProfile.profile?.is_approved ? 'Approved' : 'Pending Approval'}
                </div>
              </div>
            )}

            {fullProfile.role === 'CUSTOMER' && (
              <div style={{ marginTop: '20px' }}>
                <h3>Customer Details</h3>
                <div className="profile-item">
                  <strong>City:</strong> {fullProfile.profile?.city || 'Not set'}
                </div>
              </div>
            )}

            <button className="btn-danger" onClick={handleLogout} style={{ marginTop: '20px' }}>
              Logout
            </button>
          </section>
        )}
      </main>
    </>
  )
}

export default App
