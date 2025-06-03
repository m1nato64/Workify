import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png"; // путь подкорректируйте под свой проект
import styles from "./Landing.module.css";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles["logo-wrapper"]}>
        <img src={logo} alt="Логотип" className={styles["logo-inner"]} />
      </div>

      <div className={styles.textContent}>
        <h1 className={styles.title}>Добро пожаловать на фриланс биржу Workify!</h1>
        <p className={styles.subtitle}>
          Найдите лучших исполнителей для своих проектов или выполняйте заказы клиентов!
        </p>
        <p className={styles.subtitle}>
          Вы можете начать прямо сейчас, но сперва необходимо авторизоваться.
        </p>
      </div>

      <div className={styles.buttonsWrapper}>
        <button
          className={styles.actionButton}
          onClick={() => navigate("/login")}
        >
          Вход
        </button>

        <button
          className={styles.actionButton}
          onClick={() => navigate("/register")}
        >
          Регистрация
        </button>
      </div>
    </div>
  );
};

export default Landing;
