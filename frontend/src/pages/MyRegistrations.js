import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrationService } from '../services/api';
import './MyRegistrations.css';

const MyRegistrations = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await registrationService.getUserRegistrations();
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId) => {
    try {
      await registrationService.cancelRegistration(registrationId);
      await fetchRegistrations();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to cancel registration');
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <div className="my-registrations-page">
      <div className="my-registrations-container">
        <button type="button" className="page-back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className="my-registrations-header">
          <h1>My Event Registrations</h1>
          <button className="refresh-btn" onClick={fetchRegistrations} type="button">
            Refresh
          </button>
        </div>
        <p className="history-caption">Registration History</p>

        {loading && <p className="state-text">Loading your registrations...</p>}
        {!loading && message && <p className="state-text error">{message}</p>}

        {!loading && !message && registrations.length === 0 && (
          <div className="empty-state">
            <h2>No registrations yet</h2>
            <p>You have not registered for any events.</p>
            <Link to="/events" className="browse-events-link">
              Browse Events
            </Link>
          </div>
        )}

        {!loading && !message && registrations.length > 0 && (
          <div className="registration-grid">
            {registrations.map((registration) => {
              const event = registration.event;
              const isCancelled = registration.status === 'cancelled';

              return (
                <div key={registration._id} className="registration-card">
                  <div className="registration-card-top">
                    <span className={`status-pill ${registration.status || 'registered'}`}>
                      {registration.status || 'registered'}
                    </span>
                  </div>

                  <h3>{event?.title || 'Event unavailable'}</h3>
                  <p>{event?.location || 'Location not available'}</p>
                  <p>
                    {event?.startDate
                      ? new Date(event.startDate).toLocaleString()
                      : 'Date not available'}
                  </p>
                  <p>
                    Registered on {new Date(registration.registeredAt).toLocaleDateString()}
                  </p>

                  <div className="registration-actions">
                    {event?._id && (
                      <Link to={`/events/${event._id}`} className="view-btn">
                        View Event
                      </Link>
                    )}

                    {!isCancelled && (
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => handleCancel(registration._id)}
                      >
                        Cancel Registration
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;
