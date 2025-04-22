// src/components/common/DeleteAccount.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate

const DeleteAccount = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Инициализируем navigate

  const handleDelete = async () => {
    if (!user) {
      alert('Пользователь не авторизован!');
      return;
    }

    const userId = user.id;

    try {
      const response = await fetch(`http://localhost:3000/api/profile/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        localStorage.clear(); // Очищаем локальное хранилище
        alert('Аккаунт удален');
        navigate('/login'); 
      } else {
        const errorData = await response.json();
        alert('Ошибка: ' + errorData.error);
      }
    } catch (err) {
      console.error(err);
      alert('Произошла ошибка при удалении аккаунта');
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <h3>Удаление аккаунта</h3>
      <p>Вы навсегда удалите свой аккаунт и все связанные данные.</p>
      <button onClick={() => setIsModalOpen(true)}>Удалить аккаунт</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h4>Подтверждение удаления</h4>
            <p>Введите пароль для подтверждения:</p>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleDelete}>Подтвердить</button>
              <button onClick={() => setIsModalOpen(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccount;
