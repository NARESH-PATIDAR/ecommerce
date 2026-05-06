import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';

// Load Stripe outside of components' render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe('pk_test_51TTxPAJ7w6nFlMGAzslr1OYuJBqoUNSVgH39x1uN9j8JDQWgAoxpqKp3FD6KkEO8UkgDx1XHRqu2Q1CIeVVOjwDm001u2zJFVx');

const CheckoutForm = ({ clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { tokens } = useAuth();
    
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error: submitError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required', // We handle redirect manually so we can clear the cart first
        });

        if (submitError) {
            setError(submitError.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment succeeded, now clear the cart in the backend
            try {
                await fetch('/api/orders/payment-success/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tokens.access}`,
                        'Content-Type': 'application/json'
                    }
                });
                navigate('/payment-success');
            } catch (err) {
                console.error("Error clearing cart:", err);
                setError("Payment succeeded, but we had trouble updating your cart. Please contact support.");
                setIsProcessing(false);
            }
        } else {
            setError("Payment processing. Please check your account later.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <PaymentElement />
            <button 
                disabled={isProcessing || !stripe || !elements} 
                style={{ 
                    marginTop: '20px', 
                    width: '100%', 
                    padding: '12px', 
                    background: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: (isProcessing || !stripe) ? 'not-allowed' : 'pointer'
                }}
            >
                {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </form>
    );
};

export default function Checkout() {
    const [clientSecret, setClientSecret] = useState('');
    const { tokens } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!tokens) {
            navigate('/auth');
            return;
        }

        // Create PaymentIntent as soon as the page loads
        const fetchClientSecret = async () => {
            try {
                const response = await fetch('/api/orders/create-payment-intent/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tokens.access}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setClientSecret(data.clientSecret);
                } else {
                    console.error("Failed to fetch client secret:", data.error);
                }
            } catch (error) {
                console.error("Error fetching client secret:", error);
            }
        };

        fetchClientSecret();
    }, [tokens, navigate]);

    return (
        <div className="container">
            <h2>Checkout</h2>
            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm clientSecret={clientSecret} />
                    </Elements>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        Loading payment methods... (or your cart is empty)
                    </div>
                )}
            </div>
        </div>
    );
}
