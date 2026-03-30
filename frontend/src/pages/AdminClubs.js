import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clubService } from '../services/api';
import './AdminClubs.css';

const CLUB_CATEGORIES = [
  { value: 'academic', label: 'Academic' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'technical', label: 'Technical' },
  { value: 'social', label: 'Social' },
  { value: 'professional', label: 'Professional' }
];

const AdminClubs = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'technical',
    description: '',
    email: ''
  });

  useEffect(() => {
    const isManager = user?.role === 'admin' || user?.role === 'president';
    if (!isAuthenticated || !isManager) {
      setMessage('❌ Access denied. Admins or presidents only.');
      return;
    }
    fetchClubs();
  }, [isAuthenticated, user]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await clubService.getAllClubs();
      setClubs(response.data.clubs || []);
    } catch (error) {
      setMessage('Error loading clubs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.category) {
        setMessage('❌ Name and category are required');
        return;
      }
      setSubmitting(true);
      await clubService.createClub({
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        email: formData.email.trim() || undefined
      });
      setMessage('✅ Club created successfully!');
      setFormData({ name: '', category: 'technical', description: '', email: '' });
      setShowForm(false);
      fetchClubs();
    } catch (error) {
      setMessage('❌ Error creating club: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Delete this club?')) return;
    try {
      await clubService.deleteClub(clubId);
      setMessage('✅ Club deleted!');
      fetchClubs();
    } catch (error) {
      setMessage('❌ Error: ' + error.response?.data?.message);
    }
  };

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'president')) {
    return <div className="admin-container"><p>Access Denied</p></div>;
  }

  return (
    <div className="admin-container">
      <button type="button" className="page-back-btn" onClick={() => navigate('/admin/dashboard')}>
        ← Back to Dashboard
      </button>
      <div className="admin-header">
        <h1>Manage Clubs</h1>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Club'}
        </button>
      </div>

      {message && (
        <div className="alert">
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      {showForm && (
        <form className="admin-form" onSubmit={handleCreateClub}>
          <input
            type="text"
            name="name"
            placeholder="Club Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            {CLUB_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            placeholder="Club Description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Official club email (optional)"
            value={formData.email}
            onChange={handleInputChange}
          />
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Club'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading clubs...</p>
      ) : clubs.length > 0 ? (
        <div className="clubs-list">
          {clubs.map(club => (
            <div key={club._id} className="club-item">
              <div className="club-info">
                <h3>{club.name}</h3>
                <p className="category">{club.category}</p>
                <p className="description">{club.description}</p>
                <p className="members">👥 {club.members?.length || 0} members</p>
              </div>
              <div className="club-actions">
                <button className="btn-delete" onClick={() => handleDeleteClub(club._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty">No clubs yet. Create one!</p>
      )}
    </div>
  );
};

export default AdminClubs;
