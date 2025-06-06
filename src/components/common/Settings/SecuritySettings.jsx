import React, { useState, useEffect } from 'react';
import { getUserFromStorage } from '../../../services/api/authServiceClient';
import Toast from '../Toast'; 
import styles from './SecuritySettings.module.css';

const SecuritySettings = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (currentUser) {
      setUser(currentUser);
    } else {
      setToast({ message: 'Пользователь не авторизован', type: 'error' });
    }
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!user) {
      setToast({ message: 'Пользователь не найден', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`/api/profile/${user.id}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: password, newPassword: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ message: 'Пароль успешно изменен', type: 'success' });
      } else {
        setToast({ message: data.error || 'Ошибка при изменении пароля', type: 'error' });
      }
    } catch {
      setToast({ message: 'Ошибка подключения к серверу', type: 'error' });
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <form onSubmit={handleChangePassword} className={styles.form}>
        <h3 className={styles.title}>Безопасность</h3>
        <label className={styles.label}>
          Текущий пароль:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Новый пароль:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
          />
        </label>
        <button type="submit" className={styles.btn} disabled={!user}>
          Изменить пароль
        </button>
      </form>
    </>
  );
};

export default SecuritySettings;
