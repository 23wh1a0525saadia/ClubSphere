import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUserById: (id) => api.get(`/auth/${id}`),
  getAllUsers: () => api.get('/auth')
};

// Club Service
export const clubService = {
  getAllClubs: (category) => api.get('/clubs', { params: { category } }),
  getClubById: (id) => api.get(`/clubs/${id}`),
  createClub: (data) => api.post('/clubs', data),
  updateClub: (id, data) => api.put(`/clubs/${id}`, data),
  deleteClub: (id) => api.delete(`/clubs/${id}`),
  joinClub: (id) => api.post(`/clubs/${id}/join`),
  leaveClub: (id) => api.post(`/clubs/${id}/leave`)
};

// Event Service
export const eventService = {
  getAllEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getEventsByClub: (clubId) => api.get(`/events/club/${clubId}`)
};

// Registration Service
export const registrationService = {
  registerForEvent: (eventId) => api.post(`/registrations/${eventId}`),
  getUserRegistrations: () => api.get('/registrations/me/registrations'),
  getEventRegistrations: (eventId) => api.get(`/registrations/event/${eventId}`),
  markAttendance: (registrationId, attendance) => api.put(`/registrations/${registrationId}/attendance`, { attendance }),
  cancelRegistration: (registrationId) => api.delete(`/registrations/${registrationId}`),
  submitFeedback: (registrationId, data) => api.put(`/registrations/${registrationId}/feedback`, data)
};

// Announcement Service
export const announcementService = {
  getAllAnnouncements: (params) => api.get('/announcements', { params }),
  getAnnouncementById: (id) => api.get(`/announcements/${id}`),
  createAnnouncement: (data) => api.post('/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
  likeAnnouncement: (id) => api.post(`/announcements/${id}/like`),
  addComment: (id, data) => api.post(`/announcements/${id}/comment`, data)
};

// Stats Service
export const statsService = {
  getSummaryStats: () => api.get('/stats/summary')
};

export default api;
