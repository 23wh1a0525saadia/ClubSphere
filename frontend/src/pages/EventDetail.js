import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { eventService, registrationService } from '../services/api';
import './EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [message, setMessage] = useState('');

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(id);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error fetching event:', error);
      setMessage('❌ Could not load event details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user.role === 'admin' || user.role === 'president') {
      setMessage('❌ Admins cannot register for events');
      return;
    }

    try {
      setRegistering(true);
      setMessage('');
      await registrationService.registerForEvent(id);
      setMessage('✅ Successfully registered for this event!');
      setIsRegistered(true);
    } catch (error) {
      setMessage('❌ Registration failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="event-detail-container">
        <div className="loading">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-container">
        <div className="error">
          <h2>Event Not Found</h2>
          <button onClick={() => navigate('/events')} className="btn-back">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const registrationPercentage = event.capacity > 0 ? (event.registrationCount / event.capacity) * 100 : 0;

  return (
    <div className="event-detail-container">
      <button onClick={() => navigate('/events')} className="btn-back">
        ← Back to Events
      </button>

      <div className="event-detail-content">
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="event-detail-header">
          <div className="event-detail-date">
            <span className="date-box">
              {startDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <div className="event-detail-title">
            <h1>{event.title}</h1>
            <div className="event-meta-tags">
              <span className="badge badge-type">{event.eventType}</span>
              <span className="badge badge-status" style={{
                backgroundColor: event.status === 'upcoming' ? '#00d4ff' : 
                                event.status === 'ongoing' ? '#ffa500' : '#50c878'
              }}>
                {event.status}
              </span>
            </div>
          </div>
        </div>

        <div className="event-detail-body">
          <div className="event-detail-main">
            {event.description && (
              <div className="detail-section">
                <h3>📝 Description</h3>
                <p>{event.description}</p>
              </div>
            )}

            <div className="event-info-grid">
              <div className="info-item">
                <span className="info-icon">📅</span>
                <div>
                  <p className="info-label">Date</p>
                  <p className="info-value">
                    {startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {startDate.toDateString() !== endDate.toDateString() && (
                    <p className="info-sub">
                      to {endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">🕐</span>
                <div>
                  <p className="info-label">Time</p>
                  <p className="info-value">{event.startTime} - {event.endTime}</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <p className="info-label">Location</p>
                  <p className="info-value">{event.location}</p>
                </div>
              </div>

              {event.club && (
                <div className="info-item">
                  <span className="info-icon">🏢</span>
                  <div>
                    <p className="info-label">Organized By</p>
                    <p className="info-value">{event.club.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>👥 Registrations</h3>
              <div className="registration-info">
                <p className="registration-count">
                  <strong>{event.registrationCount}</strong> of <strong>{event.capacity}</strong> spots filled
                </p>
                <div className="capacity-bar">
                  <div 
                    className="capacity-filled" 
                    style={{ width: `${registrationPercentage}%` }}
                  ></div>
                </div>
                <p className="capacity-percentage">{Math.round(registrationPercentage)}% capacity</p>
              </div>
            </div>

            {event.organizers && event.organizers.length > 0 && (
              <div className="detail-section">
                <h3>👨‍💼 Organizers</h3>
                <div className="organizers-list">
                  {event.organizers.map(org => (
                    <div key={org._id} className="organizer-item">
                      <div className="organizer-avatar">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="organizer-info">
                        <p className="organizer-name">{org.name}</p>
                        <p className="organizer-email">{org.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="event-detail-sidebar">
            <div className="registration-card">
              <h3>🎯 Registration</h3>
              
              {registrationPercentage >= 100 ? (
                <div className="full-message">
                  <p>❌ This event is full!</p>
                </div>
              ) : !isAuthenticated ? (
                <button onClick={() => navigate('/login')} className="btn btn-register">
                  Login to Register
                </button>
              ) : isRegistered ? (
                <div className="registered-message">
                  <p>✅ You're registered!</p>
                </div>
              ) : user.role === 'admin' || user.role === 'president' ? (
                <div className="admin-message">
                  <p>Admins cannot register for events</p>
                </div>
              ) : (
                <button 
                  onClick={handleRegister} 
                  disabled={registering}
                  className="btn btn-register"
                >
                  {registering ? 'Registering...' : '✨ Register Now'}
                </button>
              )}

              <div className="event-quick-info">
                <div className="quick-info-item">
                  <span>📊 Availability</span>
                  <strong>{event.capacity - event.registrationCount} spots left</strong>
                </div>
                <div className="quick-info-item">
                  <span>🏷️ Type</span>
                  <strong>{event.eventType}</strong>
                </div>
                <div className="quick-info-item">
                  <span>📍 Venue</span>
                  <strong>{event.location}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
