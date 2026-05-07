import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });
  const token = localStorage.getItem("myToken");
  const role = localStorage.getItem("userRole");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || role !== 'SELLER') {
      navigate("/");
      return;
    }
    fetchData();
  }, [token, role, navigate]);

  const fetchData = async () => {
    try {
      const [prodRes, salesRes, catRes] = await Promise.all([
        api.get("products/seller-products/"),
        api.get("orders/seller-sales/"),
        api.get("products/categories/")
      ]);

      setProducts(prodRes.data);
      setSales(salesRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("products/create/", newProduct);
      alert("Product added!");
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
      <h2>Seller Dashboard</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
          <h3>My Products</h3>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ backgroundColor: 'blue', color: 'white', marginBottom: '20px' }}
          >
            {showAddForm ? "Cancel" : "+ Add New Product"}
          </button>

          {showAddForm && (
            <form onSubmit={handleAddProduct} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
              <input 
                placeholder="Title" 
                value={newProduct.title} 
                onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} 
                required 
              />
              <textarea 
                placeholder="Description" 
                value={newProduct.description} 
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
                style={{ width: '100%', margin: '10px 0', padding: '8px' }}
                required 
              ></textarea>
              <input 
                type="number" 
                placeholder="Price" 
                value={newProduct.price} 
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
                required 
              />
              <input 
                type="number" 
                placeholder="Stock" 
                value={newProduct.stock} 
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} 
                required 
              />
              <select 
                value={newProduct.category} 
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                style={{ display: 'block', margin: '10px auto', width: '268px', padding: '8px' }}
                required
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="submit" style={{ backgroundColor: 'green', color: 'white', width: '100%' }}>Save Product</button>
            </form>
          )}

          {products.length === 0 ? (
            <p>No products yet.</p>
          ) : (
            products.map(p => (
              <div key={p.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                <p><b>{p.title}</b> | Price: ${p.price} | Stock: {p.stock}</p>
              </div>
            ))
          )}
        </div>

        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
          <h3>Sales History</h3>
          {sales.length === 0 ? (
            <p>No sales yet.</p>
          ) : (
            sales.map(sale => (
              <div key={sale.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                <p><b>Order #{sale.id}</b> | Total: ${sale.total_price}</p>
                <p>Status: {sale.status}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
