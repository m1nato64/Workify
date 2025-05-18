import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "../../../assets/images/logo.png";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useUser } from "../../../services/context/userContext";

const Header = () => {
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const menuRef = useRef(null);
  const { user } = useUser();

  const role = user?.role;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuVisible(false);
      }
    };
    if (isProfileMenuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuVisible]);

  const toggleProfileMenu = () => {
    setIsProfileMenuVisible((v) => !v);
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
            <Link to="/freelancers">Список фрилансеров</Link>
          </div>
        </div>
        <Link to="/chat">Чаты</Link>
        <Link to="/orders">Мои заказы</Link>
      </>
    );
  } else if (role === "Freelancer") {
    navContent = (
      <>
        <Link to="/jobs">Работа</Link>
        <Link to="/chat">Чаты</Link>
        <Link to="/responses">Мои отклики</Link>
      </>
    );
  }

  return (
    <header className={styles.mainHeader}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Link to="/home" className={styles.logoLink} id="logoLink">
            <img src={logo} alt="Workify Logo" />
            <span className={styles.logoName}>Workify</span>
          </Link>
        </div>

        <nav className={styles.nav} id="headerNav">
          {navContent}
        </nav>

        <div className={styles.headerIcons} ref={menuRef} id="notificationsAndProfile">
          <div className={styles.iconBell} title="Уведомления">
            <FaBell size={25} />
          </div>
          <div
            className={styles.iconUser}
            onClick={toggleProfileMenu}
            title="Профиль"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleProfileMenu();
            }}
          >
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