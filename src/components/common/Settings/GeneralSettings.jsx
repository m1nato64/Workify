import React, { useState, useEffect } from 'react';
import { useUser } from '../../../services/context/userContext';
import Toast from '../Toast'; // импорт тоста
import './general.css';

const GeneralSettings = () => {
  const { user, updateUser } = useUser();
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
        updateUser({ ...user, name });
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
        updateUser({ ...user, avatar: data.avatar });
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
      <h2 className="general-settings-title">Настройки аккаунта</h2>

      {error && (
        <Toast message={error} type="error" onClose={() => setError('')} />
      )}
      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage('')}
        />
      )}

      <form className="general-settings-form" onSubmit={handleNameChange}>
        <label className="general-settings-label">
          Имя:
          <input
            type="text"
            className="general-settings-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button type="submit" className="general-settings-btn">
          Изменить имя
        </button>
      </form>

      <form className="general-settings-form" onSubmit={handleAvatarChange}>
        <label className="general-settings-label">
          Изменить аватар:
          <input
            type="file"
            className="general-settings-input-file"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
        </label>
        <button type="submit" className="general-settings-btn">
          Обновить аватар
        </button>
      </form>
    </div>
  );
};

export default GeneralSettings;
