import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { eventService, clubService } from '../services/api';
import './CreateEvent.css';

const CreateEvent = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clubs, setClubs] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'seminar',
    startDate: '',
    startTime: '10:00',
    endDate: '',
    endTime: '12:00',
    location: '',
    capacity: 100,
    club: ''
  });

  const selectedClubId = searchParams.get('clubId') || '';

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

  // Fetch clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await clubService.getAllClubs();
        setClubs(response.data.clubs || []);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      }
    };
    
    if (!loading && isAuthenticated) {
      fetchClubs();
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (selectedClubId) {
      setFormData((prev) => ({
        ...prev,
        club: selectedClubId
      }));
    }
  }, [selectedClubId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage('');

      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const eventData = {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        startDate: startDateTime,
        endDate: endDateTime,
        location: formData.location,
        capacity: formData.capacity,
        club: formData.club,
        status: 'upcoming'
      };

      // Call API to create event
      await eventService.createEvent(eventData);

      setMessage('✅ Event created successfully!');
      setTimeout(() => {
        navigate('/admin/manage-events');
      }, 1500);

      // Reset form
      setFormData({
        title: '',
        description: '',
        eventType: 'seminar',
        startDate: '',
        startTime: '10:00',
        endDate: '',
        endTime: '12:00',
        location: '',
        capacity: 100,
        club: ''
      });
    } catch (error) {
      setMessage('❌ Error creating event: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="create-event-container"><p>Loading...</p></div>;

  if (!isAuthenticated) return null;

  return (
    <div className="create-event-container">
      <div className="create-event-content">
        <button type="button" className="page-back-btn" onClick={() => navigate('/admin/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="event-form-header">
          <h1>Create Event</h1>
          <p>Add a new event to the platform</p>
          <p style={{fontSize: '0.9em', color: '#666', marginTop: '8px'}}>
            <span style={{color: '#e74c3c', fontWeight: 'bold'}}>*</span> = Required field | Optional fields can be left blank
          </p>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form className="event-form" onSubmit={handleSubmit}>
          {/* Basic Info Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Tech Workshop 2024"
                required
              />
            </div>

            <div className="form-group">
              <label>Club</label>
              <select name="club" value={formData.club} onChange={handleChange}>
                <option value="">-- Select a Club (Optional) --</option>
                {clubs.map(club => (
                  <option key={club._id} value={club._id}>{club.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Event Type *</label>
              <select name="eventType" value={formData.eventType} onChange={handleChange}>
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
                <option value="fest">Fest</option>
                <option value="social">Social</option>
                <option value="technical">Technical</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label>Description <span style={{color: '#999', fontSize: '0.9em'}}>(Optional)</span></label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add event details, agenda, requirements... (optional)"
              rows="4"
            ></textarea>
          </div>

          {/* Location */}
          <div className="form-group full-width">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Auditorium Block-A, Room 101"
              required
            />
          </div>

          {/* Date & Time Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Start Time <span style={{color: '#999', fontSize: '0.9em'}}>(Optional)</span></label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* End Date & Time Row */}
          <div className="form-row">
            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time <span style={{color: '#999', fontSize: '0.9em'}}>(Optional)</span></label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="form-group">
            <label>Participant Capacity *</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              max="10000"
              placeholder="100"
              required
            />
            <small>Maximum number of participants allowed</small>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : '✨ Create Event'}
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/admin/dashboard')}
            >
              Cancel
            </button>
          </div>

          {/* Info Box */}
          <div className="form-info">
            <h4>📌 Event Guidelines</h4>
            <ul>
              <li>Event title should be clear and descriptive</li>
              <li>Provide detailed description with agenda</li>
              <li>Set realistic start and end dates/times</li>
              <li>Specify accurate venue location</li>
              <li>Set capacity based on venue</li>
              <li>Events will be visible to all students</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
