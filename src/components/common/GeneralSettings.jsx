import React, { useState, useEffect } from 'react';
import { useUser } from '../../services/context/userContext'; // Импортируем контекст

const GeneralSettings = () => {
  const { user, updateUser } = useUser(); // Используем контекст для получения и обновления пользователя
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleNameChange = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/profile/${user.id}/update-name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const data = await response.json();
        updateUser({ ...user, name }); // Обновляем имя в контексте
        setSuccessMessage('Имя пользователя успешно обновлено');
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при обновлении имени');
      }
    } catch (err) {
      setError('Произошла ошибка при обновлении имени');
    }
  };

  const handleAvatarChange = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      const response = await fetch(`/api/profile/${user.id}/update-avatar`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        updateUser({ ...user, avatar: data.avatar }); // Обновляем аватар в контексте
        setSuccessMessage('Аватар успешно обновлен');
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при обновлении аватара');
      }
    } catch (err) {
      setError('Произошла ошибка при обновлении аватара');
    }
  };

  return (
    <div className="general-settings-container">
      <h2>Настройки аккаунта</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleNameChange}>
        <label>
          Имя:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button type="submit">Изменить имя</button>
      </form>

      <form onSubmit={handleAvatarChange}>
        <label>
          Изменить аватар:
          <input
            type="file"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
        </label>
        <button type="submit">Обновить аватар</button>
      </form>
    </div>
  );
};

export default GeneralSettings;
