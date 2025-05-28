import React, { useState } from "react";
import styles from "./Register.module.css";
import Toast from "../../../components/common/Toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Freelancer");
  const [skills, setSkills] = useState([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const skillsString = role === "Client" ? "" : skills.join(", ");

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, role, skills: skillsString }),
      });

      const data = await response.json();

      if (response.ok) {
        showToastMessage("Регистрация успешна!", "success");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        showToastMessage("Ошибка: " + data.error, "error");
      }
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      showToastMessage("Ошибка сервера", "error");
    }
  };

  const handleAddSkill = () => {
    if (skillsInput && !skills.includes(skillsInput)) {
      setSkills([...skills, skillsInput]);
      setSkillsInput("");
    }
  };

  const handleRemoveSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h2>Регистрация</h2>
        <form className={styles.registerFormHadAcc} onSubmit={handleRegister}>
          <label className={styles.label}>Логин:</label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            name="username"
            autoComplete="username"
          />

          <label className={styles.label}>Пароль:</label>
          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              className={`${styles.input} ${styles.passwordInput}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              name="password"
              autoComplete="new-password"
            />
            <button
              type="button"
              aria-label="Показать пароль"
              onClick={togglePassword}
              className={styles.togglePasswordBtn}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <label className={styles.label}>Роль:</label>
          <select
            className={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            name="role"
          >
            <option value="Freelancer">Фрилансер</option>
            <option value="Client">Клиент</option>
          </select>

          {role === "Freelancer" && (
            <div
              className={`${styles.skillsContainer} ${styles.skillsContainerVisible}`}
            >
              <label className={styles.label}>Навыки:</label>
              <input
                type="text"
                className={`${styles.input} ${styles.skillsInput}`}
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Введите навык"
                name="skillInput"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className={styles.button}
              >
                Добавить навык
              </button>
              <div className={styles.skillsList}>
                {skills.map((skill, index) => (
                  <span key={index} className={styles.skillItem}>
                    {skill}{" "}
                    <span
                      className={styles.removeSkill}
                      onClick={() => handleRemoveSkill(index)}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className={styles.button}>
            Зарегистрироваться
          </button>
        </form>
        <p className={styles.hadAcc}>
          Уже есть аккаунт? <a href="/login">Войти</a>
        </p>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Register;
