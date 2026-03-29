import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Clubs from './pages/Clubs';
import Events from './pages/Events';

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
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/events" element={<Events />} />
          
          {/* Protected routes */}
          <Route path="/my-registrations" element={
            <PrivateRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>My Event Registrations</h1>
                <p>Coming soon...</p>
              </div>
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>My Profile</h1>
                <p>Coming soon...</p>
              </div>
            </PrivateRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Dashboard</h1>
                <p>Coming soon...</p>
              </div>
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
