import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { tokens } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    const showMessage = (text, type = 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products/');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                } else {
                    setError('Failed to fetch products');
                }
            } catch (err) {
                setError('Server error');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = async (productId) => {
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
                body: JSON.stringify({ product_id: productId, quantity: 1 })
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

    if (loading) return <div className="container">Loading products...</div>;
    if (error) return <div className="container message error">{error}</div>;

    return (
        <div className="container">
            <h2>Latest Products</h2>
            {message.text && <div className={`message ${message.type}`} style={{ position: 'sticky', top: '10px', zIndex: 100 }}>{message.text}</div>}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {products.length === 0 ? (
                    <p>No products available right now.</p>
                ) : (
                    products.map(product => (
                        <div key={product.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                            {product.image && (
                                <img src={product.image} alt={product.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                            )}
                            <h3 style={{ margin: '10px 0' }}>{product.title}</h3>
                            <p style={{ color: '#555', fontSize: '0.9em' }}>{product.category_name}</p>
                            <p style={{ fontWeight: 'bold', fontSize: '1.2em' }}>${product.price}</p>
                            <p style={{ fontSize: '0.85em', color: '#777', flexGrow: 1 }}>Sold by: {product.seller_store || product.seller_name}</p>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <Link to={`/product/${product.id}`} style={{ flex: 1, textAlign: 'center', background: '#007bff', color: 'white', padding: '8px 12px', textDecoration: 'none', borderRadius: '4px' }}>
                                    View Details
                                </Link>
                                <button 
                                    onClick={() => handleAddToCart(product.id)}
                                    disabled={product.stock === 0}
                                    style={{ flex: 1, background: product.stock === 0 ? '#ccc' : '#28a745', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
                                >
                                    {product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
