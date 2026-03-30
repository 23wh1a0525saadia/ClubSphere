import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/api';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const statuses = ['upcoming', 'ongoing', 'completed'];

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents({ status: selectedStatus });
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return '#00d4ff';
      case 'ongoing': return '#ffa500';
      case 'completed': return '#50c878';
      default: return '#999';
    }
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Campus Events</h1>
        <p>Discover and register for upcoming events</p>
      </div>

      <div className="events-container">
        <div className="filter-section">
          <h3>Filter by Status</h3>
          <div className="filter-buttons">
            <button
              className={!selectedStatus ? 'active' : ''}
              onClick={() => setSelectedStatus('')}
            >
              All Events
            </button>
            {statuses.map(status => (
              <button
                key={status}
                className={selectedStatus === status ? 'active' : ''}
                onClick={() => setSelectedStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="events-list">
          {loading ? (
            <p>Loading events...</p>
          ) : events.length > 0 ? (
            <div className="events-grid-full">
              {events.map(event => (
                <div key={event._id} className="event-card-full">
                  <div className="event-header-section">
                    <div className="event-date-box">
                      <span className="event-day">{new Date(event.startDate).getDate()}</span>
                      <span className="event-month">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="event-title-section">
                      <h2>{event.title}</h2>
                      <span className="event-status" style={{ backgroundColor: getStatusColor(event.status) }}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="event-club">Club: {event.club?.name}</p>
                  <p className="event-description">{event.description.substring(0, 120)}...</p>
                  
                  <div className="event-details">
                    <span>📍 {event.location}</span>
                    <span>🕐 {event.startTime} - {event.endTime}</span>
                    <span>👥 {event.registrationCount}/{event.capacity}</span>
                  </div>

                  <div className="event-type-badge">{event.eventType}</div>
                  <Link to={`/events/${event._id}`} className="btn btn-primary">View Details</Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No events found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
