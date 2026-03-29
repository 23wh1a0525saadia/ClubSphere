import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clubService } from '../services/api';
import './Clubs.css';

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['academic', 'cultural', 'sports', 'technical', 'social', 'professional'];

  useEffect(() => {
    fetchClubs();
  }, [selectedCategory]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await clubService.getAllClubs(selectedCategory);
      setClubs(response.data.clubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clubs-page">
      <div className="clubs-header">
        <h1>Campus Clubs</h1>
        <p>Join clubs that match your interests</p>
      </div>

      <div className="clubs-container">
        <div className="filter-section">
          <h3>Filter by Category</h3>
          <div className="filter-buttons">
            <button
              className={!selectedCategory ? 'active' : ''}
              onClick={() => setSelectedCategory('')}
            >
              All Clubs
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={selectedCategory === cat ? 'active' : ''}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="clubs-list">
          {loading ? (
            <p>Loading clubs...</p>
          ) : clubs.length > 0 ? (
            <div className="clubs-grid-full">
              {clubs.map(club => (
                <div key={club._id} className="club-card-full">
                  {club.logo && <img src={club.logo} alt={club.name} className="club-logo" />}
                  <div className="club-info">
                    <h2>{club.name}</h2>
                    <p className="club-category">{club.category}</p>
                    <p className="club-desc">{club.description}</p>
                    <div className="club-stats">
                      <span>👥 {club.memberCount} members</span>
                      <span>📅 {club.events?.length || 0} events</span>
                    </div>
                    <Link to={`/clubs/${club._id}`} className="btn btn-primary">View Club</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No clubs found in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clubs;
