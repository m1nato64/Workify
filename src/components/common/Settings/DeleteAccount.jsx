import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../Toast'; 
import './deleteAccount.css';

const DeleteAccount = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null); 

  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleDelete = async () => {
    if (!user) {
      showToast('Пользователь не авторизован!', 'error');
      return;
    }

    if (!password.trim()) {
      showToast('Введите пароль для подтверждения удаления', 'error');
      return;
    }

    const userId = user.id;

    try {
      const response = await fetch(`http://localhost:3000/api/profile/${userId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        showToast('Аккаунт успешно удалён');
        localStorage.clear();
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorData = await response.json();
        showToast('Ошибка: ' + errorData.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Произошла ошибка при удалении аккаунта', 'error');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="delete-account-settings">
      <h2 className="delete-account-title">Удаление аккаунта</h2>
      <p className="delete-account-info">Вы навсегда удалите свой аккаунт и все связанные данные.</p>
      <button className="delete-account-btn" onClick={() => setIsModalOpen(true)}>
        Удалить аккаунт
      </button>

      {isModalOpen && (
        <div className="delete-account-modal">
          <div className="delete-account-modal-content">
            <h4 className="delete-account-modal-title">Подтверждение удаления</h4>
            <p className="delete-account-modal-info">Введите пароль для подтверждения:</p>
            <input
              type="password"
              className="delete-account-input"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="delete-account-modal-actions">
              <button className="delete-account-confirm-btn" onClick={handleDelete}>
                Подтвердить
              </button>
              <button className="delete-account-cancel-btn" onClick={() => setIsModalOpen(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DeleteAccount;
