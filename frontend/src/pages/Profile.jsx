import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { fullProfile, logout } = useAuth();

    if (!fullProfile) return <div className="container">Loading Profile...</div>;

    return (
        <section className="profile-section container" style={{ marginTop: '30px' }}>
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

            <button className="btn-danger" onClick={logout} style={{ marginTop: '20px' }}>
                Logout
            </button>
        </section>
    );
}
