import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService, clubService } from '../services/api';
import './Home.css';

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, clubsRes] = await Promise.all([
        eventService.getAllEvents({ status: 'upcoming' }),
        clubService.getAllClubs()
      ]);
      setUpcomingEvents(eventsRes.data.events.slice(0, 6));
      setClubs(clubsRes.data.clubs.slice(0, 6));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to ClubSphere</h1>
          <p>Discover, join, and manage campus clubs and events</p>
          <div className="hero-buttons">
            <Link to="/clubs" className="btn btn-primary">Explore Clubs</Link>
            <Link to="/events" className="btn btn-secondary">View Events</Link>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <h2>Featured Clubs</h2>
          {loading ? (
            <p>Loading...</p>
          ) : clubs.length > 0 ? (
            <div className="clubs-grid">
              {clubs.map(club => (
                <div key={club._id} className="club-card">
                  <div className="club-header">
                    <h3>{club.name}</h3>
                    <span className="category-badge">{club.category}</span>
                  </div>
                  <p className="club-description">{club.description.substring(0, 100)}...</p>
                  <p className="club-members">👥 {club.memberCount} members</p>
                  <Link to={`/clubs/${club._id}`} className="btn btn-small">View Club</Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No clubs available.</p>
          )}
        </div>
      </section>

      <section className="events-section">
        <div className="container">
          <h2>Upcoming Events</h2>
          {loading ? (
            <p>Loading...</p>
          ) : upcomingEvents.length > 0 ? (
            <div className="events-grid">
              {upcomingEvents.map(event => (
                <div key={event._id} className="event-card">
                  <div className="event-banner" style={{ backgroundColor: '#00d4ff' }}>
                    <span className="event-type">{event.eventType}</span>
                  </div>
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-date">📅 {new Date(event.startDate).toLocaleDateString()}</p>
                    <p className="event-location">📍 {event.location}</p>
                    <p className="event-capacity">
                      👥 {event.registrationCount}/{event.capacity} registered
                    </p>
                    <Link to={`/events/${event._id}`} className="btn btn-small">View Event</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No upcoming events.</p>
          )}
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <h2>Why ClubSphere?</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h3>Discover</h3>
              <p>Find clubs that match your interests and passions</p>
            </div>
            <div className="info-card">
              <div className="info-icon">👥</div>
              <h3>Connect</h3>
              <p>Meet like-minded students and build communities</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📅</div>
              <h3>Participate</h3>
              <p>Register and attend exclusive club events</p>
            </div>
            <div className="info-card">
              <div className="info-icon">⭐</div>
              <h3>Grow</h3>
              <p>Develop skills and gain valuable experiences</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
