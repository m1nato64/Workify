import React, { useEffect, useState } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { getUserFromStorage, getToken } from '../../services/api/authServiceClient';
import './profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

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

  return (
    <div className="profile-container">
      <Header />
      <div className="profile-content">
        <h2>Профиль пользователя</h2>
        <p><strong>Имя:</strong> {user.name}</p>
        <p><strong>Роль:</strong> {user.role}</p>
        {user.role === 'Freelancer' && (
          <p><strong>Навыки:</strong> {user.skills || 'Нет указанных навыков'}</p>
        )}
        <p><strong>Рейтинг:</strong> {user.rating ?? 'Нет рейтинга'}</p>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
