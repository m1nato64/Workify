import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUser } from "../../../services/context/userContext";

const Login = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser(); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setErrorVisible(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        updateUser(data.user);

        const tutorialKey = `tutorialShown_${data.user.id}`;
        if (!localStorage.getItem(tutorialKey)) {
          localStorage.setItem("showTutorial", "true");
        } else {
          localStorage.removeItem("showTutorial");
        }

        navigate("/home");
      } else {
        setErrorVisible(true);
        setTimeout(() => setErrorVisible(false), 3000);
      }
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      alert("Ошибка сервера. Пожалуйста, попробуйте позже.");
    }
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authContainer}>
        <h2 className={styles.title}>Вход</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Имя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            className={styles.input}
            required
          />
          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              className={styles.input}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              onClick={togglePassword}
              className={styles.togglePasswordBtn}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" className={styles.submitBtn}>
            Войти
          </button>
        </form>

        <p className={styles.noAccount}>
          Нет аккаунта? <a href="/register">Регистрация</a>
        </p>

        <div
          className={`${styles.errorAlert} ${errorVisible ? styles.show : ""}`}
          role="alert"
        >
          Неправильные данные. Пожалуйста, проверьте логин и пароль.
        </div>
      </div>
    </div>
  );
};

export default Login;
