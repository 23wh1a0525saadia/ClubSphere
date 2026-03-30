import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService, clubService, eventService } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalClubs: 0,
    totalUsers: 0,
    recentEvents: []
  });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!loading && user && (user.role === 'admin' || user.role === 'president')) {
      const fetchStats = async () => {
        try {
          setStatsLoading(true);

          const [eventsRes, clubsRes] = await Promise.all([
            eventService.getAllEvents(),
            clubService.getAllClubs()
          ]);
          const allEvents = eventsRes.data.events || [];
          const recentEvents = [...allEvents]
            .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
            .slice(0, 5);

          let totalUsers = 0;
          if (user.role === 'admin') {
            try {
              const usersRes = await authService.getAllUsers();
              totalUsers = usersRes.data.count || usersRes.data.users?.length || 0;
            } catch (error) {
              totalUsers = 0;
            }
          }

          setStats({
            totalEvents: eventsRes.data.count || allEvents.length || 0,
            totalClubs: clubsRes.data.count || clubsRes.data.clubs?.length || 0,
            totalUsers,
            recentEvents
          });
        } catch (error) {
          console.error('Failed to fetch dashboard stats:', error);
          setStats({
            totalEvents: 0,
            totalClubs: 0,
            totalUsers: 0,
            recentEvents: []
          });
        } finally {
          setStatsLoading(false);
        }
      };

      fetchStats();
    } else if (!loading && user && user.role === 'student') {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="admin-container"><p>Loading...</p></div>;

  if (!isAuthenticated || (user && user.role !== 'admin' && user.role !== 'president')) {
    return null;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="role-text">Welcome, {user?.role === 'admin' ? 'Admin' : 'Club President'}</p>
      </div>

      <div className="admin-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <h3>Events Created</h3>
            <p className="stat-number">{statsLoading ? '...' : stats.totalEvents}</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏛️</div>
            <h3>Clubs Managed</h3>
            <p className="stat-number">{statsLoading ? '...' : stats.totalClubs}</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <h3>Total Users</h3>
            <p className="stat-number">
              {statsLoading ? '...' : user?.role === 'admin' ? stats.totalUsers : 'N/A'}
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✨</div>
            <h3>Overall Status</h3>
            <p className="stat-text">Active & Ready</p>
          </div>
        </div>

        <div className="admin-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button 
              className="action-btn primary"
              onClick={() => navigate('/admin/create-event')}
            >
              <span className="btn-icon">+</span>
              <span className="btn-text">Create Event</span>
              <span className="btn-desc">Add a new event</span>
            </button>

            <button 
              className="action-btn secondary"
              onClick={() => navigate('/admin/manage-events')}
            >
              <span className="btn-icon">E</span>
              <span className="btn-text">Manage Events</span>
              <span className="btn-desc">Edit/View events</span>
            </button>

            <button 
              className="action-btn tertiary"
              onClick={() => navigate('/admin/manage-clubs')}
            >
              <span className="btn-icon">C</span>
              <span className="btn-text">Manage Clubs</span>
              <span className="btn-desc">Club administration</span>
            </button>

            <button 
              className="action-btn quaternary"
              onClick={() => navigate('/admin/view-registrations')}
            >
              <span className="btn-icon">R</span>
              <span className="btn-text">View Registrations</span>
              <span className="btn-desc">Event registrations</span>
            </button>
          </div>
        </div>

        <div className="history-section">
          <div className="history-section-header">
            <h2>Recent Activity</h2>
            <button type="button" className="history-nav-btn" onClick={() => navigate('/admin/manage-events')}>
              View Full History
            </button>
          </div>
          {stats.recentEvents.length === 0 ? (
            <p className="history-empty">No activity yet. Create your first event to start building history.</p>
          ) : (
            <div className="history-list">
              {stats.recentEvents.map((event) => (
                <article key={event._id} className="history-item">
                  <div>
                    <h4>{event.title}</h4>
                    <p>{event.location || 'Location TBD'}</p>
                  </div>
                  <div className="history-meta">
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    <span className={`history-status ${event.status || 'upcoming'}`}>{event.status || 'upcoming'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="admin-info">
          <div className="info-card">
            <h3>Getting Started</h3>
            <ul>
              <li>Create events for clubs and campus activities</li>
              <li>Set schedule, location, and capacity clearly</li>
              <li>Track registrations and attendance updates</li>
              <li>Use management pages for edits and cleanup</li>
              <li>Review recent activity before announcements</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Your Profile</h3>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Role:</strong> {user?.role === 'admin' ? 'Administrator' : 'Club President'}</p>
            <p><strong>Department:</strong> {user?.department}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
