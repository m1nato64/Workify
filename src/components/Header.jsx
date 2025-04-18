import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Для маршрутизации
import './Header.css';
import logo from '../assets/images/logo.png';

const Header = ({ role }) => {
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  const toggleProfileMenu = () => {
    setIsProfileMenuVisible(!isProfileMenuVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  let navContent;

  if (role === "Client") {
    navContent = (
      <>
        <div className="dropdown">
          <button className="dropbtn">Фрилансеры ▾</button>
          <div className="dropdown-content">
            <a href="#">Список фрилансеров</a>
          </div>
        </div>
        <a href="#">Чаты</a>
        <a href="#">Мои заказы</a>
      </>
    );
  } else if (role === "Freelancer") {
    navContent = (
      <>
        <a href="#">Работа</a>
        <a href="#">Чаты</a>
        <a href="/responses">Мои отклики</a>
      </>
    );
  }

  return (
    <header id="main-header">
      <div className="header">
        <div className="logo">
          <Link to="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={logo} alt="Workify Logo" />
            <span className="logo-name">Workify</span>
          </Link>
        </div>

        <nav>{navContent}</nav>

        <div className="header-icons">
          <div id="notification-icon" className="icon-bell">🔔</div>

          <div
            id="profile-icon"
            className="icon-user"
            onClick={toggleProfileMenu}
            style={{ cursor: 'pointer' }}
          >
            👤
          </div>

          {isProfileMenuVisible && (
            <div className="profile-menu">
              <Link to="/profile">Профиль</Link>
              <Link to="/settings">Настройки</Link>
              <button onClick={handleLogout}>Выход</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
