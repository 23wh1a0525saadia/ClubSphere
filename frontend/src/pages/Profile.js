import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated, loading, fetchCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        registrationNumber: user.registrationNumber || '',
        department: user.department || 'OTHER',
        semester: user.semester || 1,
        role: user.role || 'student'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semester' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      await authService.updateProfile({
        name: formData.name,
        department: formData.department,
        semester: formData.semester
      });
      await fetchCurrentUser();
      setMessage('✅ Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to update profile');
      console.error('Update profile error:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const clubsJoined = useMemo(() => {
    if (!Array.isArray(user?.clubsJoined)) return [];
    return user.clubsJoined
      .map((club) => ({
        id: club?._id || club,
        name: club?.name || (typeof club === 'string' ? club : 'Unnamed Club')
      }))
      .filter((club) => !!club.id);
  }, [user?.clubsJoined]);

  const eventsRegistered = useMemo(() => {
    if (!Array.isArray(user?.eventsRegistered)) return [];
    return user.eventsRegistered
      .map((registration) => {
        const nestedEvent = registration?.event;
        if (nestedEvent && nestedEvent._id) {
          return {
            id: registration?._id || nestedEvent._id,
            title: nestedEvent.title || 'Unnamed Event',
            status: registration?.status || 'registered'
          };
        }

        if (registration?.title) {
          return {
            id: registration?._id,
            title: registration.title,
            status: registration?.status || 'registered'
          };
        }

        return {
          id: registration?._id,
          title: 'Event details unavailable',
          status: registration?.status || 'registered'
        };
      })
      .filter((entry) => !!entry.id);
  }, [user?.eventsRegistered]);

  if (loading && !user) return <div className="profile-container"><p>Loading...</p></div>;

  if (!isAuthenticated) return null;

  return (
    <div className="profile-container">
      <div className="profile-content">
        <button type="button" className="page-back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>My Profile</h1>
        
        {message && <div className="profile-message">{message}</div>}

        <div className="profile-card">
          <div className="profile-header">
            <div className="user-avatar">
              <div className="avatar-circle">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="user-basic-info">
              <h2>{user?.name}</h2>
              <p className="role-badge">{user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}</p>
            </div>
            <button 
              className="btn-edit"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : '✏️ Edit Profile'}
            </button>
          </div>

          {!isEditing ? (
            // View Mode
            <div className="profile-details">
              <div className="detail-group">
                <div className="detail-item">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="detail-item">
                  <label>Registration Number</label>
                  <p>{user?.registrationNumber || 'Not provided'}</p>
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <label>Department</label>
                  <p>{user?.department}</p>
                </div>
                <div className="detail-item">
                  <label>Semester</label>
                  <p>{user?.semester}</p>
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-item full-width">
                  <label>Clubs Joined</label>
                  <div className="clubs-list">
                    {user?.clubsJoined && user.clubsJoined.length > 0 ? (
                      <ul>
                        {clubsJoined.map(club => (
                          <li key={club.id}>{club.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-state">No clubs joined yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-item full-width">
                  <label>Events Registered</label>
                  <div className="events-list">
                    {user?.eventsRegistered && user.eventsRegistered.length > 0 ? (
                      <ul>
                        {eventsRegistered.map(event => (
                          <li key={event.id}>{event.title}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-state">No events registered yet</p>
                    )}
                  </div>
                </div>
              </div>

              <p className="profile-footer">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            // Edit Mode
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  disabled
                  className="disabled-input"
                />
                <small>Registration number cannot be changed</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                    <option value="EEE">EEE</option>
                    <option value="BT">BT</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="number"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    min="1"
                    max="8"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
