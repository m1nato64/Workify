import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../../styles/global.css';
import './login.css';

const Login = () => {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log("Username:", data.user.name);
        console.log("Token:", data.token);
        console.log("Role:", data.user.role);

        navigate('/home'); // 👈 перенаправление после успешного входа
      } else {
        const errorAlert = document.getElementById("errorAlert");
        errorAlert.textContent = "Неправильные данные. Пожалуйста, проверьте логин и пароль.";
        errorAlert.classList.add("show");

        setTimeout(() => {
          errorAlert.classList.remove("show");
        }, 3000);
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      alert('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  };

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

      <div id="errorAlert" className="error-alert">
        Неправильные данные. Пожалуйста, проверьте логин и пароль.
      </div>
    </div>
  );
};

export default Login;
