import React, { useCallback, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { eventService, statsService } from '../services/api';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalClubs: 0,
    totalUsers: 0,
    totalStudents: 0,
    totalClubMembers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const [eventsRes, statsRes] = await Promise.all([
        eventService.getAllEvents(),
        statsService.getSummaryStats()
      ]);

      const allEvents = eventsRes.data.events || [];
      setFeaturedEvents(allEvents.slice(0, 4));

      const summary = statsRes.data.stats || {};

      setStats({
        totalEvents: summary.totalEvents ?? eventsRes.data.count ?? allEvents.length,
        totalClubs: summary.totalClubs ?? 0,
        totalUsers: summary.totalUsers ?? 0,
        totalStudents: summary.totalStudents ?? 0,
        totalClubMembers: summary.totalClubMembers ?? 0
      });
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const previewEvents = featuredEvents.slice(0, 3);

  const getEventSnippet = (description = '') => {
    const cleanText = description.trim();
    if (!cleanText) {
      return 'Join this event and connect with your campus community.';
    }
    if (cleanText.length <= 110) {
      return cleanText;
    }
    return `${cleanText.slice(0, 107)}...`;
  };

  return (
    <div className="home-page">
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-copy">
            <p className="hero-kicker">Campus Operations Platform</p>
            <h1>ClubSphere</h1>
            <p className="hero-subtitle">
              One place to explore clubs, check events, and register easily.
            </p>
            <p className="hero-description">
              Stay updated with campus activities and join the ones that interest you.
            </p>

            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/events" className="btn-primary">Explore Events</Link>
                  <Link to="/clubs" className="btn-secondary">Browse Clubs</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary">Create Account</Link>
                  <Link to="/login" className="btn-secondary">Sign In</Link>
                </>
              )}
            </div>

            <div className="hero-inline-stats">
              <div>
                <strong>{stats.totalEvents}</strong>
                <span>Events</span>
              </div>
              <div>
                <strong>{stats.totalClubs}</strong>
                <span>Clubs</span>
              </div>
              <div>
                <strong>{stats.totalClubMembers}</strong>
                <span>Members</span>
              </div>
            </div>
          </div>

          <div className="hero-preview">
            <h3>Upcoming Highlights</h3>
            {loading ? (
              <p className="hero-preview-empty">Loading events...</p>
            ) : previewEvents.length === 0 ? (
              <p className="hero-preview-empty">No events available yet.</p>
            ) : (
              <div className="preview-list">
                {previewEvents.map((event) => (
                  <article key={event._id} className="preview-item">
                    <h4>{event.title}</h4>
                    <p>{event.location}</p>
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-number">01</div>
          <h3>Events Happening</h3>
          <p className="stat-value">{stats.totalEvents}</p>
          <p className="stat-sub">Published events in the system</p>
        </div>

        <div className="stat-card">
          <div className="stat-number">02</div>
          <h3>Active Clubs</h3>
          <p className="stat-value">{stats.totalClubs}</p>
          <p className="stat-sub">Clubs currently listed on the platform</p>
        </div>

        <div className="stat-card">
          <div className="stat-number">03</div>
          <h3>Total Accounts</h3>
          <p className="stat-value">{stats.totalUsers}</p>
          <p className="stat-sub">All users (students + admins + presidents)</p>
        </div>

        <div className="stat-card">
          <div className="stat-number">04</div>
          <h3>Student Accounts</h3>
          <p className="stat-value">{stats.totalStudents}</p>
          <p className="stat-sub">Accounts with role = student</p>
        </div>

        <div className="stat-card">
          <div className="stat-number">05</div>
          <h3>Club Members</h3>
          <p className="stat-value">{stats.totalClubMembers}</p>
          <p className="stat-sub">Unique users in at least one club (any role)</p>
        </div>
      </section>

      <section className="featured-events">
        <div className="section-header">
          <h2>Happening Now</h2>
          <Link to="/events" className="see-all">See all →</Link>
        </div>

        {loading ? (
          <p className="loading">Loading events...</p>
        ) : featuredEvents.length > 0 ? (
          <div className="events-showcase">
            {featuredEvents.map(event => (
              <Link to={`/events/${event._id}`} key={event._id} className="event-showcase-card">
                <div className="event-showcase-head">
                  <div className="event-showcase-badge">{event.eventType || 'event'}</div>
                  <span className={`event-live-dot ${event.status || 'upcoming'}`}>
                    {event.status || 'upcoming'}
                  </span>
                </div>
                <h3>{event.title}</h3>
                <p className="event-showcase-desc">{getEventSnippet(event.description)}</p>
                <div className="event-showcase-info">
                  <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                  <span>📍 {event.location}</span>
                </div>
                <div className="event-showcase-cta">View details →</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>📭 No events yet. Check back soon!</p>
          </div>
        )}
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Register</h4>
            <p>Create your account as a student or club head</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Explore</h4>
            <p>Browse clubs and events happening around campus</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Join</h4>
            <p>Register for events or join clubs instantly</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h4>Enjoy</h4>
            <p>Be part of amazing college experiences</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        {isAuthenticated ? (
          <div className="cta-content">
            <h2>Ready to Join an Event?</h2>
            <p>Discover what's happening around your campus</p>
            <Link to="/events" className="cta-button">Explore Events Now</Link>
          </div>
        ) : (
          <div className="cta-content">
            <h2>Join Your College Community</h2>
            <p>Register now and start exploring events!</p>
            <Link to="/register" className="cta-button">Sign Up Today</Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
