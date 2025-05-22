import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header-Footer/Header';
import Footer from '../../components/common/Header-Footer/Footer';
import GeneralSettings from '../../components/common/Settings/GeneralSettings';
import SecuritySettings from '../../components/common/Settings/SecuritySettings';
import DeleteAccount from '../../components/common/Settings/DeleteAccount';
import Skills from '../../components/common/Settings/SkillsSettings'; 
import { getUserFromStorage } from '../../services/api/authServiceClient'; 
import styles from './Settings.module.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'delete':
        return user ? <DeleteAccount user={user} /> : <p>Пользователь не найден</p>;
      case 'skills':
        return user && user.role === 'Freelancer' ? <Skills user={user} /> : <p>Доступно только для фрилансеров.</p>;
      default:
        return null;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); 
  };

  return (
    <>
      <Header />

      <div className={styles.settingsPage}>
        <div className={styles.burger} onClick={toggleSidebar}>☰</div>

        <aside className={`${styles.settingsSidebar} ${sidebarOpen ? styles.settingsSidebarOpen : ''}`}>
          <h2>Настройки</h2>
          <ul>
            <li
              onClick={() => handleTabClick('general')}
              className={activeTab === 'general' ? styles.settingsSidebarLiActive : ''}
            >
              Основные
            </li>
            <li
              onClick={() => handleTabClick('security')}
              className={activeTab === 'security' ? styles.settingsSidebarLiActive : ''}
            >
              Безопасность
            </li>
            {user && user.role === 'Freelancer' && (
              <li
                onClick={() => handleTabClick('skills')}
                className={activeTab === 'skills' ? styles.settingsSidebarLiActive : ''}
              >
                Навыки
              </li>
            )}
            <li
              onClick={() => handleTabClick('delete')}
              className={activeTab === 'delete' ? styles.settingsSidebarLiActive : ''}
            >
              Удаление аккаунта
            </li>
          </ul>
        </aside>

        <main className={styles.settingsContent}>
          {renderTabContent()}
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Settings;
