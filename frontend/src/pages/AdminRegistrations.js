import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService, registrationService } from '../services/api';
import './AdminRegistrations.css';

const AdminRegistrations = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [message, setMessage] = useState('');

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === selectedEventId),
    [events, selectedEventId]
  );

  const fetchEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      setMessage('');
      const response = await eventService.getAllEvents();
      const allEvents = response.data.events || [];
      setEvents(allEvents);
      if (!selectedEventId && allEvents.length > 0) {
        setSelectedEventId(allEvents[0]._id);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  }, [selectedEventId]);

  const fetchRegistrations = async (eventId) => {
    if (!eventId) {
      setRegistrations([]);
      return;
    }

    try {
      setLoadingRegistrations(true);
      setMessage('');
      const response = await registrationService.getEventRegistrations(eventId);
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load registrations for this event');
      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleAttendance = async (registrationId, currentAttendance) => {
    try {
      await registrationService.markAttendance(registrationId, !currentAttendance);
      await fetchRegistrations(selectedEventId);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update attendance');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (selectedEventId) {
      fetchRegistrations(selectedEventId);
    }
  }, [selectedEventId]);

  return (
    <div className="admin-registrations-page">
      <div className="admin-registrations-container">
        <button type="button" className="page-back-btn" onClick={() => navigate('/admin/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="admin-registrations-header">
          <h1>Event Registrations</h1>
          <button type="button" className="refresh-btn" onClick={fetchEvents}>
            Refresh
          </button>
        </div>

        {message && <p className="message error">{message}</p>}

        {loadingEvents ? (
          <p className="state-text">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <h2>No events found</h2>
            <p>Create an event first to track registrations.</p>
          </div>
        ) : (
          <>
            <div className="event-selector-wrap">
              <label htmlFor="eventSelector">Select Event</label>
              <select
                id="eventSelector"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedEvent && (
              <div className="event-summary">
                <p><strong>Event:</strong> {selectedEvent.title}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Date:</strong> {new Date(selectedEvent.startDate).toLocaleDateString()}</p>
                <p><strong>Capacity:</strong> {selectedEvent.capacity}</p>
              </div>
            )}

            {loadingRegistrations ? (
              <p className="state-text">Loading registrations...</p>
            ) : registrations.length === 0 ? (
              <div className="empty-state">
                <h2>No registrations yet</h2>
                <p>Participants will appear here once they register.</p>
              </div>
            ) : (
              <div className="registration-table-wrap">
                <table className="registration-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Reg. Number</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((registration) => (
                      <tr key={registration._id}>
                        <td>{registration.student?.name || 'N/A'}</td>
                        <td>{registration.student?.email || 'N/A'}</td>
                        <td>{registration.student?.registrationNumber || registration.registrationNumber}</td>
                        <td>{registration.student?.department || registration.department}</td>
                        <td className="status-cell">{registration.status}</td>
                        <td>
                          <button
                            type="button"
                            className={`attendance-btn ${registration.attendance ? 'present' : 'absent'}`}
                            onClick={() => handleAttendance(registration._id, registration.attendance)}
                          >
                            {registration.attendance ? 'Present' : 'Mark Present'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRegistrations;
