import React, { useState, useEffect } from 'react';
import '../../../styles/global.css'
import './login.css';

const Login = () => {
  // Состояния для хранения значений формы и ошибок
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // состояние для показа/скрытия пароля
  const [error, setError] = useState('');

  // Обработчик формы авторизации
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка на пустые поля
    if (!username || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Сохраняем токен и данные пользователя в localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // Добавляем данные пользователя
        window.location.href = '/main'; // Перенаправление на главную
      } else {
        // Показать кастомное уведомление об ошибке
        const errorAlert = document.getElementById("errorAlert");
        errorAlert.textContent = "Неправильные данные. Пожалуйста, проверьте логин и пароль."; // Сообщение ошибки

        errorAlert.classList.add("show"); // Показываем ошибку

        // Скрыть ошибку через 3 секунды
        setTimeout(() => {
          errorAlert.classList.remove("show"); // Скрываем ошибку
        }, 3000);
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      alert('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  };

  // Обработчик клика для показа/скрытия пароля
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="username"
          placeholder="Имя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="off"
        />
        <div className="password-container">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="off"
          />
          <button
            type="button"
            id="togglePassword"
            aria-label="Показать пароль"
            onClick={togglePassword}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <button type="submit">Войти</button>
      </form>

      <p className="no-account">
        Нет аккаунта? <a href="/register">Регистрация</a>
      </p>

      {/* Кастомное уведомление об ошибке */}
      <div id="errorAlert" className="error-alert">
        Неправильные данные. Пожалуйста, проверьте логин и пароль.
      </div>
    </div>
  );
};

export default Login;
