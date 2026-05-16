import React, { useState, useEffect } from 'react';
import { API_BASE_URL, TOTAL_SEATS } from '../config';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSlot, setFilterSlot] = useState('All');
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('isAdmin') === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`);
      const data = await response.json();
      if (response.ok) {
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAdmin', 'true');
        fetchBookings();
      } else {
        setLoginError('Invalid Password');
      }
    } catch (err) {
      setLoginError('Server error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this booking? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchBookings();
        } else {
          alert('Failed to delete booking');
        }
      } catch (err) {
        console.error('Error deleting booking:', err);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="login-container" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '24px', border: '1px solid var(--glass-border)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '30px' }}>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            {loginError && <p style={{ color: '#ff4444', fontSize: '0.9rem', marginBottom: '15px' }}>{loginError}</p>}
            <button className="btn" type="submit" style={{ width: '100%' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Loading...</div>;

  const filteredBookings = filterSlot === 'All' 
    ? bookings 
    : bookings.filter(b => b.slot === filterSlot);

  const slots = ['All', '15–16 June', '19–20 June'];

  return (
    <div className="admin-container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <div className="admin-filter-group">
          <label>Filter Slot:</label>
          <select 
            value={filterSlot} 
            onChange={(e) => setFilterSlot(e.target.value)}
            className="admin-select"
          >
            {slots.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Bookings</p>
          <h2 className="stat-value">{bookings.length}</h2>
        </div>
        {slots.slice(1).map(s => (
          <div key={s} className="stat-card">
            <p className="stat-label">{s}</p>
            <h2 className="stat-value">{bookings.filter(b => b.slot === s).length} / {TOTAL_SEATS}</h2>
          </div>
        ))}
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Slot</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>No bookings found</td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b._id}>
                  <td data-label="Date">{new Date(b.createdAt).toLocaleDateString('en-GB')}</td>
                  <td data-label="Name" style={{ fontWeight: 'bold' }}>{b.name}</td>
                  <td data-label="Phone">{b.phone}</td>
                  <td data-label="Location">{b.city}, {b.state}</td>
                  <td data-label="Slot">
                    <span className="slot-badge">
                      {b.slot}
                    </span>
                  </td>
                  <td data-label="Payment">
                    {b.screenshot ? (
                      <a 
                        href={`${API_BASE_URL}/${b.screenshot.replace(/\\/g, '/')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn admin-view-btn"
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span style={{ color: '#666' }}>No proof</span>
                    )}
                  </td>
                  <td data-label="Actions">
                    <button 
                      className="btn" 
                      onClick={() => handleDelete(b._id)}
                      style={{ 
                        padding: '10px 20px', 
                        fontSize: '0.85rem', 
                        background: 'transparent', 
                        border: '1px solid #ff4444',
                        color: '#ff4444',
                        boxShadow: 'none'
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
