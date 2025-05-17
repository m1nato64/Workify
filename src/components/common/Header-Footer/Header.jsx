import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "../../../assets/images/logo.png";
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { getUserFromStorage } from "../../../services/api/authServiceClient";

const Header = () => {
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (currentUser) {
      setRole(currentUser.role);
    }
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuVisible(!isProfileMenuVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  let navContent;
  if (role === "Client") {
    navContent = (
      <>
        <div className={styles.dropdown}>
          <button className={styles.dropbtn}>Фрилансеры ▾</button>
          <div className={styles.dropdownContent}>
            <a href="#">Список фрилансеров</a>
          </div>
        </div>
        <a href="/chat">Чаты</a>
        <a href="/orders">Мои заказы</a>
      </>
    );
  } else if (role === "Freelancer") {
    navContent = (
      <>
        <a href="#">Работа</a>
        <a href="/chat">Чаты</a>
        <a href="/responses">Мои отклики</a>
      </>
    );
  }

  return (
    <header className={styles.mainHeader}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Link to="/home" className={styles.logoLink}>
            <img src={logo} alt="Workify Logo" />
            <span className={styles.logoName}>Workify</span>
          </Link>
        </div>

        <nav className={styles.nav}>{navContent}</nav>

        <div className={styles.headerIcons}>
          <div className={styles.iconBell}>
            <FaBell size={25} />
          </div>
          <div className={styles.iconUser} onClick={toggleProfileMenu}>
            <FaUserCircle size={25} />
          </div>

          {isProfileMenuVisible && (
            <div className={styles.profileMenu}>
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
