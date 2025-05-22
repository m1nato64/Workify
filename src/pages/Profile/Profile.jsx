// src/pages/Profile/Profile.jsx
import React, { useEffect, useState } from "react";
import { useUser } from "../../services/context/userContext";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import styles from "./Profile.module.css";
import { FaUserCircle } from "react-icons/fa";

const renderStars = (rating, styles) => {
  const fullStars = Math.floor(rating);
  const halfStars = rating % 1 !== 0 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;
  let stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={`full-${i}`} className={styles.star + " " + styles.starFilled}>
        ★
      </span>
    );
  }

  if (halfStars) {
    stars.push(
      <span key="half" className={styles.star + " " + styles.starHalf}>
        ★
      </span>
    );
  }

  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className={styles.star}>
        ★
      </span>
    );
  }

  return stars;
};

const Profile = () => {
  const { user, updateUser } = useUser();
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
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
      <div className={styles.profileContainer}>
        <Header />
        <div className={styles.profileContent}>
          <p>Пользователь не авторизован.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const translateRole = (role) => {
    switch (role) {
      case "Freelancer":
        return "Фрилансер";
      case "Client":
        return "Клиент";
      default:
        return role;
    }
  };

  const ratingNumber = user.rating ? Number(user.rating) : 0;

  return (
    <div className={styles.profileContainer}>
      <Header />
      <div className={styles.profileContent}>
        <h2>Профиль пользователя {user.name}</h2>

        <div className={styles.profileAvatar}>
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Аватар"
              className={styles.avatarImg}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = ""; // если ошибка — показать иконку
                setAvatarPreview(null); // сбрасываем preview
              }}
            />
          ) : (
            <FaUserCircle className={styles.avatarPlaceholder} />
          )}
        </div>

        <p>
          <strong>Имя:</strong> {user.name}
        </p>
        <p>
          <strong>Роль:</strong> {translateRole(user.role)}
        </p>

        {user.role === "Freelancer" && (
          <div className={styles.profileSkills}>
            <strong>Навыки:</strong>
            <div className={styles.skillsList}>
              {(user.skills?.split(",") || []).map((skill, index) => (
                <span key={index} className={styles.skillBadge}>
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={styles.profileRating}>
          <strong>Рейтинг:</strong>
          <div className={styles.ratingStars}>
            <span className={styles.ratingNumber}>
              {(Number(user.rating) || 0).toFixed(1)}
            </span>
            {renderStars(Number(user.rating) || 0, styles)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
