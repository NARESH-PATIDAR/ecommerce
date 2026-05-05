import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SellerDashboard() {
    const { tokens, user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image: null
    });

    const showMessage = (text, type = 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const fetchData = async () => {
        try {
            // Fetch Categories
            const catRes = await fetch('/api/products/categories/');
            if (catRes.ok) setCategories(await catRes.json());

            // Fetch Seller's Products
            const prodRes = await fetch('/api/products/seller/manage/', {
                headers: { 'Authorization': `Bearer ${tokens.access}` }
            });
            if (prodRes.ok) {
                setProducts(await prodRes.json());
            } else {
                showMessage('Failed to load products');
            }
        } catch (err) {
            showMessage('Server Error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tokens) fetchData();
    }, [tokens]);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        if (formData.category) data.append('category', formData.category);
        if (formData.image instanceof File) {
            data.append('image', formData.image);
        }

        const url = isEditing ? `/api/products/seller/manage/${editId}/` : '/api/products/seller/manage/';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${tokens.access}` },
                body: data // FormData handles multipart/form-data boundary automatically
            });

            if (response.ok) {
                showMessage(`Product ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
                resetForm();
                fetchData();
            } else {
                const errData = await response.json();
                showMessage(JSON.stringify(errData));
            }
        } catch (err) {
            showMessage('Server Error');
        }
    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setEditId(product.id);
        setFormData({
            title: product.title,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category || '',
            image: null // Cannot easily preset file inputs
        });
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const response = await fetch(`/api/products/seller/manage/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${tokens.access}` }
            });
            if (response.ok) {
                showMessage('Product deleted', 'success');
                fetchData();
            } else {
                showMessage('Failed to delete product');
            }
        } catch (err) {
            showMessage('Server Error');
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ title: '', description: '', price: '', stock: '', category: '', image: null });
        document.getElementById('image-input').value = ''; // Reset file input
    };

    if (user?.role !== 'SELLER') return <div className="container">Access Denied. Only sellers can view this page.</div>;

    return (
        <div className="container">
            <h2>Seller Dashboard</h2>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <section className="form-section" style={{ maxWidth: '800px', margin: '20px auto' }}>
                <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input style={{ flex: 2 }} type="text" name="title" placeholder="Product Title" value={formData.title} onChange={handleInputChange} required />
                        <select style={{ flex: 1 }} name="category" value={formData.category} onChange={handleInputChange}>
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <textarea name="description" placeholder="Product Description" rows="4" value={formData.description} onChange={handleInputChange} required />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" step="0.01" name="price" placeholder="Price ($)" value={formData.price} onChange={handleInputChange} required />
                        <input type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleInputChange} required />
                    </div>

                    <div style={{ margin: '10px 0' }}>
                        <label>Product Image: </label>
                        <input id="image-input" type="file" name="image" accept="image/*" onChange={handleInputChange} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1 }}>{isEditing ? 'Update Product' : 'Add Product'}</button>
                        {isEditing && <button type="button" onClick={resetForm} style={{ flex: 1, background: '#6c757d' }}>Cancel Edit</button>}
                    </div>
                </form>
            </section>

            <hr style={{ margin: '40px 0' }} />

            <h3>Your Products</h3>
            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {products.length === 0 ? <p>You haven't listed any products yet.</p> : (
                        products.map(product => (
                            <div key={product.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                                {product.image && <img src={product.image} alt="product" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
                                <h4>{product.title}</h4>
                                <p><strong>Price:</strong> ${product.price} | <strong>Stock:</strong> {product.stock}</p>
                                <p style={{ fontSize: '0.9em', color: '#666' }}>Category: {product.category_name}</p>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button onClick={() => handleEdit(product)} style={{ padding: '5px 10px', background: '#ffc107', color: 'black' }}>Edit</button>
                                    <button onClick={() => handleDelete(product.id)} style={{ padding: '5px 10px', background: '#dc3545' }}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
