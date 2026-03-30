import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ⚡ ClubSphere
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <Link to="/clubs" className="nav-link">Clubs</Link>
              </li>
              <li className="nav-item">
                <Link to="/events" className="nav-link">Events</Link>
              </li>
            </>
          )}
          {isAuthenticated && user && (
            <>
              <li className="nav-item">
                <Link to="/my-registrations" className="nav-link">My Events</Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className="nav-link">Profile</Link>
              </li>
              {(user.role === 'admin' || user.role === 'president') && (
                <>
                  <li className="nav-item admin-item">
                    <Link to="/admin/dashboard" className="nav-link admin-link">
                      🎯 Admin
                    </Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link logout-btn">
                  Logout
                </button>
              </li>
            </>
          )}
          {!isAuthenticated && (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link register-btn">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
