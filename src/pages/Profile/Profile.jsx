// src/pages/Profile/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useUser } from '../../services/context/userContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './profile.css';

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStars = rating % 1 !== 0 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;
  let stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`full-${i}`} className="star filled">★</span>);
  }

  if (halfStars) {
    stars.push(<span key="half" className="star half">★</span>);
  }

  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} className="star">★</span>);
  }

  return stars;
};

const Profile = () => {
  const { user, updateUser } = useUser(); 
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser && currentUser !== user) {
      updateUser(currentUser);
    }
  }, [user, updateUser]);

  useEffect(() => {
    if (user) {
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="profile-container">
        <Header />
        <div className="profile-content">
          <p>Пользователь не авторизован.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const translateRole = (role) => {
    switch (role) {
      case 'Freelancer':
        return 'Фрилансер';
      case 'Client':
        return 'Клиент';
      default:
        return role;
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <div className="profile-container">
      <Header />
      <div className="profile-content">
        <h2>Профиль пользователя</h2>

        <div className="profile-avatar">
          <img
            src={avatarPreview ? `${API_URL}${avatarPreview}` : '/default-avatar.png'}
            alt="Аватар"
            className="avatar-img"
          />
        </div>

        <p><strong>Имя:</strong> {user.name}</p>
        <p><strong>Роль:</strong> {translateRole(user.role)}</p>

        {user.role === 'Freelancer' && (
          <div className="profile-skills">
            <strong>Навыки:</strong>
            <div className="skills-list">
              {(user.skills?.split(',') || []).map((skill, index) => (
                <span key={index} className="skill-badge">{skill.trim()}</span>
              ))}
            </div>
          </div>
        )}

        <div className="profile-rating">
          <strong>Рейтинг:</strong>
          <div className="rating-stars">
            {renderStars(user.rating || 0)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
