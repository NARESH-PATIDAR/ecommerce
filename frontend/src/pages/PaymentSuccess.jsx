import { Link } from 'react-router-dom';

export default function PaymentSuccess() {
    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1 style={{ color: '#28a745', marginBottom: '20px' }}>Payment Successful!</h1>
            <p style={{ fontSize: '1.2em' }}>Thank you for your order.</p>
            <div style={{ marginTop: '30px' }}>
                <Link to="/" style={{ 
                    padding: '10px 20px', 
                    background: '#007bff', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '4px' 
                }}>
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
