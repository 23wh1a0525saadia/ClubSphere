import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { eventService } from '../services/api';
import './AdminEvents.css';

const AdminEvents = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    eventType: 'workshop',
    location: '',
    capacity: '',
    startDate: '',
    endDate: '',
    description: '',
    paymentRequired: false,
    paymentAmount: 0
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setMessage('❌ Access denied. Admins only.');
      return;
    }
    fetchEvents();
  }, [isAuthenticated, user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents();
      setEvents(response.data.events || []);
    } catch (error) {
      setMessage('Error loading events: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        payment: {
          required: formData.paymentRequired,
          amount: formData.paymentAmount
        }
      };
      await eventService.createEvent(eventData);
      setMessage('✅ Event created successfully!');
      setFormData({
        title: '',
        eventType: 'workshop',
        location: '',
        capacity: '',
        startDate: '',
        endDate: '',
        description: '',
        paymentRequired: false,
        paymentAmount: 0
      });
      setShowForm(false);
      fetchEvents();
    } catch (error) {
      setMessage('❌ Error: ' + error.response?.data?.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventService.deleteEvent(eventId);
      setMessage('✅ Event deleted!');
      fetchEvents();
    } catch (error) {
      setMessage('❌ Error: ' + error.response?.data?.message);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="admin-container"><p>Access Denied</p></div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>📅 Manage Events</h1>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Event'}
        </button>
      </div>

      {message && (
        <div className="alert">
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      {showForm && (
        <form className="admin-form" onSubmit={handleCreateEvent}>
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          
          <select name="eventType" value={formData.eventType} onChange={handleInputChange}>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="competition">Competition</option>
            <option value="fest">Fest</option>
            <option value="social">Social</option>
            <option value="technical">Technical</option>
            <option value="other">Other</option>
          </select>

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />

          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            required
          />

          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />

          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
          />

          <div className="payment-section">
            <label>
              <input
                type="checkbox"
                name="paymentRequired"
                checked={formData.paymentRequired}
                onChange={handleInputChange}
              />
              Require Payment
            </label>
            {formData.paymentRequired && (
              <input
                type="number"
                name="paymentAmount"
                placeholder="Payment Amount (₹)"
                value={formData.paymentAmount}
                onChange={handleInputChange}
                step="0.01"
              />
            )}
          </div>

          <button type="submit" className="btn-submit">Create Event</button>
        </form>
      )}

      {loading ? (
        <p>Loading events...</p>
      ) : events.length > 0 ? (
        <div className="events-list">
          {events.map(event => (
            <div key={event._id} className="event-item">
              <div className="event-info">
                <h3>{event.title}</h3>
                <p className="type">Type: {event.eventType}</p>
                <p className="location">📍 {event.location}</p>
                <p className="dates">
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </p>
                <p className="capacity">👥 {event.registrationCount}/{event.capacity} registered</p>
                {event.payment?.required && (
                  <p className="payment">💳 Payment: ₹{event.payment.amount}</p>
                )}
              </div>
              <div className="event-actions">
                <button className="btn-delete" onClick={() => handleDeleteEvent(event._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty">No events yet. Create one!</p>
      )}
    </div>
  );
};

export default AdminEvents;
