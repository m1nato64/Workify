import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaProjectDiagram, FaClipboardList, FaChartBar } from 'react-icons/fa';
import styles from './Main.module.css';

const MainAdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Панель администратора</h1>
      <div className={styles.cards}>
        <div className={styles.card} onClick={() => navigate('/admin/users')}>
          <FaUsers className={styles.icon} />
          <h2>Управление пользователями</h2>
          <p>Просмотр, поиск и удаление пользователей</p>
        </div>
        <div className={styles.card} onClick={() => navigate('/admin/projects')}>
          <FaProjectDiagram className={styles.icon} />
          <h2>Управление проектами</h2>
          <p>Просмотр, редактирование и удаление проектов</p>
        </div>
        <div className={styles.card} onClick={() => navigate('/admin/logs')}>
          <FaClipboardList className={styles.icon} />
          <h2>Логи администратора</h2>
          <p>Просмотр действий администратора</p>
        </div>
        <div className={styles.card} onClick={() => navigate('/admin/stats')}>
          <FaChartBar className={styles.icon} />
          <h2>Статистика сайта</h2>
          <p>Общая статистика пользователей и проектов</p>
        </div>
      </div>
    </div>
  );
};

export default MainAdminPage;
