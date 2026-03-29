import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clubService, eventService } from '../services/api';
import './ClubDetail.css';

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, fetchCurrentUser } = useContext(AuthContext);

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isMember = useMemo(() => {
    if (!isAuthenticated || !user || !club) return false;

    // Primary source of truth: club members from latest club fetch.
    const clubMembers = Array.isArray(club.members) ? club.members : [];
    const existsInMembers = clubMembers.some((member) => {
      const memberId = typeof member === 'object' ? member?._id : member;
      return memberId?.toString() === user._id?.toString();
    });

    if (existsInMembers) return true;

    // Fallback: user profile joined clubs.
    const joined = Array.isArray(user.clubsJoined) ? user.clubsJoined : [];
    return joined.some((clubId) => {
      const joinedId = typeof clubId === 'object' ? clubId?._id : clubId;
      return joinedId?.toString() === club._id?.toString();
    });
  }, [isAuthenticated, user, club]);

  const isPresident = useMemo(() => {
    if (!isAuthenticated || !user || !club?.president) return false;
    const presidentId = typeof club.president === 'object' ? club.president?._id : club.president;
    return presidentId?.toString() === user._id?.toString();
  }, [isAuthenticated, user, club]);

  const fetchClubData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');

      const [clubRes, eventsRes] = await Promise.all([
        clubService.getClubById(id),
        eventService.getEventsByClub(id)
      ]);

      setClub(clubRes.data.club);
      setEvents(eventsRes.data.events || []);
    } catch (error) {
      console.error('Error fetching club details:', error);
      setMessage(error.response?.data?.message || 'Could not load club details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClubData();
  }, [fetchClubData]);

  const handleMembershipAction = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      setMessage('');

      if (isMember) {
        await clubService.leaveClub(id);
        setMessage('You have left this club.');
      } else {
        await clubService.joinClub(id);
        setMessage('You have joined this club.');
      }

      await Promise.all([fetchClubData(), fetchCurrentUser()]);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Membership action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="club-detail-page">
        <div className="club-detail-container">
          <p className="club-detail-loading">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="club-detail-page">
        <div className="club-detail-container">
          <div className="club-detail-empty">
            <h2>Club not found</h2>
            <button className="club-detail-btn secondary" onClick={() => navigate('/clubs')}>
              Back to Clubs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const presidentName = club.president?.name || 'Unknown';

  return (
    <div className="club-detail-page">
      <div className="club-detail-container">
        <button className="club-detail-back" onClick={() => navigate('/clubs')}>
          Back to Clubs
        </button>

        {message && <div className="club-detail-message">{message}</div>}

        <section className="club-hero">
          <div className="club-hero-main">
            <p className="club-hero-category">{club.category}</p>
            <h1>{club.name}</h1>
            <p className="club-hero-description">{club.description}</p>
            <div className="club-hero-meta">
              <span>{club.memberCount || club.members?.length || 0} members</span>
              <span>{events.length} events</span>
              <span>President: {presidentName}</span>
            </div>
            <div className="club-hero-actions">
              {isPresident ? (
                <button className="club-detail-btn joined" disabled>
                  President
                </button>
              ) : isMember ? (
                <>
                  <button className="club-detail-btn joined" disabled>
                    Joined
                  </button>
                  <button
                    className="club-detail-btn secondary"
                    onClick={handleMembershipAction}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Please wait...' : 'Leave Club'}
                  </button>
                </>
              ) : (
                <button
                  className="club-detail-btn primary"
                  onClick={handleMembershipAction}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Please wait...' : 'Join Club'}
                </button>
              )}
              {club.email && (
                <a className="club-detail-btn ghost" href={`mailto:${club.email}`}>
                  Contact Club
                </a>
              )}
            </div>
          </div>

          {club.logo && (
            <div className="club-hero-logo-wrap">
              <img src={club.logo} alt={`${club.name} logo`} className="club-hero-logo" />
            </div>
          )}
        </section>

        <section className="club-section">
          <h2>Upcoming and Recent Events</h2>
          {events.length === 0 ? (
            <p className="club-section-empty">No events found for this club yet.</p>
          ) : (
            <div className="club-events-grid">
              {events.map((event) => (
                <article key={event._id} className="club-event-card">
                  <div>
                    <h3>{event.title}</h3>
                    <p>{event.description || 'No description available.'}</p>
                  </div>
                  <div className="club-event-meta">
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    <span>{event.location}</span>
                    <span>{event.eventType}</span>
                  </div>
                  <Link className="club-event-link" to={`/events/${event._id}`}>
                    View Event
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="club-section">
          <h2>Members</h2>
          {!club.members || club.members.length === 0 ? (
            <p className="club-section-empty">No members listed yet.</p>
          ) : (
            <div className="club-members-grid">
              {club.members.map((member) => (
                <article key={member._id} className="club-member-card">
                  <h3>{member.name}</h3>
                  <p>{member.email}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ClubDetail;
