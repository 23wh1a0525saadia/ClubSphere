import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Profile from './pages/Profile';
import MyRegistrations from './pages/MyRegistrations';
import AdminClubs from './pages/AdminClubs';
import AdminRegistrations from './pages/AdminRegistrations';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import EventManagement from './pages/EventManagement';

import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/clubs" element={
            <PrivateRoute>
              <Clubs />
            </PrivateRoute>
          } />
          <Route path="/clubs/:id" element={
            <PrivateRoute>
              <ClubDetail />
            </PrivateRoute>
          } />
          <Route path="/events" element={
            <PrivateRoute>
              <Events />
            </PrivateRoute>
          } />
          <Route path="/events/:id" element={
            <PrivateRoute>
              <EventDetail />
            </PrivateRoute>
          } />
          
          {/* Protected routes */}
          <Route path="/my-registrations" element={
            <PrivateRoute>
              <MyRegistrations />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <RoleRoute allowedRoles={['admin', 'president']}>
              <AdminDashboard />
            </RoleRoute>
          } />

          <Route path="/admin/create-event" element={
            <RoleRoute allowedRoles={['admin', 'president']}>
              <CreateEvent />
            </RoleRoute>
          } />

          <Route path="/admin/manage-events" element={
            <RoleRoute allowedRoles={['admin', 'president']}>
              <EventManagement />
            </RoleRoute>
          } />

          <Route path="/admin/manage-clubs" element={
            <RoleRoute allowedRoles={['admin', 'president']}>
              <AdminClubs />
            </RoleRoute>
          } />

          <Route path="/admin/view-registrations" element={
            <RoleRoute allowedRoles={['admin', 'president']}>
              <AdminRegistrations />
            </RoleRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
