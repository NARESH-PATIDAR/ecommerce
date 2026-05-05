import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
    const { id } = useParams();
    const { tokens } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    const showMessage = (text, type = 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${id}/`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                setError('Server error');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!tokens) {
            return showMessage('Please log in to add items to your cart.');
        }

        try {
            const response = await fetch('/api/orders/cart/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens.access}`
                },
                body: JSON.stringify({ product_id: product.id, quantity: 1 })
            });
            
            if (response.ok) {
                showMessage('Added to cart!', 'success');
            } else {
                const data = await response.json();
                showMessage(data.error || 'Failed to add to cart');
            }
        } catch (err) {
            showMessage('Server Error');
        }
    };

    if (loading) return <div className="container">Loading product details...</div>;
    if (error) return <div className="container message error">{error}</div>;
    if (!product) return null;

    return (
        <div className="container">
            {message.text && <div className={`message ${message.type}`} style={{ marginBottom: '20px' }}>{message.text}</div>}
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                    {product.image ? (
                        <img src={product.image} alt={product.title} style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '300px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                            No Image Available
                        </div>
                    )}
                </div>
                <div style={{ flex: '2 1 300px' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#007bff', marginBottom: '15px', display: 'inline-block' }}>&larr; Back to Products</Link>
                    <h2>{product.title}</h2>
                    <p style={{ color: '#007bff', fontWeight: 'bold' }}>Category: {product.category_name}</p>
                    <h3 style={{ fontSize: '1.8em', margin: '15px 0' }}>${product.price}</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{product.description}</p>
                    
                    <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <p><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}</p>
                        <p><strong>Sold by:</strong> {product.seller_store || product.seller_name}</p>
                    </div>
                    
                    <button 
                        disabled={product.stock === 0}
                        style={{ 
                            marginTop: '20px', 
                            padding: '12px 24px', 
                            fontSize: '1.1em',
                            background: product.stock === 0 ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleAddToCart}
                    >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}
