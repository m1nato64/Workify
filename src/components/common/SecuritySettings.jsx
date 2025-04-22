import React, { useState, useEffect } from 'react';
import { getUserFromStorage } from '../../services/api/authServiceClient';

const SecuritySettings = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (currentUser) {
      setUser(currentUser);
    } else {
      setError('Пользователь не авторизован');
    }
  }, []); // Выполняется только при монтировании компонента

  // Обработчик смены пароля
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('Пользователь не найден');
      return;
    }

    try {
      // Отправляем запрос на сервер для смены пароля
      const response = await fetch(`/api/profile/${user.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: password,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Пароль успешно изменен');
        setError('');
      } else {
        setError(data.error || 'Произошла ошибка при изменении пароля');
        setMessage('');
      }
    } catch (err) {
      setError('Произошла ошибка при подключении к серверу');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleChangePassword}>
      <h3>Безопасность</h3>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <label>
        Текущий пароль:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label>
        Новый пароль:
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </label>
      <button type="submit" disabled={!user}>Изменить пароль</button>
    </form>
  );
};

export default SecuritySettings;
