import React, { useState } from 'react';
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
        <a href="#">Поиск заказов</a>
        <a href="#">Чаты</a>
        <a href="#">Мои отклики</a>
      </>
    );
  }

  return (
    <header id="main-header">
      <div className="header">
        <div className="logo">
          {/* Используем импортированное изображение */}
          <img src={logo} alt="Workify Logo" />
          <span className="logo-name">Workify</span>
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

          {/* Профильное меню */}
          {isProfileMenuVisible && (
            <div className="profile-menu">
              <a href="/profile">Профиль</a>
              <a href="/settings">Настройки</a>
              <button onClick={handleLogout}>Выход</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
