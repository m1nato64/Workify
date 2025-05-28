import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "../../../assets/images/logo.png";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useUser } from "../../../services/context/userContext";
import { useSocket } from "../../../services/context/socketContext";
import Tutorial from "../Tutorial/Tutorial";
import axios from "axios";

const Header = () => {
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isBellAnimated, setIsBellAnimated] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);

  const menuRef = useRef(null);
  const { user } = useUser();
  const role = user?.role;
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !socket) return;

    socket.emit("register", user.id);

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setIsBellAnimated(true);

      setTimeout(() => {
        setIsBellAnimated(false);
      }, 1000);
    });

    axios
      .get(`/api/notifications/unread/${user.id}`)
      .then((res) => {
        setNotifications(res.data);
      })
      .catch((err) => {
        console.error("Ошибка при загрузке уведомлений:", err);
      });

    return () => {
      socket.off("notification");
    };
  }, [user, socket]);

  // Фильтрация уведомлений
  const messageNotifications = useMemo(
    () => notifications.filter((n) => n.type === "new_message"),
    [notifications]
  );

  const projectInvitationNotifications = useMemo(
    () => notifications.filter((n) => n.type === "project_invitation"),
    [notifications]
  );

  const bidNotifications = useMemo(() => {
    const bids = notifications.filter((n) => n.type === "new_bid");

    const grouped = bids.reduce((acc, n) => {
      const projectId = n.data?.projectId;
      const projectTitle = n.data?.projectTitle || "Проект";
      if (!projectId) return acc;

      if (!acc[projectId]) {
        acc[projectId] = { count: 0, title: projectTitle };
      }
      acc[projectId].count += 1;
      return acc;
    }, {});

    return grouped;
  }, [notifications]);

  const bidStatusNotifications = useMemo(
    () => notifications.filter((n) => n.type === "bid_status_update"),
    [notifications]
  );

  const reviewNotifications = useMemo(
    () => notifications.filter((n) => n.type === "new_review"),
    [notifications]
  );

  const unreadMessagesCount = messageNotifications.length;

  const totalBidCount = Object.values(bidNotifications).reduce(
    (sum, b) => sum + b.count,
    0
  );

  const hasAnyNotifications = notifications.length > 0;

  const toggleProfileMenu = () => {
    setIsProfileMenuVisible((v) => !v);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications((v) => !v);
    setIsProfileMenuVisible(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`/api/notifications/read/all/${user.id}`);
      setNotifications([]);
    } catch (err) {
      console.error("Ошибка при пометке уведомлений как прочитанные:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowNotifications(false);
        setIsProfileMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  } else if (role === "Admin") {
    navContent = (
      <>
        <Link to="/chat">Чат поддержки</Link>
      </>
    );
  }

  const startTutorial = () => {
    setCurrentStep(0);
    setIsProfileMenuVisible(false);
    setShowNotifications(false);
  };

  const closeTutorial = () => {
    setCurrentStep(null);
  };

  return (
    <>
      <header className={styles.mainHeader}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Link id="logoLink" to="/home" className={styles.logoLink}>
              <img src={logo} alt="Workify Logo" />
              <span className={styles.logoName}>Workify</span>
            </Link>
          </div>

          <nav id="headerNav" className={styles.nav}>
            {navContent}
          </nav>

          <div
            id="notificationsAndProfile"
            className={styles.headerIcons}
            ref={menuRef}
          >
            {/* Иконка уведомлений */}
            <div
              className={`${styles.iconBell} ${
                isBellAnimated ? styles.bellShake : ""
              }`}
              onClick={toggleNotifications}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleNotifications();
              }}
              aria-label="Уведомления"
            >
              <FaBell size={25} />
              {notifications.length > 0 && (
                <span className={styles.notificationBadge}>
                  {notifications.length}
                </span>
              )}
            </div>

            {/* Dropdown уведомлений */}
            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.notificationHeader}>
                  <strong>Уведомления</strong>
                  {hasAnyNotifications && (
                    <button
                      className={styles.markAllRead}
                      onClick={markAllAsRead}
                      type="button"
                    >
                      Пометить все как прочитанные
                    </button>
                  )}
                </div>

                {!hasAnyNotifications ? (
                  <div className={styles.noNotifications}>
                    Нет новых уведомлений
                  </div>
                ) : (
                  <ul className={styles.notificationList}>
                    {/* Сообщения */}
                    {unreadMessagesCount > 0 && (
                      <li
                        className={styles.notificationItem}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          navigate("/chat");
                          setShowNotifications(false);
                        }}
                      >
                        Новое непрочитанное сообщение! ({unreadMessagesCount})
                      </li>
                    )}

                    {reviewNotifications.length > 0 &&
                      reviewNotifications.map((notification) => {
                        const { projectId, contentPreview, message, rating } =
                          notification.data || {};
                        return (
                          <li
                            key={notification.id}
                            className={styles.notificationItem}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              navigate("/profile");
                              setShowNotifications(false);
                            }}
                          >
                            📝{" "}
                            {message ||
                              `Вы получили отзыв по проекту #${projectId}`}{" "}
                            — Оценка: {rating}⭐
                            <br />
                            <span style={{ fontSize: "0.9em", color: "#666" }}>
                              "{contentPreview}..."
                            </span>
                          </li>
                        );
                      })}

                    {/* Отклики по проектам */}
                    {Object.entries(bidNotifications).map(
                      ([projectId, { count, title }]) => (
                        <li key={projectId} className={styles.notificationItem}>
                          Новый отклик на проект "{title}" ({count})
                        </li>
                      )
                    )}

                    {/* Приглашения на проект */}
                    {projectInvitationNotifications.length > 0 &&
                      projectInvitationNotifications.map((notification) => {
                        const { projectTitle } = notification.data || {};
                        return (
                          <li
                            key={notification.id}
                            className={styles.notificationItem}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              // Навигация с параметром search
                              navigate(
                                `/jobs?search=${encodeURIComponent(
                                  projectTitle || ""
                                )}`
                              );
                              setShowNotifications(false);
                            }}
                          >
                            📩 {`Вас пригласили на проект "${projectTitle}"`}
                          </li>
                        );
                      })}

                    {/* Статусы откликов */}
                    {bidStatusNotifications.length > 0 && (
                      <>
                        <li
                          className={styles.notificationItem}
                          style={{ fontWeight: "bold" }}
                        >
                          Статус ваших откликов:
                        </li>
                        {bidStatusNotifications.map((notification) => {
                          const { status, message } = notification.data || {};
                          return (
                            <li
                              key={notification.id}
                              className={styles.notificationItem}
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                navigate("/responses");
                                setShowNotifications(false);
                              }}
                            >
                              {message || `Ваш отклик был ${status}`}
                            </li>
                          );
                        })}
                      </>
                    )}
                  </ul>
                )}
              </div>
            )}

            {/* Иконка профиля */}
            <div
              className={styles.iconUser}
              onClick={toggleProfileMenu}
              title="Профиль"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleProfileMenu();
              }}
              aria-label="Профиль"
            >
              <FaUserCircle size={25} />
            </div>

            {/* Меню профиля */}
            {isProfileMenuVisible && (
              <div className={styles.profileMenu}>
                <Link
                  to="/profile"
                  onClick={() => setIsProfileMenuVisible(false)}
                >
                  Профиль
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsProfileMenuVisible(false)}
                >
                  Настройки
                </Link>

                <button onClick={handleLogout} type="button">
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Туториал */}
      {currentStep !== null && (
        <Tutorial step={currentStep} onClose={closeTutorial} />
      )}
    </>
  );
};

export default Header;
