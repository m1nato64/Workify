import React from 'react';

const Header = ({ role }) => {
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
        <a href="#">Заказы</a>
        <a href="#">Чаты</a>
      </>
    );
  }

  return (
    <header id="main-header">
      <div className="header">
        <div className="logo">
          <img src="/assets/images/logo.png" alt="Workify Logo" />
          <span>Workify</span>
        </div>
        <nav>{navContent}</nav>
        <div className="header-icons">
          <div id="notification-icon" className="icon-bell">🔔</div>
          <div id="profile-icon" className="icon-user">👤</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
