import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
    const { tokens } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    const showMessage = (text, type = 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const fetchCart = async () => {
        if (!tokens) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('/api/orders/cart/', {
                headers: { 'Authorization': `Bearer ${tokens.access}` }
            });
            if (response.ok) {
                setCart(await response.json());
            } else {
                setError('Failed to fetch cart');
            }
        } catch (err) {
            setError('Server error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [tokens]);

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        try {
            const response = await fetch(`/api/orders/cart/item/${itemId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens.access}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
            
            if (response.ok) {
                if (response.status === 204) {
                    fetchCart(); // Item deleted
                } else {
                    setCart(await response.json());
                }
            } else {
                const data = await response.json();
                showMessage(data.error || 'Failed to update quantity');
            }
        } catch (err) {
            showMessage('Server Error');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const response = await fetch(`/api/orders/cart/item/${itemId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${tokens.access}` }
            });
            
            if (response.ok) {
                setCart(await response.json());
            } else {
                showMessage('Failed to remove item');
            }
        } catch (err) {
            showMessage('Server Error');
        }
    };

    if (!tokens) return <div className="container">Please log in to view your cart.</div>;
    if (loading) return <div className="container">Loading cart...</div>;
    if (error) return <div className="container message error">{error}</div>;

    return (
        <div className="container">
            <h2>Your Shopping Cart</h2>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
            
            {!cart || cart.items.length === 0 ? (
                <div>
                    <p>Your cart is empty.</p>
                    <Link to="/" style={{ color: '#007bff' }}>Browse Products</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '20px' }}>
                    <div style={{ flex: '2 1 500px' }}>
                        {cart.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', borderBottom: '1px solid #ccc', padding: '15px 0', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                                    {item.product_details.image ? (
                                        <img src={item.product_details.image} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: '#eee', borderRadius: '4px' }}></div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4>{item.product_details.title}</h4>
                                    <p style={{ color: '#555', fontSize: '0.9em' }}>${item.product_details.price} each</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} style={{ padding: '5px 10px' }}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} style={{ padding: '5px 10px' }}>+</button>
                                </div>
                                <div style={{ fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
                                    ${item.item_total}
                                </div>
                                <button onClick={() => handleRemoveItem(item.id)} style={{ background: '#dc3545', padding: '5px 10px' }}>Remove</button>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ flex: '1 1 300px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                        <h3>Order Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0', fontSize: '1.2em', fontWeight: 'bold' }}>
                            <span>Total:</span>
                            <span>${cart.cart_total}</span>
                        </div>
                        <button style={{ width: '100%', padding: '12px', fontSize: '1.1em', background: '#28a745' }}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
