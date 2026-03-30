import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { eventService } from '../services/api';
import './EventManagement.css';

const EventManagement = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!loading && user && user.role === 'student') {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user) {
      fetchEvents();
      
      // Auto-refresh events every 3 seconds to show newly created events
      const interval = setInterval(() => {
        fetchEvents();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [loading, user]);

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await eventService.getAllEvents();
      const sortedEvents = (response.data.events || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setEditData({ ...event });
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(eventId);
        setEvents(events.filter(e => e._id !== eventId));
        alert('Event deleted successfully');
      } catch (error) {
        alert('Error deleting event: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleSave = async () => {
    try {
      await eventService.updateEvent(editData._id, editData);
      setEvents(events.map(e => e._id === editData._id ? editData : e));
      setShowForm(false);
      setSelectedEvent(null);
      alert('Event updated successfully');
    } catch (error) {
      alert('Error updating event: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="event-mgmt-container"><p>Loading...</p></div>;

  return (
    <div className="event-mgmt-container">
      <div className="event-mgmt-header">
        <div className="event-header-bar">
          <button type="button" className="event-back-btn" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>Event Management</h1>
          <div className="event-header-actions">
            <button 
              className="btn-create-new"
              onClick={fetchEvents}
              id="refreshEventsBtn"
              title="Refresh events list"
            >
              🔄 Refresh
            </button>
            <button 
              className="btn-create-new"
              onClick={() => navigate('/admin/create-event')}
            >
              Create New Event
            </button>
          </div>
        </div>
      </div>

      <div className="event-mgmt-content">
        {eventsLoading ? (
          <p className="loading">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>📭 No events created yet</p>
            <button 
              className="btn-create-new"
              onClick={() => navigate('/admin/create-event')}
            >
              Create your first event
            </button>
          </div>
        ) : (
          <div className="events-list">
            {events.map(event => (
              <div key={event._id} className="event-item">
                <div className="event-info">
                  <h3>{event.title || 'Untitled Event'}</h3>
                  <p className="event-type">
                    <span className="badge">{event.eventType || 'Other'}</span>
                  </p>
                  <p className="event-details">
                    📅 {new Date(event.startDate).toLocaleDateString()} | 
                    📍 {event.location || 'TBD'}
                  </p>
                  <p className="event-capacity">
                    👥 {event.registrationCount || 0} / {event.capacity || '∞'} registered
                  </p>
                  <p className="event-status">
                    Status: <span className={`status-badge ${event.status}`}>
                      {event.status || 'upcoming'}
                    </span>
                  </p>
                </div>

                <div className="event-actions">
                  <button 
                    className="btn-view"
                    onClick={() => setSelectedEvent(event)}
                  >
                    View
                  </button>
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(event)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(event._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && !showForm && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close" onClick={() => setSelectedEvent(null)}>✕</button>
            
            <h2>{selectedEvent.title}</h2>
            
            <div className="detail-section">
              <h4>Description</h4>
              <p>{selectedEvent.description || 'No description'}</p>
            </div>

            <div className="details-grid">
              <div>
                <strong>Type:</strong>
                <p>{selectedEvent.eventType}</p>
              </div>
              <div>
                <strong>Location:</strong>
                <p>{selectedEvent.location}</p>
              </div>
              <div>
                <strong>Start Date:</strong>
                <p>{new Date(selectedEvent.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <strong>End Date:</strong>
                <p>{new Date(selectedEvent.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <strong>Capacity:</strong>
                <p>{selectedEvent.capacity}</p>
              </div>
              <div>
                <strong>Registered:</strong>
                <p>{selectedEvent.registrationCount || 0}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-edit"
                onClick={() => setShowForm(true)}
              >
                ✏️ Edit Event
              </button>
              <button 
                className="btn-cancel"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showForm && editData && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content edit-form" onClick={e => e.stopPropagation()}>
            <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            
            <h2>✏️ Edit Event</h2>

            <div className="edit-form-group">
              <label>Title</label>
              <input 
                type="text"
                value={editData.title}
                onChange={e => setEditData({...editData, title: e.target.value})}
              />
            </div>

            <div className="edit-form-group">
              <label>Description</label>
              <textarea 
                value={editData.description}
                onChange={e => setEditData({...editData, description: e.target.value})}
                rows="4"
              ></textarea>
            </div>

            <div className="edit-form-group">
              <label>Location</label>
              <input 
                type="text"
                value={editData.location}
                onChange={e => setEditData({...editData, location: e.target.value})}
              />
            </div>

            <div className="edit-form-row">
              <div className="edit-form-group">
                <label>Capacity</label>
                <input 
                  type="number"
                  value={editData.capacity}
                  onChange={e => setEditData({...editData, capacity: parseInt(e.target.value)})}
                />
              </div>

              <div className="edit-form-group">
                <label>Status</label>
                <select 
                  value={editData.status}
                  onChange={e => setEditData({...editData, status: e.target.value})}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-save"
                onClick={handleSave}
              >
                Save Changes
              </button>
              <button 
                className="btn-cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
